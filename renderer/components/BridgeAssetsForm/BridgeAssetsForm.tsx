import { Box, chakra, Flex, HStack, Text, VStack } from "@chakra-ui/react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { defineMessages, useIntl } from "react-intl";

import { TRPCRouterOutputs, trpcReact } from "@/providers/TRPCProvider";
import { COLORS } from "@/ui/colors";
import { Select } from "@/ui/Forms/Select/Select";
import { TextInput } from "@/ui/Forms/TextInput/TextInput";
import { PillButton } from "@/ui/PillButton/PillButton";
import { BridgeArrows } from "@/ui/SVGs/BridgeArrows";
import {
  ChainportToken,
  useChainportTokens,
} from "@/utils/chainport/chainport";

import { AssetAmountInput } from "../AssetAmountInput/AssetAmountInput";
import { useAccountAssets } from "../AssetAmountInput/utils";

const messages = defineMessages({
  fromLabel: {
    defaultMessage: "From Account",
  },
});

export function BridgeAssetsFormContent({
  accountsData,
  chainportTokens,
  chainportTokensMap,
}: {
  accountsData: TRPCRouterOutputs["getAccounts"];
  chainportTokens: ChainportToken[];
  chainportTokensMap: Map<string, ChainportToken>;
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

  const defaultFromAccount = accountOptions[0]?.value;
  const defaultAssetId = accountsData[0]?.balances.iron.asset.id;
  const defaultDestinationNetwork = chainportTokensMap
    .get(defaultAssetId)
    ?.targetNetworks[0].value.toString();

  const { register, watch } = useForm({
    defaultValues: {
      amount: "0",
      fromAccount: defaultFromAccount,
      assetId: defaultAssetId,
      destinationNetwork: defaultDestinationNetwork,
    },
  });

  const amountValue = watch("amount");
  const fromAccountValue = watch("fromAccount");
  const assetIdValue = watch("assetId");
  const destinationNetworkValue = watch("destinationNetwork");

  const selectedAccount = useMemo(() => {
    return (
      accountsData?.find((account) => account.name === fromAccountValue) ??
      accountsData[0]
    );
  }, [accountsData, fromAccountValue]);

  const { assetOptions, assetOptionsMap } = useAccountAssets(selectedAccount, {
    balanceInLabel: false,
  });

  const bridgeableAssets = useMemo(() => {
    const chainportAssetIds = new Set(
      chainportTokens.map((token) => token.ironfishId),
    );
    return assetOptions.filter((asset) => {
      return chainportAssetIds.has(asset.asset.id);
    });
  }, [chainportTokens, assetOptions]);

  const availableNetworks =
    chainportTokensMap.get(assetIdValue)?.targetNetworks;

  if (!availableNetworks) {
    throw new Error("No available networks found");
  }

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
        <VStack alignItems="stretch" gap={0}>
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
              assetOptions={bridgeableAssets}
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
          <Box my="2.5px" position="relative">
            <Flex
              bg="#F3DEF5"
              color={COLORS.ORCHID}
              border="3px solid white"
              borderRadius={4}
              alignItems="center"
              justifyContent="center"
              position="absolute"
              h="39px"
              w="42px"
              left="50%"
              top="50%"
              transform="translateX(-50%) translateY(-50%)"
            >
              <BridgeArrows />
            </Flex>
          </Box>
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
              <Select
                {...register("destinationNetwork")}
                value={destinationNetworkValue}
                label="Destination network"
                options={availableNetworks}
              />
            </HStack>
          </VStack>
        </VStack>
      </VStack>
      <HStack mt={8} justifyContent="flex-end">
        <PillButton type="submit">Bridge Asset</PillButton>
      </HStack>
    </chakra.form>
  );
}

export function BridgeAssetsForm() {
  const { data: accountsData } = trpcReact.getAccounts.useQuery();
  const filteredAccounts = accountsData?.filter((a) => !a.status.viewOnly);
  const { data: tokensData, isLoading: isChainportLoading } =
    useChainportTokens();

  if (!filteredAccounts || isChainportLoading) {
    return <Text>Loading! Make this look good!</Text>;
  }

  if (!tokensData) {
    throw new Error("Chainport data not found");
  }

  return (
    <BridgeAssetsFormContent
      accountsData={filteredAccounts}
      chainportTokens={tokensData.chainportTokens}
      chainportTokensMap={tokensData.chainportTokensMap}
    />
  );
}
