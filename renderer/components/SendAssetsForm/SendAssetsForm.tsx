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
import { hexToUTF16String } from "@/utils/hexToUTF16String";
import { formatOre, parseIron } from "@/utils/ironUtils";
import { asQueryString } from "@/utils/parseRouteQuery";
import { sliceToUtf8Bytes } from "@/utils/sliceToUtf8Bytes";
import { truncateString } from "@/utils/truncateString";

import { ConfirmTransactionModal } from "./ConfirmTransactionModal/ConfirmTransactionModal";
import {
  MAX_MEMO_SIZE,
  TransactionData,
  TransactionFormData,
  transactionSchema,
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
  unknownAsset: {
    defaultMessage: "unknown asset",
  },
  estimatedFeeDefaultError: {
    defaultMessage: "An error occurred while estimating the transaction fee",
  },
});

type AccountType = TRPCRouterOutputs["getAccounts"][number];
type BalanceType = AccountType["balances"]["iron"];

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
  const assetValue = watch("assetId");
  const feeValue = watch("fee");
  const amountValue = watch("amount");
  const toAccountValue = watch("toAccount");

  const { data: estimatedFeesData, error: estimatedFeesError } =
    trpcReact.getEstimatedFees.useQuery(
      {
        accountName: fromAccountValue,
        output: {
          amount: parseIron(amountValue),
          assetId: assetValue,
          memo: "",
          publicAddress: toAccountValue,
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

  const assetOptions = useMemo(() => {
    return Object.values(accountBalances).map((balance) => {
      const assetName = hexToUTF16String(balance.asset.name);
      return {
        assetName: assetName,
        label: assetName + ` (${formatOre(balance.confirmed)})`,
        value: balance.asset.id,
      };
    });
  }, [accountBalances]);

  // Resets asset field to $IRON if a newly selected account does not have the selected asset
  useEffect(() => {
    if (!Object.hasOwn(accountBalances, assetValue)) {
      resetField("assetId");
    }
  }, [assetValue, resetField, selectedAccount, accountBalances]);

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
          const amountAsIron = parseIron(data.amount);

          if (currentBalance < amountAsIron) {
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
            amount: parseIron(data.amount),
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
            value={assetValue}
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

                  let finalValue = azValue;

                  // only allow up to 8 decimal places
                  const parts = azValue.split(".");
                  if (parts[1]?.length > 8) {
                    finalValue = `${parts[0]}.${parts[1].slice(0, 8)}`;
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
        selectedAssetName={
          assetOptions.find(({ value }) => value === assetValue)?.assetName ??
          formatMessage(messages.unknownAsset)
        }
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
