import { VStack, chakra, HStack } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { TRPCRouterOutputs, trpcReact } from "@/providers/TRPCProvider";
import { Select } from "@/ui/Forms/Select/Select";
import { TextInput } from "@/ui/Forms/TextInput/TextInput";
import { PillButton } from "@/ui/PillButton/PillButton";
import { hexToUTF16String } from "@/utils/hexToUTF16String";
import { formatOre, parseIron } from "@/utils/ironUtils";
import { asQueryString } from "@/utils/parseRouteQuery";

import { ConfirmTransactionModal } from "./ConfirmTransactionModal/ConfirmTransactionModal";
import {
  TransactionData,
  TransactionFormData,
  transactionSchema,
} from "./transactionSchema";

export function SendAssetsFormContent({
  accountsData,
  estimatedFeesData,
  defaultToAddress,
}: {
  accountsData: TRPCRouterOutputs["getAccounts"];
  estimatedFeesData: TRPCRouterOutputs["getEstimatedFees"];
  defaultToAddress?: string | null;
}) {
  const router = useRouter();

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
    const queryMatch = accountOptions?.find(
      (option) => option.value === router.query.account,
    );

    return queryMatch ? queryMatch.value : accountOptions?.[0].value;
  }, [accountOptions, router.query.account]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      fromAccount: defaultAccount,
      toAccount: defaultToAddress ?? "",
      assetId: accountsData[0].balances.iron.asset.id,
      fee: "average",
    },
  });

  const fromAccountValue = watch("fromAccount");
  const assetValue = watch("assetId");
  const feeValue = watch("fee");

  const assetOptions = useMemo(() => {
    const selectedAccount = accountsData?.find(
      (account) => account.name === fromAccountValue,
    );
    if (!selectedAccount) {
      return [];
    }
    const assets = [
      {
        label: hexToUTF16String(selectedAccount.balances.iron.asset.name),
        value: selectedAccount.balances.iron.asset.id,
      },
    ];
    selectedAccount.balances.custom?.forEach((customAsset) => {
      assets.push({
        label: hexToUTF16String(customAsset.asset.name),
        value: customAsset.asset.id,
      });
    });
    return assets;
  }, [accountsData, fromAccountValue]);

  return (
    <>
      <chakra.form
        onSubmit={handleSubmit((data) => {
          const fee = estimatedFeesData[data.fee];
          setPendingTransaction({
            fromAccount: data.fromAccount,
            toAccount: data.toAccount,
            assetId: data.assetId,
            amount: parseIron(data.amount),
            fee: parseInt(fee, 10),
            memo: data.memo ?? "",
          });
        })}
      >
        <VStack gap={4} alignItems="stretch">
          <Select
            {...register("fromAccount")}
            value={fromAccountValue}
            label="From"
            options={accountOptions}
            error={errors.fromAccount?.message}
          />

          <TextInput
            {...register("toAccount")}
            label="To"
            error={errors.toAccount?.message}
          />

          <Select
            {...register("assetId")}
            value={assetValue}
            label="Asset"
            options={assetOptions}
            error={errors.assetId?.message}
          />

          <TextInput
            {...register("amount")}
            label="Amount"
            error={errors.amount?.message}
          />

          <Select
            {...register("fee")}
            value={feeValue}
            label="Fee ($IRON)"
            options={[
              {
                label: `Slow (${formatOre(estimatedFeesData.slow)} $IRON)`,
                value: "slow",
              },
              {
                label: `Average (${formatOre(
                  estimatedFeesData.average,
                )} $IRON)`,
                value: "average",
              },
              {
                label: `Fast (${formatOre(estimatedFeesData.fast)} $IRON)`,
                value: "fast",
              },
            ]}
            error={errors.fee?.message}
          />

          <TextInput
            {...register("memo")}
            label="Memo (32 characters max)"
            error={errors.memo?.message}
          />
        </VStack>

        <HStack mt={8} justifyContent="flex-end">
          <PillButton type="submit" height="60px" px={8}>
            Send Asset
          </PillButton>
        </HStack>
      </chakra.form>
      <ConfirmTransactionModal
        isOpen={!!pendingTransaction}
        transactionData={pendingTransaction}
        selectedAssetName={
          assetOptions.find(({ value }) => value === assetValue)?.label ??
          "unknown asset"
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
  const { data: estimatedFeesData } = trpcReact.getEstimatedFees.useQuery();
  const defaultToAddress = asQueryString(router.query.to);

  if (!accountsData || !estimatedFeesData) {
    return null;
  }

  return (
    <SendAssetsFormContent
      accountsData={accountsData}
      estimatedFeesData={estimatedFeesData}
      defaultToAddress={defaultToAddress}
    />
  );
}
