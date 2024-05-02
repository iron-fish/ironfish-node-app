import { HStack, VStack, chakra } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { defineMessages, useIntl } from "react-intl";

import { TRPCRouterOutputs, trpcReact } from "@/providers/TRPCProvider";
import { Combobox } from "@/ui/Forms/Combobox/Combobox";
import { RenderError } from "@/ui/Forms/FormField/FormField";
import { Select } from "@/ui/Forms/Select/Select";
import { TextInput } from "@/ui/Forms/TextInput/TextInput";
import { PillButton } from "@/ui/PillButton/PillButton";
import { CurrencyUtils } from "@/utils/currency";
import { hexToUTF16String } from "@/utils/hexToUTF16String";
import { formatOre } from "@/utils/ironUtils";
import { asQueryString } from "@/utils/parseRouteQuery";
import { sliceToUtf8Bytes } from "@/utils/sliceToUtf8Bytes";
import { truncateString } from "@/utils/truncateString";

import { ConfirmTransactionModal } from "./ConfirmTransactionModal/ConfirmTransactionModal";
import {
  MAX_MEMO_SIZE,
  TransactionData,
  TransactionFormData,
  transactionSchema,
  AccountType,
  BalanceType,
  AssetOptionType,
} from "./transactionSchema";
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
  feeLabel: {
    defaultMessage: "Fee ($IRON)",
  },
  memoLabel: {
    defaultMessage: "Memo (32 characters max)",
  },
  sendAssetButton: {
    defaultMessage: "Send Asset",
  },
  insufficientFundsError: {
    defaultMessage:
      "The selected account does not have enough funds to send this transaction",
  },
  slowFeeLabel: {
    defaultMessage: "Slow",
  },
  averageFeeLabel: {
    defaultMessage: "Average",
  },
  fastFeeLabel: {
    defaultMessage: "Fast",
  },
  estimatedFeeDefaultError: {
    defaultMessage: "An error occurred while estimating the transaction fee",
  },
  assetNotFoundError: {
    defaultMessage: "The selected asset could not be found",
  },
  assetAmountConversionError: {
    defaultMessage: "An error occured while converting the asset amount",
  },
});

function getAccountBalances(account: AccountType): {
  [key: string]: BalanceType;
} {
  const customAssets = account.balances.custom?.reduce((acc, customAsset) => {
    return {
      ...acc,
      [customAsset.asset.id]: customAsset,
    };
  }, {});
  return {
    [account.balances.iron.asset.id]: account.balances.iron,
    ...customAssets,
  };
}

