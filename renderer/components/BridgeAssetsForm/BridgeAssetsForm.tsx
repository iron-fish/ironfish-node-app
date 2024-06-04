import { HStack, Skeleton, Text, chakra } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { defineMessages, useIntl } from "react-intl";

import { TRPCRouterOutputs, trpcReact } from "@/providers/TRPCProvider";
import { COLORS } from "@/ui/colors";
import { Select } from "@/ui/Forms/Select/Select";
import { TextInput } from "@/ui/Forms/TextInput/TextInput";

import { BridgeAssetsFormShell } from "./BridgeAssetsFormShell";
import { BridgeAssetsFormData, bridgeAssetsSchema } from "./bridgeAssetsSchema";
import { BridgeConfirmationModal } from "./BridgeConfirmationModal/BridgeConfirmationModal";
import { AssetAmountInput } from "../AssetAmountInput/AssetAmountInput";
import {
  normalizeAmountInputChange,
  useAccountAssets,
} from "../AssetAmountInput/utils";

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

type ChainportToken =
  TRPCRouterOutputs["getChainportTokens"]["chainportTokens"][number];
type ChainportTargetNetwork = ChainportToken["targetNetworks"][number];

export function BridgeAssetsFormContent({
  accountsData,
  chainportTokens,
  chainportTokensMap,
  chainportTargetNetworksMap,
}: {
  accountsData: TRPCRouterOutputs["getAccounts"];
  chainportTokens: ChainportToken[];
  chainportTokensMap: Record<string, ChainportToken>;
  chainportTargetNetworksMap: Record<string, ChainportTargetNetwork>;
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
  const defaultDestinationNetwork =
    chainportTokensMap[defaultAssetId]?.targetNetworks[0].value.toString();

  if (!defaultDestinationNetwork) {
    throw new Error("No default destination network found");
  }

  const {
    register,
    watch,
    setValue,
    setError,
    handleSubmit,
    clearErrors,
    control,
    formState: { errors: formErrors },
  } = useForm({
    resolver: zodResolver(bridgeAssetsSchema),
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

  // If the user selects a different asset, and that asset does not support the selected network,
  // then we automatically switch to the first available network for that asset.
  useEffect(() => {
    const availableNetworks = chainportTokensMap[assetIdValue]?.targetNetworks;
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

  const availableNetworks = chainportTokensMap[assetIdValue]?.targetNetworks;

  if (!availableNetworks) {
    throw new Error("No available networks found");
  }

  const selectedAsset = assetOptionsMap.get(assetIdValue);

  return (
    <>
      <chakra.form
        onSubmit={handleSubmit((data) => {
          if (
            parseFloat(data.amount) >
            parseFloat(selectedAsset!.confirmedBalance)
          ) {
            setError("amount", {
              type: "custom",
              message: "Amount exceeds available balance",
            });
            return;
          }

          setConfirmationData({
            amount: data.amount,
            fromAccount: data.fromAccount,
            assetId: data.assetId,
            destinationNetwork: data.destinationNetwork,
            targetAddress: data.targetAddress,
          });
        })}
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
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <AssetAmountInput
                  assetOptions={bridgeableAssets}
                  assetOptionsMap={assetOptionsMap}
                  assetIdValue={assetIdValue}
                  onAssetIdChange={async (e) =>
                    setValue("assetId", e.target.value)
                  }
                  error={formErrors.amount?.message}
                  inputElement={
                    <TextInput
                      {...field}
                      aria-label="Amount"
                      value={amountValue}
                      onChange={(e) => {
                        normalizeAmountInputChange({
                          changeEvent: e,
                          selectedAsset: assetOptionsMap.get(assetIdValue),
                          onStart: () => clearErrors("root.serverError"),
                          onChange: field.onChange,
                        });
                      }}
                      onFocus={() => {
                        if (amountValue === "0") {
                          field.onChange("");
                        }
                      }}
                      onBlur={() => {
                        if (!amountValue) {
                          field.onChange("0");
                        }
                        if (amountValue.endsWith(".")) {
                          field.onChange(amountValue.slice(0, -1));
                        }
                      }}
                      triggerProps={{
                        borderTopRightRadius: 0,
                        borderBottomRightRadius: 0,
                        borderRightWidth: 0,
                      }}
                    />
                  }
                />
              )}
            />
          }
          bridgeProviderInput={
            <HStack gap={4}>
              <TextInput
                isReadOnly
                label={formatMessage(messages.bridgeProvider)}
                value="Chainport"
              />
              <Text
                color={COLORS.GRAY_MEDIUM}
                as="a"
                href="https://helpdesk.chainport.io/"
                target="_blank"
                rel="noreferrer"
                cursor="pointer"
                _hover={{
                  textDecoration: "underline",
                }}
              >
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
            <TextInput
              {...register("targetAddress")}
              label="Target Address"
              error={formErrors.targetAddress?.message}
            />
          }
        />
      </chakra.form>
      {!!confirmationData && (
        <BridgeConfirmationModal
          onClose={() => setConfirmationData(null)}
          formData={confirmationData}
          targetNetwork={
            chainportTargetNetworksMap[confirmationData.destinationNetwork]!
          }
          selectedAsset={assetOptionsMap.get(confirmationData.assetId)!}
          chainportToken={chainportTokensMap[confirmationData.assetId]!}
        />
      )}
    </>
  );
}

export function BridgeAssetsForm() {
  const { data: accountsData } = trpcReact.getAccounts.useQuery();
  const filteredAccounts = accountsData?.filter((a) => !a.status.viewOnly);
  const { data: tokensData, isLoading: isChainportLoading } =
    trpcReact.getChainportTokens.useQuery();

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
