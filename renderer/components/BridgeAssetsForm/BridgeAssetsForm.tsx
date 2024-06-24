import {
  HStack,
  Skeleton,
  Text,
  chakra,
  Image as ChakraImage,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ItemText } from "@radix-ui/react-select";
import { isAddress } from "ethers";
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
  networkErrorMessage: {
    defaultMessage: "A network error occured, please try again",
  },
});

type ChainportToken =
  TRPCRouterOutputs["getChainportTokens"]["chainportTokens"][number];
type ChainportTargetNetwork = ChainportToken["targetNetworks"][number];

function BridgeAssetsFormContent({
  accountsData,
  chainportTokensMap,
  chainportTargetNetworksMap,
}: {
  accountsData: TRPCRouterOutputs["getAccounts"];
  chainportTokensMap: Record<string, ChainportToken>;
  chainportTargetNetworksMap: Record<string, ChainportTargetNetwork>;
}) {
  const { formatMessage } = useIntl();

  const [confirmationData, setConfirmationData] =
    useState<BridgeAssetsFormData | null>(null);
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
    mode: "onBlur",
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

  const currentNetwork = chainportTargetNetworksMap[destinationNetworkValue];

  const bridgeableAssets = useMemo(() => {
    const withAdditionalFields = assetOptions
      .map((item) => {
        const isBridgableForNetwork = chainportTokensMap[
          item.asset.id
        ]?.targetNetworks.some(
          (network) => network.chainId === currentNetwork.chainId,
        );
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
          disabled: !isBridgableForNetwork,
        };
      })
      .toSorted((a, b) => {
        if (a.disabled && !b.disabled) return 1;
        if (!a.disabled && b.disabled) return -1;
        return 0;
      });

    return withAdditionalFields;
  }, [chainportTokensMap, assetOptions, currentNetwork]);

  const availableNetworks = chainportTokensMap[assetIdValue]?.targetNetworks;

  if (!availableNetworks) {
    throw new Error("No available networks found");
  }

  const selectedAsset = assetOptionsMap.get(assetIdValue);

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

  return (
    <>
      <chakra.form
        onSubmit={handleSubmit((data) => {
          setTransactionDetailsError("");

          if (handleIfAmountExceedsBalance(data.amount)) {
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
              {...register("destinationNetwork")}
              value={destinationNetworkValue}
              label={formatMessage(messages.destinationNetwork)}
              options={availableNetworks}
              renderChildren={(children) => (
                <HStack>
                  <ChakraImage
                    src={currentNetwork.networkIcon}
                    boxSize="24px"
                  />
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
          targetNetwork={
            chainportTargetNetworksMap[confirmationData.destinationNetwork]!
          }
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

  if (isTokensError) {
    throw new Error(tokensError.message ?? "Chainport data not found");
  }

  return (
    <BridgeAssetsFormContent
      accountsData={filteredAccounts}
      chainportTokensMap={tokensData.chainportTokensMap}
      chainportTargetNetworksMap={tokensData.chainportNetworksMap}
    />
  );
}
