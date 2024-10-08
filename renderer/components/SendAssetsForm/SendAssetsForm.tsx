import {
  Box,
  Container,
  Flex,
  HStack,
  Text,
  VStack,
  chakra,
} from "@chakra-ui/react";
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
import { truncateString } from "@/utils/truncateString";

import { ConfirmLedgerModal } from "./ConfirmLedgerModal/ConfirmLedgerModal";
import { ConfirmTransactionModal } from "./ConfirmTransactionModal/ConfirmTransactionModal";
import { TransactionFormData, transactionSchema } from "./transactionSchema";
import {
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
});

export function SendAssetsFormContent({
  accountsData,
  defaultToAddress,
}: {
  accountsData: TRPCRouterOutputs["getAccounts"];
  defaultToAddress?: string | null;
}) {
  const router = useRouter();
  const { formatMessage } = useIntl();

  const [confirmTransaction, setConfirmTransaction] = useState(false);

  const accountOptions = useMemo(() => {
    return accountsData?.map((account) => {
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

  const defaultAssetId = accountsData[0]?.balances.iron.asset.id;

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
    handleSubmit,
    formState: { errors },
    watch,
    setError,
    clearErrors,
    resetField,
    setValue,
    register,
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
      accountsData?.find((account) => account.name === fromAccountValue) ??
      accountsData[0]
    );
  }, [accountsData, fromAccountValue]);

  const { accountBalances, assetOptionsMap, assetOptions } =
    useAccountAssets(selectedAccount);

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

  // Todo: Error handling - possibly move this to the review step
  const { data: estimatedFeesData, error: _estimatedFeesError } =
    trpcReact.getEstimatedFees.useQuery(
      {
        accountName: fromAccountValue,
        output: {
          amount: Number(assetAmountToSend),
          assetId: assetIdValue,
          memo: "",
          // For fee estimation, the actual address of the recipient is not important, is just has to be
          // a valid address. Therefore, we're just going to use the address of the first account.
          publicAddress: accountsData[0].address,
        },
      },
      {
        retry: false,
        enabled:
          Number(amountValue) > 0 &&
          !errors.memo &&
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
  const formattedContacts = useMemo(() => {
    return contactsData?.map((contact) => ({
      value: contact.address,
      label: {
        main: contact.name,
        sub: truncateString(contact.address, 2),
      },
    }));
  }, [contactsData]);

  return (
    <>
      {syncingMessage}
      <FormProvider {...formMethods}>
        <chakra.form
          onSubmit={handleSubmit(
            async (data) => {
              const currentBalance = Number(
                accountBalances[data.assetId].confirmed,
              );

              if (currentBalance < assetAmountToSend) {
                setError("amount", {
                  type: "custom",
                  message: formatMessage(messages.insufficientFundsError),
                });
                return;
              }

              console.log("data", data);
              setConfirmTransaction(true);
            },
            (errors) => {
              console.log("Form validation failed:", errors);
            },
          )}
        >
          <Container
            _dark={{ bg: COLORS.DARK_MODE.GRAY_DARK }}
            bg={COLORS.GRAY_LIGHT}
            borderRadius={1}
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
              <Flex gap={0}>
                <Box flex={1}>
                  <Controller
                    name="amount"
                    control={control}
                    render={({ field }) => (
                      <TextInput
                        {...field}
                        triggerProps={{
                          border: "1px solid",
                          borderRadius: "0",
                        }}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          normalizeAmountInputChange({
                            changeEvent: e,
                            selectedAsset: assetOptionsMap.get(assetIdValue),
                            onStart: () => clearErrors("root.serverError"),
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
                        label={formatMessage(messages.amountLabel)}
                        error={errors.amount?.message}
                      />
                    )}
                  />
                </Box>
                <Select
                  {...register("assetId")}
                  value={assetIdValue}
                  label={formatMessage(messages.assetLabel)}
                  options={assetOptions.map((opt) => ({
                    ...opt,
                    label: opt.assetName,
                  }))}
                  error={errors.assetId?.message}
                  border={"none"}
                  borderRadius={0}
                  triggerProps={{
                    border: "1px solid",
                    borderLeft: "1px none",
                    borderRadius: "0",
                    whiteSpace: "nowrap",
                  }}
                />
              </Flex>
              <RenderError
                error={
                  errors.root?.serverError
                    ? errors.root?.serverError?.message
                    : null
                }
              />
            </VStack>
            <Text color="muted" mt={2}>
              {`${assetOptionsMap.get(assetIdValue)
                ?.confirmedBalance} ${assetOptionsMap.get(assetIdValue)
                ?.assetName} ${formatMessage(messages.available)}`}
            </Text>
          </Container>

          <HStack mt={8} justifyContent="flex-end">
            <PillButton
              type="submit"
              height="60px"
              px={8}
              isDisabled={!isAccountSynced}
            >
              {formatMessage(messages.nextButton)}
            </PillButton>
          </HStack>
        </chakra.form>

        {(() => {
          if (!confirmTransaction) return null;

          return selectedAccount.isLedger ? (
            <ConfirmLedgerModal
              isOpen
              selectedAsset={assetOptionsMap.get(assetIdValue)}
              selectedAccount={selectedAccount}
              onCancel={() => {
                setConfirmTransaction(false);
              }}
            />
          ) : (
            <ConfirmTransactionModal
              isOpen
              selectedAsset={assetOptionsMap.get(assetIdValue)}
              selectedAccount={selectedAccount}
              onCancel={() => {
                setConfirmTransaction(false);
              }}
              estimatedFeesData={estimatedFeesData}
            />
          );
        })()}
      </FormProvider>
    </>
  );
}

export function SendAssetsForm() {
  const router = useRouter();
  const { data: accountsData } = trpcReact.getAccounts.useQuery();
  const filteredAccounts = accountsData?.filter((a) => {
    return !a.status.viewOnly || a.isLedger;
  });
  const defaultToAddress = asQueryString(router.query.to);

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
