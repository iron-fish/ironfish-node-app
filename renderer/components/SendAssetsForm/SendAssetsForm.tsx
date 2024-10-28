import { Container, HStack, Skeleton, VStack, chakra } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, FormProvider } from "react-hook-form";
import { defineMessages, useIntl } from "react-intl";

import { TRPCRouterOutputs, trpcReact } from "@/providers/TRPCProvider";
import { COLORS } from "@/ui/colors";
import { Combobox } from "@/ui/Forms/Combobox/Combobox";
import { RenderError } from "@/ui/Forms/FormField/FormField";
import { Select } from "@/ui/Forms/Select/Select";
import { TextInput } from "@/ui/Forms/TextInput/TextInput";
import { PillButton } from "@/ui/PillButton/PillButton";
import { CurrencyUtils } from "@/utils/currency";
import { asQueryString } from "@/utils/parseRouteQuery";
import { normalizeTransactionData } from "@/utils/transactionUtils";
import { truncateString } from "@/utils/truncateString";

import { ConfirmLedgerModal } from "./ConfirmLedgerModal/ConfirmLedgerModal";
import { ConfirmTransactionModal } from "./ConfirmTransactionModal/ConfirmTransactionModal";
import FeeGridSelector from "./SharedConfirmSteps/FeeGridSelector/FeeGridSelector";
import MemoInput from "./SharedConfirmSteps/MemoInput/MemoInput";
import {
  TransactionData,
  TransactionFormData,
  createTransactionSchema,
} from "./transactionSchema";
import { AssetAmountInput } from "../AssetAmountInput/AssetAmountInput";
import {
  AssetOptionType,
  normalizeAmountInputChange,
  useAccountAssets,
} from "../AssetAmountInput/utils";
import { NoSpendingAccountsMessage } from "../EmptyStateMessage/shared/NoSpendingAccountsMessage";
import { LedgerChip } from "../LedgerChip/LedgerChip";
import {
  AccountSyncingMessage,
  ChainSyncingMessage,
} from "../SyncingMessages/SyncingMessages";

const messages = defineMessages({
  fromLabel: {
    defaultMessage: "From",
  },
  toLabel: {
    defaultMessage: "To",
  },
  assetLabel: {
    defaultMessage: "Asset",
  },
  amountLabel: {
    defaultMessage: "Amount",
  },
  sendAssetButton: {
    defaultMessage: "Send Asset",
  },
  nextButton: {
    defaultMessage: "Next",
  },
  insufficientFundsError: {
    defaultMessage:
      "The selected account does not have enough funds to send this transaction",
  },
  available: {
    defaultMessage: "available",
  },
  finalizingTransactionError: {
    defaultMessage: "Something went wrong finalizing your transaction",
  },
});

// Todo: This should be named better to differentiate between `transactionData`, `transactionFormData` and `pendingTransactionData`
// "transactionFormData" - the data from the form and has string fields for the fee + a customFee field
// "transactionData" - what is sent to create a transaction: the function normalizeTransactionData takes in the form data and returns this
// "pendingTransactionData" - a superset of transactionData that includes the full selected account and asset objects which are used to contextualize the UI in the multisig flow
export type PendingTransactionData = {
  transactionData: TransactionData;
  selectedAccount: TRPCRouterOutputs["getAccounts"][number];
  selectedAsset: AssetOptionType;
};

