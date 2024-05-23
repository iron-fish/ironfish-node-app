import { HStack, Skeleton, Text, chakra } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { defineMessages, useIntl } from "react-intl";

import { TRPCRouterOutputs, trpcReact } from "@/providers/TRPCProvider";
import { COLORS } from "@/ui/colors";
import { Select } from "@/ui/Forms/Select/Select";
import { TextInput } from "@/ui/Forms/TextInput/TextInput";
import {
  ChainportTargetNetwork,
  ChainportToken,
  useChainportTokens,
} from "@/utils/chainport/chainport";

import { BridgeAssetsFormShell } from "./BridgeAssetsFormShell";
import { BridgeAssetsFormData } from "./bridgeAssetsSchema";
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
  bridgeProvider: {
    defaultMessage: "Bridge Provider",
  },
  destinationNetwork: {
    defaultMessage: "Destination network",
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
  chainportTargetNetworksMap: Map<string, ChainportTargetNetwork>;
}) {
  const { formatMessage } = useIntl();

  const [confirmationData, setConfirmationData] =
    useState<BridgeAssetsFormData | null>(null);

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

  if (!defaultDestinationNetwork) {
    throw new Error("No default destination network found");
  }

  const { register, watch, setValue } = useForm({
    defaultValues: {
      amount: "0",
      fromAccount: defaultFromAccount,
      assetId: defaultAssetId,
      destinationNetwork: defaultDestinationNetwork,
      targetAddress: "",
    },
  });

  const amountValue = watch("amount");
  const fromAccountValue = watch("fromAccount");
  const assetIdValue = watch("assetId");
  const destinationNetworkValue = watch("destinationNetwork");
  const targetAddress = watch("targetAddress");

  // If the user selects a different asset, and that asset does not support the selected network,
  // then we automatically switch to the first available network for that asset.
  useEffect(() => {
    const availableNetworks =
      chainportTokensMap.get(assetIdValue)?.targetNetworks;
    const selectedNetwork = availableNetworks?.find(
      (network) => network.chainId?.toString() === destinationNetworkValue,
    );

    if (availableNetworks && !selectedNetwork) {
      setValue("destinationNetwork", availableNetworks[0].value.toString());
    }
  }, [assetIdValue, chainportTokensMap, destinationNetworkValue, setValue]);

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
    const withDisabledStatus = assetOptions
      .map((item) => {
        return {
          ...item,
          disabled: !chainportAssetIds.has(item.asset.id),
        };
      })
      .toSorted((a, b) => {
        if (a.disabled && !b.disabled) return 1;
        if (!a.disabled && b.disabled) return -1;
        return 0;
      });

    return withDisabledStatus;
  }, [chainportTokens, assetOptions]);

  const availableNetworks =
    chainportTokensMap.get(assetIdValue)?.targetNetworks;

  if (!availableNetworks) {
    throw new Error("No available networks found");
  }

  return (
    <>
      <chakra.form
        onSubmit={(e) => {
          e.preventDefault();

          setConfirmationData({
            amount: amountValue,
            fromAccount: fromAccountValue,
            assetId: assetIdValue,
            destinationNetwork: destinationNetworkValue,
            targetAddress: targetAddress,
          });
        }}
      >
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
              onAmountChange={(value) => setValue("amount", value)}
              assetIdValue={assetIdValue}
              onAssetIdChange={async (e) => setValue("assetId", e.target.value)}
            />
          }
          bridgeProviderInput={
            <HStack gap={4}>
              <TextInput
                isReadOnly
                label={formatMessage(messages.bridgeProvider)}
                value="Chainport"
              />
              <Text color={COLORS.GRAY_MEDIUM}>
                {formatMessage(messages.needHelp)}
              </Text>
            </HStack>
          }
          destinationNetworkInput={
            <Select
              {...register("destinationNetwork")}
              value={destinationNetworkValue}
              label={formatMessage(messages.destinationNetwork)}
              options={availableNetworks}
            />
          }
          targetAddressInput={
            <TextInput {...register("targetAddress")} label="Target Address" />
          }
        />
      </chakra.form>
      {!!confirmationData && (
        <BridgeConfirmationModal
          onClose={() => setConfirmationData(null)}
          formData={confirmationData}
        />
      )}
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
        targetAddressInput={<Skeleton height={71} w="100%" />}
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
      chainportTargetNetworksMap={tokensData.chainportNetworksMap}
    />
  );
}
