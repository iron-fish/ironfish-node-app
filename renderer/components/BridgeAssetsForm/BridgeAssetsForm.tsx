import {
  HStack,
  Skeleton,
  Text,
  chakra,
  Image as ChakraImage,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ItemText } from "@radix-ui/react-select";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { defineMessages, useIntl } from "react-intl";

import chainportIcon from "@/images/chainport/chainport-icon-lg.png";
import verifiedIcon from "@/images/verified-icon.svg";
import { TRPCRouterOutputs, trpcReact } from "@/providers/TRPCProvider";
import { COLORS } from "@/ui/colors";
import { Select } from "@/ui/Forms/Select/Select";
import { TextInput } from "@/ui/Forms/TextInput/TextInput";
import { getChecksumAddress, isAddress } from "@/utils/ethereumAddressUtils";

import { BridgeAssetsFormShell } from "./BridgeAssetsFormShell";
import {
  BridgeAssetsConfirmationData,
  BridgeAssetsFormData,
  bridgeAssetsFormSchema,
} from "./bridgeAssetsSchema";
import { BridgeConfirmationModal } from "./BridgeConfirmationModal/BridgeConfirmationModal";
import { AssetAmountInput } from "../AssetAmountInput/AssetAmountInput";
import {
  normalizeAmountInputChange,
  useAccountAssets,
} from "../AssetAmountInput/utils";
import { NoSpendingAccountsMessage } from "../EmptyStateMessage/shared/NoSpendingAccountsMessage";

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
  networkErrorMessage: {
    defaultMessage: "A network error occured, please try again",
  },
});

type ChainportToken =
  TRPCRouterOutputs["getChainportTokens"]["chainportTokensMap"][string];