export function SendAssetsFormContent({
  sendButtonText,
  accountsData,
  defaultToAddress,
  onNextButton,
  isMultisig,
}: {
  sendButtonText?: string;
  accountsData: TRPCRouterOutputs["getAccounts"];
  defaultToAddress?: string | null;
  onNextButton?: (pendingTransactionData: PendingTransactionData) => void;
  isMultisig?: boolean;
}) {
  const router = useRouter();
  const { formatMessage } = useIntl();

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const accountOptions = useMemo(() => {
    return accountsData.map((account) => {
      return {
        label: account.name,
        value: account.name,
        icon: account.isLedger ? <LedgerChip /> : null,
      };
    });
  }, [accountsData]);

  const defaultAccount = useMemo(() => {
    const queryMatch = accountOptions.find(
      (option) => option.value === router.query.account,
    );
    return queryMatch ? queryMatch.value : accountOptions[0]?.value;
  }, [accountOptions, router.query.account]);

  const defaultAssetId = accountsData[0].balances.iron.asset.id;

  const transactionSchema = useMemo(
    () => createTransactionSchema(formatMessage),
    [formatMessage],
  );

  const formMethods = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    mode: "onBlur",
    defaultValues: {
      amount: "0",
      fromAccount: defaultAccount,
      toAccount: defaultToAddress ?? "",
      assetId: defaultAssetId,
      fee: "average",
      customFee: "",
    },
  });

  const {
    formState: { errors },
    watch,
    clearErrors,
    resetField,
    setValue,
    setError,
    register,
    trigger,
    control,
  } = formMethods;

  const fromAccountValue = watch("fromAccount");
  const assetIdValue = watch("assetId");
  const amountValue = watch("amount");
  const toAccountValue = watch("toAccount");

  useEffect(() => {
    // If the 'assetId' changes, reset the 'amount' field
    // to prevent issues if there is a mismatch in decimals
    // between two assets.
    const _unused = assetIdValue;
    resetField("amount");
  }, [resetField, assetIdValue]);

  const selectedAccount = useMemo(() => {
    return (
      accountsData.find((account) => account.name === fromAccountValue) ??
      accountsData[0]
    );
  }, [accountsData, fromAccountValue]);

  const { accountBalances, assetOptions, assetOptionsMap } = useAccountAssets(
    selectedAccount,
    {
      balanceInLabel: false,
    },
  );

  const assetAmountToSend = useMemo(() => {
    const assetToSend = assetOptionsMap.get(assetIdValue);
    if (!assetToSend) {
      return 0n;
    }

    const [amountToSend, conversionError] = CurrencyUtils.tryMajorToMinor(
      amountValue.toString(),
      assetIdValue,
      assetToSend.asset.verification,
    );

    if (conversionError) {
      return 0n;
    }

    return amountToSend;
  }, [amountValue, assetIdValue, assetOptionsMap]);

  const { data: estimatedFeesData, error: _estimatedFeesError } =
    trpcReact.getEstimatedFees.useQuery(
      {
        accountName: fromAccountValue,
        outputs: [
          {
            amount: assetAmountToSend.toString(),
            assetId: assetIdValue,
            memo: "",
            // For fee estimation, the actual address of the recipient is not important, is just has to be
            // a valid address. Therefore, we're just going to use the address of the first account.
            publicAddress: accountsData[0].address,
          },
        ],
      },
      {
        retry: false,
        enabled:
          Number(amountValue) > 0 &&
          !errors.amount &&
          !errors.toAccount &&
          !errors.assetId,
      },
    );

  const { data: isAccountSynced } = trpcReact.isAccountSynced.useQuery(
    {
      account: fromAccountValue,
    },
    {
      refetchInterval: 5000,
    },
  );
  const { data: nodeStatusData } = trpcReact.getStatus.useQuery(undefined, {
    refetchInterval: 5000,
  });
  const syncingMessage = useMemo(() => {
    if (nodeStatusData?.blockchain.synced === false) {
      return <ChainSyncingMessage mb={4} />;
    }
    if (isAccountSynced?.synced === false) {
      return <AccountSyncingMessage mb={4} />;
    }
    return null;
  }, [isAccountSynced, nodeStatusData?.blockchain.synced]);

  // Resets asset field to $IRON if a newly selected account does not have the selected asset
  useEffect(() => {
    if (!Object.hasOwn(accountBalances, assetIdValue)) {
      resetField("assetId");
    }
  }, [assetIdValue, resetField, selectedAccount, accountBalances]);

  const { data: contactsData } = trpcReact.getContacts.useQuery();
  const { data: allAccountsData } = trpcReact.getAccounts.useQuery();

  const formattedContacts = useMemo(() => {
    const contacts = contactsData?.map((contact) => ({
      value: contact.address,
      label: {
        main: contact.name,
        sub: truncateString(contact.address, 2),
      },
    }));

    const accounts = allAccountsData?.map((account) => ({
      value: account.address,
      label: {
        main: account.name,
        sub: truncateString(account.address, 2),
      },
    }));

    return [...(contacts ?? []), ...(accounts ?? [])];
  }, [contactsData, allAccountsData]);

  const selectedAsset = useMemo(() => {
    // Accounts always have $IRON as an asset
    return assetOptionsMap.get(assetIdValue) || assetOptions[0];
  }, [assetIdValue, assetOptionsMap, assetOptions]);

  const canAffordTransaction = () => {
    const currentBalance = Number(accountBalances[assetIdValue].confirmed);
    if (currentBalance < assetAmountToSend) {
      setError("amount", {
        type: "custom",
        message: formatMessage(messages.insufficientFundsError),
      });
      return false;
    }
    return true;
  };

  const isSingleSignerValid = async () => {
    if (!canAffordTransaction()) {
      return false;
    }
    // We only check these inputs since single signer has a second step with form inputs
    const validInputs = await trigger(["amount", "toAccount", "assetId"], {
      shouldFocus: true,
    });

    return validInputs;
  };

  const isMultisigValid = async () => {
    const hasInfoForEstimating = await trigger([
      "amount",
      "toAccount",
      "assetId",
    ]);

    if (!canAffordTransaction()) {
      return false;
    }

    if (!estimatedFeesData && hasInfoForEstimating) {
      setError("root.serverError", {
        type: "custom",
        message: "Something went wrong estimating transaction fees",
      });
      return false;
    }

    // Check all form inputs
    const hasValidForm = await trigger();

    return hasValidForm && !!estimatedFeesData;
  };

  return (
    <>
      {syncingMessage}
      <FormProvider {...formMethods}>
        <chakra.form>
          <Container
            _dark={{
              bg: "inherit",
              border: "1px solid",
              borderColor: COLORS.DARK_MODE.GRAY_MEDIUM,
            }}
            bg={COLORS.GRAY_LIGHT}
            borderRadius={4}
            p={8}
          >
            <VStack gap={4} alignItems="stretch">
              <Select
                {...register("fromAccount")}
                value={fromAccountValue}
                label={formatMessage(messages.fromLabel)}
                options={accountOptions}
                error={errors.fromAccount?.message}
                icon={selectedAccount.isLedger ? <LedgerChip /> : null}
              />
              <Combobox
                {...register("toAccount")}
                label={formatMessage(messages.toLabel)}
                error={errors.toAccount?.message}
                options={formattedContacts}
                value={toAccountValue}
                setValue={setValue}
              />
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <AssetAmountInput
                    assetOptions={assetOptions}
                    assetOptionsMap={assetOptionsMap}
                    assetIdValue={assetIdValue}
                    onAssetIdChange={async (e) => {
                      setValue("assetId", e.target.value);
                      field.onChange("0");
                    }}
                    error={errors.amount?.message}
                    inputElement={
                      <TextInput
                        {...field}
                        aria-label="Amount"
                        value={amountValue}
                        onChange={(e) => {
                          normalizeAmountInputChange({
                            changeEvent: e,
                            selectedAsset: selectedAsset,
                            onStart: () => {
                              clearErrors("root.serverError");
                              clearErrors("amount");
                            },
                            onChange: field.onChange,
                          });
                        }}
                        onFocus={() => {
                          if (field.value === "0") {
                            field.onChange("");
                          }
                        }}
                        onBlur={() => {
                          if (!field.value) {
                            field.onChange("0");
                          }
                          if (field.value.endsWith(".")) {
                            field.onChange(field.value.slice(0, -1));
                          }
                        }}
                        triggerProps={{
                          borderTopRightRadius: 0,
                          borderBottomRightRadius: 0,
                          borderRightWidth: 0,
                        }}
                      />
                    }
                  />
                )}
              />
              {isMultisig && (
                <>
                  <FeeGridSelector
                    estimatedFeesData={estimatedFeesData}
                    selectedAsset={selectedAsset}
                  />
                  <MemoInput />
                </>
              )}
              <RenderError
                error={
                  errors.root?.serverError
                    ? errors.root?.serverError?.message
                    : null
                }
              />
            </VStack>
          </Container>

          <HStack mt={8} justifyContent="flex-end">
            <PillButton
              onClick={async () => {
                // Make sure we have everything to continue with the multisig flow
                if (isMultisig && onNextButton && (await isMultisigValid())) {
                  // Using assertion since we know we have estimatedFeesData from the check above
                  const { normalizedTransactionData, errors } =
                    normalizeTransactionData(
                      formMethods.getValues(),
                      estimatedFeesData!,
                      selectedAsset,
                    );
                  if (normalizedTransactionData) {
                    onNextButton({
                      transactionData: normalizedTransactionData,
                      selectedAccount,
                      selectedAsset,
                    });
                  } else if (errors) {
                    setError("root.serverError", {
                      type: "custom",
                      message: formatMessage(
                        messages.finalizingTransactionError,
                      ),
                    });
                  }
                } else if (await isSingleSignerValid()) {
                  setShowConfirmModal(true);
                }
              }}
              type="button"
              height="60px"
              px={8}
              isDisabled={!isAccountSynced}
            >
              {sendButtonText ?? formatMessage(messages.nextButton)}
            </PillButton>
          </HStack>
          {!isMultisig && showConfirmModal && estimatedFeesData ? (
            <SendAssetConfirmModal
              selectedAccount={selectedAccount}
              selectedAsset={selectedAsset}
              estimatedFeesData={estimatedFeesData}
              onCancel={() => {
                setShowConfirmModal(false);
              }}
            />
          ) : null}
        </chakra.form>
      </FormProvider>
    </>
  );
}

