import { HStack, Skeleton, Text } from "@chakra-ui/react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { defineMessages, useIntl } from "react-intl";

import { TRPCRouterOutputs, trpcReact } from "@/providers/TRPCProvider";
import { COLORS } from "@/ui/colors";
import { Select } from "@/ui/Forms/Select/Select";
import { TextInput } from "@/ui/Forms/TextInput/TextInput";
import {
  ChainportToken,
  useChainportTokens,
} from "@/utils/chainport/chainport";

import { BridgeAssetsFormShell } from "./BridgeAssetsFormShell";
import { BridgeConfirmationModal } from "./BridgeConfirmationModal";
import { AssetAmountInput } from "../AssetAmountInput/AssetAmountInput";
import { useAccountAssets } from "../AssetAmountInput/utils";

const messages = defineMessages({
  fromLabel: {
    defaultMessage: "From Account",
  },
  needHelp: {
    defaultMessage: "Need help?",
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
    <>
      <BridgeAssetsFormShell
        fromAccountInput={
          <Select
            {...register("fromAccount")}
            value={fromAccountValue}
            label={formatMessage(messages.fromLabel)}
            options={accountOptions}
          />
        }
        assetAmountInput={
          <AssetAmountInput
            assetOptions={bridgeableAssets}
            assetOptionsMap={assetOptionsMap}
            amountValue={amountValue}
            onAmountChange={(value) => console.log(value)}
            assetIdValue={assetIdValue}
            onAssetIdChange={async (value) => console.log(value)}
          />
        }
        bridgeProviderInput={
          <HStack gap={4}>
            <TextInput isReadOnly label="Bridge Provider" value="Chainport" />
            <Text color={COLORS.GRAY_MEDIUM}>
              {formatMessage(messages.needHelp)}
            </Text>
          </HStack>
        }
        destinationNetworkInput={
          <Select
            {...register("destinationNetwork")}
            value={destinationNetworkValue}
            label="Destination network"
            options={availableNetworks}
          />
        }
      />
      <BridgeConfirmationModal onClose={() => null} />
    </>
  );
}

export function BridgeAssetsForm() {
  const { data: accountsData } = trpcReact.getAccounts.useQuery();
  const filteredAccounts = accountsData?.filter((a) => !a.status.viewOnly);
  const { data: tokensData, isLoading: isChainportLoading } =
    useChainportTokens();

  if (!filteredAccounts || isChainportLoading) {
    return (
      <BridgeAssetsFormShell
        status="LOADING"
        fromAccountInput={<Skeleton height={71} />}
        assetAmountInput={<Skeleton height={71} />}
        bridgeProviderInput={<Skeleton height={71} w="50%" />}
        destinationNetworkInput={<Skeleton height={71} w="50%" />}
      />
    );
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