export function SendAssetsFormContent({
  accountsData,
  defaultToAddress,
}: {
  accountsData: TRPCRouterOutputs["getAccounts"];
  defaultToAddress?: string | null;
}) {
  const router = useRouter();
  const { formatMessage } = useIntl();

  const [pendingTransaction, setPendingTransaction] =
    useState<TransactionData | null>(null);

  const accountOptions = useMemo(() => {
    return accountsData?.map((account) => {
      return {
        label: account.name,
        value: account.name,
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

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
    clearErrors,
    resetField,
    setValue,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: 0,
      fromAccount: defaultAccount,
      toAccount: defaultToAddress ?? "",
      assetId: defaultAssetId,
      fee: "average",
    },
  });

  const fromAccountValue = watch("fromAccount");
  const assetIdValue = watch("assetId");
  const feeValue = watch("fee");
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
    const match = accountsData?.find(
      (account) => account.name === fromAccountValue,
    );
    if (!match) {
      return accountsData[0];
    }
    return match;
  }, [accountsData, fromAccountValue]);

  const accountBalances = useMemo(() => {
    return getAccountBalances(selectedAccount);
  }, [selectedAccount]);

  const assetOptionsMap = useMemo(() => {
    const entries: Array<[string, AssetOptionType]> = Object.values(
      accountBalances,
    ).map((balance) => {
      const assetName = hexToUTF16String(balance.asset.name);
      const confirmed = CurrencyUtils.render(
        BigInt(balance.confirmed),
        balance.asset.id,
        balance.asset.verification,
      );
      return [
        balance.asset.id,
        {
          assetName: assetName,
          label: assetName + ` (${confirmed})`,
          value: balance.asset.id,
          asset: balance.asset,
        },
      ];
    });
    return new Map(entries);
  }, [accountBalances]);

  const assetOptions = useMemo(
    () => Array.from(assetOptionsMap.values()),
    [assetOptionsMap],
  );

  const assetAmountToSend = useMemo(() => {
    const assetToSend = assetOptionsMap.get(assetIdValue);
    if (!assetToSend) {
      return 0;
    }

    const [amountToSend, conversionError] = CurrencyUtils.tryMajorToMinor(
      amountValue.toString(),
      assetIdValue,
      assetToSend.asset.verification,
    );

    if (conversionError) {
      return 0;
    }

    return amountToSend;
  }, [amountValue, assetIdValue, assetOptionsMap]);

  const { data: estimatedFeesData, error: estimatedFeesError } =
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
          amountValue > 0 &&
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
      <chakra.form
        onSubmit={handleSubmit(async (data) => {
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

          if (!estimatedFeesData) {
            setError("root.serverError", {
              message:
                estimatedFeesError?.message ??
                formatMessage(messages.estimatedFeeDefaultError),
            });
            return;
          }

          const fee = estimatedFeesData[data.fee];

          setPendingTransaction({
            fromAccount: data.fromAccount,
            toAccount: data.toAccount,
            assetId: data.assetId,
            amount: Number(assetAmountToSend),
            fee: fee,
            memo: data.memo ?? "",
          });
        })}
      >
        <VStack gap={4} alignItems="stretch">
          <Select
            {...register("fromAccount")}
            value={fromAccountValue}
            label={formatMessage(messages.fromLabel)}
            options={accountOptions}
            error={errors.fromAccount?.message}
          />

          <Combobox
            {...register("toAccount")}
            label={formatMessage(messages.toLabel)}
            error={errors.toAccount?.message}
            options={formattedContacts}
            value={toAccountValue}
            setValue={setValue}
          />

          <Select
            {...register("assetId")}
            value={assetIdValue}
            label={formatMessage(messages.assetLabel)}
            options={assetOptions}
            error={errors.assetId?.message}
          />

          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                value={field.value ?? ""}
                onChange={(e) => {
                  clearErrors("root.serverError");

                  // remove any non-numeric characters except for periods
                  const azValue = e.target.value.replace(/[^\d.]/g, "");

                  // only allow one period
                  if (azValue.split(".").length > 2) {
                    e.preventDefault();
                    return;
                  }

                  const assetToSend = assetOptionsMap.get(assetIdValue);
                  const decimals =
                    assetToSend?.asset.verification?.decimals ?? 0;

                  let finalValue = azValue;

                  if (decimals === 0) {
                    // If decimals is 0, take the left side of the decimal.
                    // If no decimal is present, this will still work correctly.
                    finalValue = azValue.split(".")[0];
                  } else {
                    // Otherwise, take the left side of the decimal and up to the correct number of decimal places.
                    const parts = azValue.split(".");
                    if (parts[1]?.length > decimals) {
                      finalValue = `${parts[0]}.${parts[1].slice(0, decimals)}`;
                    }
                  }

                  field.onChange(finalValue);
                }}
                onFocus={() => {
                  if (field.value === 0) {
                    field.onChange("");
                  }
                }}
                onBlur={() => {
                  if (!field.value) {
                    field.onChange(0);
                  }
                  if (String(field.value).endsWith(".")) {
                    field.onChange(String(field.value).slice(0, -1));
                  }
                }}
                label={formatMessage(messages.amountLabel)}
                error={errors.amount?.message}
              />
            )}
          />

          <Select
            {...register("fee")}
            value={feeValue}
            label={formatMessage(messages.feeLabel)}
            options={[
              {
                label:
                  formatMessage(messages.slowFeeLabel) +
                  (estimatedFeesData
                    ? ` (${formatOre(estimatedFeesData.slow)} $IRON)`
                    : ""),
                value: "slow",
              },
              {
                label:
                  formatMessage(messages.averageFeeLabel) +
                  (estimatedFeesData
                    ? ` (${formatOre(estimatedFeesData.average)} $IRON)`
                    : ""),
                value: "average",
              },
              {
                label:
                  formatMessage(messages.fastFeeLabel) +
                  (estimatedFeesData
                    ? ` (${formatOre(estimatedFeesData.fast)} $IRON)`
                    : ""),
                value: "fast",
              },
            ]}
            error={errors.fee?.message}
          />

          <Controller
            name="memo"
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(
                    sliceToUtf8Bytes(e.target.value, MAX_MEMO_SIZE),
                  )
                }
                label={formatMessage(messages.memoLabel)}
                error={errors.memo?.message}
              />
            )}
          />

          <RenderError
            error={
              errors.root?.serverError
                ? errors.root?.serverError?.message
                : null
            }
          />
        </VStack>

        <HStack mt={8} justifyContent="flex-end">
          <PillButton
            type="submit"
            height="60px"
            px={8}
            isDisabled={!isAccountSynced}
          >
            {formatMessage(messages.sendAssetButton)}
          </PillButton>
        </HStack>
      </chakra.form>
      <ConfirmTransactionModal
        isOpen={!!pendingTransaction}
        transactionData={pendingTransaction}
        selectedAsset={assetOptionsMap.get(assetIdValue)}
        onCancel={() => {
          setPendingTransaction(null);
        }}
      />
    </>
  );
}

export function SendAssetsForm() {
  const router = useRouter();
  const { data: accountsData } = trpcReact.getAccounts.useQuery();
  const filteredAccounts = accountsData?.filter((a) => !a.status.viewOnly);
  const defaultToAddress = asQueryString(router.query.to);

  if (!filteredAccounts) {
    return null;
  }

  return (
    <SendAssetsFormContent
      accountsData={filteredAccounts}
      defaultToAddress={defaultToAddress}
    />
  );
}