export function SendAssetConfirmModal({
  estimatedFeesData,
  onCancel,
  selectedAccount,
  selectedAsset,
}: {
  onCancel: () => void;
  estimatedFeesData: TRPCRouterOutputs["getEstimatedFees"];
  selectedAccount: TRPCRouterOutputs["getAccounts"][number];
  selectedAsset: AssetOptionType;
}) {
  return selectedAccount.isLedger ? (
    <ConfirmLedgerModal
      isOpen
      selectedAsset={selectedAsset}
      estimatedFeesData={estimatedFeesData}
      selectedAccount={selectedAccount}
      onCancel={onCancel}
    />
  ) : (
    <ConfirmTransactionModal
      isOpen
      selectedAsset={selectedAsset}
      selectedAccount={selectedAccount}
      onCancel={onCancel}
      estimatedFeesData={estimatedFeesData}
    />
  );
}

export function SendAssetsForm() {
  const router = useRouter();
  const { data: accountsData, isLoading: accountsLoading } =
    trpcReact.getAccounts.useQuery();
  const filteredAccounts = accountsData?.filter((a) => {
    return !a.status.viewOnly || a.isLedger;
  });
  const defaultToAddress = asQueryString(router.query.to);

  if (accountsLoading) {
    return <Skeleton />;
  }

  if (!filteredAccounts) {
    return null;
  }

  if (filteredAccounts.length === 0) {
    return <NoSpendingAccountsMessage />;
  }

  return (
    <SendAssetsFormContent
      accountsData={filteredAccounts}
      defaultToAddress={defaultToAddress}
    />
  );
}
