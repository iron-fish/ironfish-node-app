import { VStack, chakra, Button } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { trpcReact } from "@/providers/TRPCProvider";
import { Select } from "@/ui/Forms/Select/Select";
import { TextInput } from "@/ui/Forms/TextInput/TextInput";
import { isValidPublicAddress } from "@/utils/addressUtils";
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

export function SendAssetsForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    resolver: zodResolver(schema),
  });

  const { data: accountsData } = trpcReact.getAccounts.useQuery();
  const { data: estimatedFeesData } = trpcReact.getEstimatedFees.useQuery();

  if (!accountsData || !estimatedFeesData) {
    // @todo: Loading + no accounts state
    return null;
  }

  const accountOptions = accountsData?.map((account) => {
    return {
      label: account.name,
      value: account.name,
    };
  });

  const onSubmit = (data: unknown) => console.log(data);

  return (
    <chakra.form onSubmit={handleSubmit(onSubmit)}>
      <VStack gap={4} alignItems="stretch">
        <Select
          {...register("fromAccount")}
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
          options={[
            { label: "$IRON", value: "iron" },
            { label: "dan-coin", value: "dan-coin" },
          ]}
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
