import { chakra, HStack, Text, VStack } from "@chakra-ui/react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { defineMessages, useIntl } from "react-intl";

import { TRPCRouterOutputs, trpcReact } from "@/providers/TRPCProvider";
import { COLORS } from "@/ui/colors";
import { Select } from "@/ui/Forms/Select/Select";
import { TextInput } from "@/ui/Forms/TextInput/TextInput";
import { useChainportData } from "@/utils/chainport/chainport";

import { AssetAmountInput } from "../AssetAmountInput/AssetAmountInput";
import { useAccountAssets } from "../AssetAmountInput/utils";

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

  const { register, watch } = useForm({
    defaultValues: {
      amount: "0",
      fromAccount: accountOptions[0]?.value,
      assetId: accountsData[0]?.balances.iron.asset.id,
    },
  });

  const amountValue = watch("amount");
  const fromAccountValue = watch("fromAccount");
  const assetIdValue = watch("assetId");

  const selectedAccount = useMemo(() => {
    return (
      accountsData?.find((account) => account.name === fromAccountValue) ??
      accountsData[0]
    );
  }, [accountsData, fromAccountValue]);

  const { assetOptions, assetOptionsMap } = useAccountAssets(selectedAccount, {
    balanceInLabel: false,
  });

  const chainportData = useChainportData();

  console.log(chainportData.data);

  return (
    <chakra.form
      onSubmit={(e) => {
        e.preventDefault();
        console.log("Handle submit...");
      }}
    >
      <VStack gap={4} alignItems="stretch">
        <Select
          {...register("fromAccount")}
          value={fromAccountValue}
          label={formatMessage(messages.fromLabel)}
          options={accountOptions}
        />
        <VStack alignItems="stretch" gap="5px">
          <VStack
            p={8}
            borderRadius={4}
            bg={COLORS.GRAY_LIGHT}
            alignItems="stretch"
            gap={4}
            _dark={{
              bg: "transparent",
              border: `1px solid ${COLORS.DARK_MODE.GRAY_MEDIUM}`,
            }}
          >
            <AssetAmountInput
              assetOptions={assetOptions}
              assetOptionsMap={assetOptionsMap}
              amountValue={amountValue}
              onAmountChange={(value) => console.log(value)}
              assetIdValue={assetIdValue}
              onAssetIdChange={async (value) => console.log(value)}
            />
            <HStack gap={4}>
              <TextInput isReadOnly label="Bridge Provider" value="Chainport" />
              <Text color={COLORS.GRAY_MEDIUM}>Need help?</Text>
            </HStack>
          </VStack>
          <VStack
            p={8}
            borderRadius={4}
            bg={COLORS.GRAY_LIGHT}
            alignItems="stretch"
            _dark={{
              bg: "transparent",
              border: `1px solid ${COLORS.DARK_MODE.GRAY_MEDIUM}`,
            }}
          >
            <HStack>
              <TextInput isReadOnly label="Bridge Provider" value="Chainport" />
            </HStack>
          </VStack>
        </VStack>
      </VStack>
    </chakra.form>
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
