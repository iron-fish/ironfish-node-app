import { VStack, chakra, Button } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { TRPCRouterOutputs, trpcReact } from "@/providers/TRPCProvider";
import { Select } from "@/ui/Forms/Select/Select";
import { TextInput } from "@/ui/Forms/TextInput/TextInput";
import { isValidPublicAddress } from "@/utils/addressUtils";
import { hexToUTF16String } from "@/utils/hexToUTF16String";
import { formatOre } from "@/utils/ironUtils";

const schema = z.object({
  fromAccount: z.string().min(1),
  toAccount: z
    .string()
    .min(1)
    .refine(isValidPublicAddress, "Invalid public address"),
  asset: z.string().min(1),
  amount: z.coerce.number().positive(),
  fee: z.string().min(1),
  memo: z.string().optional(),
});

export function SendAssetsFormContent({
  accountsData,
  estimatedFeesData,
}: {
  accountsData: TRPCRouterOutputs["getAccounts"];
  estimatedFeesData: TRPCRouterOutputs["getEstimatedFees"];
}) {
  const accountOptions = useMemo(() => {
    return accountsData?.map((account) => {
      return {
        label: account.name,
        value: account.name,
      };
    });
  }, [accountsData]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fromAccount: accountOptions?.[0].value,
      toAccount: "",
      asset: "",
      amount: null,
      fee: null,
      memo: "",
    },
  });

  const fromAccountValue = watch("fromAccount");

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

  const onSubmit = (data: unknown) => console.log(data);

  return (
    <chakra.form onSubmit={handleSubmit(onSubmit)}>
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
          {...register("asset")}
          label="Asset"
          options={assetOptions}
          error={errors.asset?.message}
        />

        <TextInput
          {...register("amount")}
          label="Amount"
          error={errors.amount?.message}
        />

        <Select
          {...register("fee")}
          label="Fee ($IRON)"
          options={[
            {
              label: `Slow (${formatOre(estimatedFeesData.slow)} $IRON)`,
              value: "slow",
            },
            {
              label: `Average (${formatOre(estimatedFeesData.average)} $IRON)`,
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

      <Button
        mt={8}
        type="submit"
        onClick={() => {
          console.log(getValues());
        }}
      >
        Submit
      </Button>
    </chakra.form>
  );
}

export function SendAssetsForm() {
  const { data: accountsData } = trpcReact.getAccounts.useQuery();
  const { data: estimatedFeesData } = trpcReact.getEstimatedFees.useQuery();

  if (!accountsData || !estimatedFeesData) {
    return null;
  }

  return (
    <SendAssetsFormContent
      accountsData={accountsData}
      estimatedFeesData={estimatedFeesData}
    />
  );
}
