import { VStack } from "@chakra-ui/react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { defineMessages, useIntl } from "react-intl";

import { TRPCRouterOutputs, trpcReact } from "@/providers/TRPCProvider";
import { COLORS } from "@/ui/colors";
import { Select } from "@/ui/Forms/Select/Select";

import { AssetAmountInput } from "../AssetAmountInput/AssetAmountInput";

const messages = defineMessages({
  fromLabel: {
    defaultMessage: "From Account",
  },
});

export function BridgeAssetsFormContent({
  accountsData,
}: {
  accountsData: TRPCRouterOutputs["getAccounts"];
  defaultToAddress?: string | null;
}) {
  const { formatMessage } = useIntl();

  const accountOptions = useMemo(() => {
    return accountsData?.map((account) => {
      return {
        label: account.name,
        value: account.name,
      };
    });
  }, [accountsData]);

  const { register, watch } = useForm();

  const fromAccountValue = watch("fromAccount");

  return (
    <VStack gap={4} alignItems="stretch">
      <Select
        {...register("fromAccount")}
        value={fromAccountValue}
        label={formatMessage(messages.fromLabel)}
        options={accountOptions}
        // error={errors.fromAccount?.message}
      />
      <VStack alignItems="stretch" gap="5px">
        <VStack
          p={8}
          borderRadius={4}
          bg={COLORS.GRAY_LIGHT}
          alignItems="stretch"
        >
          <AssetAmountInput selectedAsset="" assetOptions={[]} amountValue="" />
        </VStack>
        <VStack
          p={8}
          borderRadius={4}
          bg={COLORS.GRAY_LIGHT}
          alignItems="stretch"
        >
          <Select
            label="temp"
            value="temp"
            options={[]}
            name=""
            onChange={async () => {}}
          />
        </VStack>
      </VStack>
    </VStack>
  );
}

export function BridgeAssetsForm() {
  const { data: accountsData } = trpcReact.getAccounts.useQuery();
  const filteredAccounts = accountsData?.filter((a) => !a.status.viewOnly);

  if (!filteredAccounts) {
    return null;
  }

  return <BridgeAssetsFormContent accountsData={filteredAccounts} />;
}