function BridgeAssetsFormContent({
  accountsData,
  chainportTokensMap,
}: {
  accountsData: TRPCRouterOutputs["getAccounts"];
  chainportTokensMap: Record<string, ChainportToken>;
}) {
  const { formatMessage } = useIntl();

  const [confirmationData, setConfirmationData] =
    useState<BridgeAssetsConfirmationData | null>(null);
  const [transactionDetailsError, setTransactionDetailsError] = useState("");

  const accountOptions = useMemo(() => {
    return accountsData?.map((account) => {
      return {
        label: account.name,
        value: account.name,
      };
    });
  }, [accountsData]);

  const defaultFromAccount = accountOptions[0]?.value;
  const defaultAssetId =
    accountsData[0]?.balances.iron.asset.id ||
    Object.values(chainportTokensMap)[0]?.web3_address;

  const {
    register,
    watch,
    setValue,
    setError,
    handleSubmit,
    clearErrors,
    control,
    formState: { errors: formErrors },
  } = useForm<BridgeAssetsFormData>({
    resolver: zodResolver(bridgeAssetsFormSchema),
    mode: "onBlur",
    defaultValues: {
      amount: "0",
      fromAccount: defaultFromAccount,
      assetId: defaultAssetId,
      destinationNetworkId: null,
      targetAddress: "",
    },
  });

  const amountValue = watch("amount");
  const fromAccountValue = watch("fromAccount");
  const assetIdValue = watch("assetId");
  const destinationNetworkId = watch("destinationNetworkId");
  const targetAddress = watch("targetAddress");

  const { data: tokenPathsResponse } =
    trpcReact.getChainportTokenPaths.useQuery(
      {
        tokenId: chainportTokensMap[assetIdValue]?.id,
      },
      {
        enabled: !!chainportTokensMap[assetIdValue],
      },
    );
  const availableNetworks = tokenPathsResponse?.chainportTokenPaths;

  const selectedAccount = useMemo(() => {
    return (
      accountsData?.find((account) => account.name === fromAccountValue) ??
      accountsData[0]
    );
  }, [accountsData, fromAccountValue]);

  const { assetOptions, assetOptionsMap } = useAccountAssets(selectedAccount, {
    balanceInLabel: false,
  });

  const bridgeableAssetIdSet = useMemo(() => {
    return new Set(
      Object.values(chainportTokensMap).map((token) => token.web3_address),
    );
  }, [chainportTokensMap]);

  const bridgeableAssets = useMemo(() => {
    const withAdditionalFields = assetOptions
      .map((item) => {
        return {
          ...item,
          label: (
            <HStack>
              <ItemText>{item.label}</ItemText>
              {item.asset.verification.status === "verified" && (
                <Image src={verifiedIcon} alt="" />
              )}
            </HStack>
          ),
          disabled: !bridgeableAssetIdSet.has(item.asset.id),
        };
      })
      .toSorted((a, b) => {
        if (a.disabled && !b.disabled) return 1;
        if (!a.disabled && b.disabled) return -1;
        return 0;
      });

    return withAdditionalFields;
  }, [assetOptions, bridgeableAssetIdSet]);

  const selectedAsset = assetOptionsMap.get(assetIdValue);
  const selectedNetwork = availableNetworks?.find(
    (n) => destinationNetworkId === n.chainport_network_id.toString(),
  );

  const handleIfAmountExceedsBalance = useCallback(
    (amount: string) => {
      const parsed = parseFloat(amount);
      const exceedsBalance =
        !isNaN(parsed) && parsed > parseFloat(selectedAsset!.confirmedBalance);

      if (exceedsBalance) {
        setError("amount", {
          type: "custom",
          message: "Amount exceeds available balance",
        });
        return true;
      }

      return false;
    },
    [selectedAsset, setError],
  );

  const targetAddressIcon = useMemo(() => {
    if (targetAddress.length === 0) {
      return null;
    }

    return targetAddress.length > 0 && isAddress(targetAddress) ? (
      <chakra.svg width="18" height="13" viewBox="0 0 18 13" fill="none" mr={1}>
        <path
          d="M6.54961 13L0.849609 7.29998L2.27461 5.87498L6.54961 10.15L15.7246 0.974976L17.1496 2.39998L6.54961 13Z"
          fill="#6A991C"
        />
      </chakra.svg>
    ) : null;
  }, [targetAddress]);

  // Try to reset selected asset to a valid one if the current one is disabled
  useEffect(() => {
    const selectedAsset = bridgeableAssets.find(
      (asset) => asset.value === assetIdValue,
    );
    if (!selectedAsset || selectedAsset.disabled) {
      const bridgeableAsset =
        bridgeableAssets.find((asset) => !asset.disabled) ??
        bridgeableAssets[0];
      setValue("assetId", bridgeableAsset?.value ?? defaultAssetId);
    }
  }, [
    assetIdValue,
    setValue,
    bridgeableAssets,
    chainportTokensMap,
    defaultAssetId,
  ]);

  // Clear destination network if the selected asset changes
  // Might be better to wait and retain the network if it exists in the new set of token paths
  useEffect(() => {
    setValue("destinationNetworkId", null);
  }, [assetIdValue, setValue]);

  // Switch to the first available network for the selected asset
  useEffect(() => {
    if (
      availableNetworks &&
      availableNetworks.length > 0 &&
      destinationNetworkId === null
    ) {
      setValue(
        "destinationNetworkId",
        availableNetworks[0].chainport_network_id.toString(),
      );
    }
  }, [availableNetworks, destinationNetworkId, setValue]);

  return (
    <>
      <chakra.form
        onSubmit={handleSubmit((data) => {
          setTransactionDetailsError("");

          const destinationNetwork = availableNetworks?.find(
            (n) =>
              data.destinationNetworkId === n.chainport_network_id.toString(),
          );
          if (!destinationNetwork) {
            return;
          }

          if (handleIfAmountExceedsBalance(data.amount)) {
            return;
          }

          setConfirmationData({
            amount: data.amount,
            fromAccount: data.fromAccount,
            assetId: data.assetId,
            destinationNetwork: destinationNetwork,
            targetAddress: getChecksumAddress(data.targetAddress),
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
                  onAssetIdChange={async (e) => {
                    setValue("assetId", e.target.value);
                    field.onChange("0");
                  }}
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
                          decimalsOverride:
                            chainportTokensMap[assetIdValue].decimals,
                        });
                      }}
                      onFocus={() => {
                        if (amountValue === "0") {
                          field.onChange("");
                        }
                        clearErrors("amount");
                      }}
                      onBlur={() => {
                        if (!amountValue) {
                          field.onChange("0");
                        }

                        const value = amountValue.endsWith(".")
                          ? amountValue.slice(0, -1)
                          : amountValue;

                        if (amountValue.endsWith(".")) {
                          field.onChange(value);
                        }

                        handleIfAmountExceedsBalance(value);
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
                renderChildren={(children) => (
                  <HStack>
                    <Image src={chainportIcon} alt="" height={24} width={24} />
                    {children}
                  </HStack>
                )}
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
                _dark={{
                  color: COLORS.DARK_MODE.GRAY_LIGHT,
                }}
              >
                {formatMessage(messages.needHelp)}
              </Text>
            </HStack>
          }
          destinationNetworkInput={
            <Select
              {...register("destinationNetworkId")}
              disabled={!availableNetworks}
              value={destinationNetworkId ?? undefined}
              label={formatMessage(messages.destinationNetwork)}
              options={(availableNetworks ?? []).map((n) => ({
                label: n.label,
                value: n.chainport_network_id.toString(),
              }))}
              renderChildren={(children) => (
                <HStack>
                  {selectedNetwork && (
                    <ChakraImage
                      src={selectedNetwork.network_icon}
                      boxSize="24px"
                    />
                  )}
                  {children}
                </HStack>
              )}
            />
          }
          targetAddressInput={
            <TextInput
              {...register("targetAddress")}
              label="Target Address"
              error={formErrors.targetAddress?.message}
              icon={targetAddressIcon}
            />
          }
          topLevelErrorMessage={transactionDetailsError}
        />
      </chakra.form>
      {!!confirmationData && (
        <BridgeConfirmationModal
          onClose={() => setConfirmationData(null)}
          formData={confirmationData}
          targetNetwork={confirmationData.destinationNetwork}
          selectedAsset={assetOptionsMap.get(confirmationData.assetId)!}
          chainportToken={chainportTokensMap[confirmationData.assetId]!}
          handleTransactionDetailsError={(errorMessage) =>
            setTransactionDetailsError(errorMessage)
          }
        />
      )}
    </>
  );
}

export function BridgeAssetsForm() {
  const { data: accountsData } = trpcReact.getAccounts.useQuery();
  const filteredAccounts = accountsData?.filter((a) => !a.status.viewOnly);
  const {
    data: tokensData,
    isLoading: isChainportLoading,
    isError: isTokensError,
    error: tokensError,
  } = trpcReact.getChainportTokens.useQuery();

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

  if (filteredAccounts.length === 0) {
    return <NoSpendingAccountsMessage />;
  }

  if (isTokensError) {
    throw new Error(tokensError.message ?? "Chainport data not found");
  }

  return (
    <BridgeAssetsFormContent
      accountsData={filteredAccounts}
      chainportTokensMap={tokensData.chainportTokensMap}
    />
  );
}
