import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import Image from "next/image";
import { UseFormRegisterReturn } from "react-hook-form";
import { defineMessages, useIntl } from "react-intl";

import verifiedIcon from "@/images/verified-icon.svg";
import { COLORS } from "@/ui/colors";
import { Select } from "@/ui/Forms/Select/Select";

import { AssetOptionType } from "./utils";

const messages = defineMessages({
  balanceAvailable: {
    defaultMessage: "{balance} {asset} available",
  },
});

type Props = {
  inputElement: JSX.Element;
  assetOptions: AssetOptionType[];
  assetOptionsMap: Map<string, AssetOptionType>;
  assetIdValue: string;
  onAssetIdChange: UseFormRegisterReturn["onChange"];
  error?: string;
};

export function AssetAmountInput({
  inputElement,
  assetOptions,
  assetOptionsMap,
  assetIdValue,
  onAssetIdChange,
  error,
}: Props) {
  const { formatMessage } = useIntl();

  const selectedAsset = assetOptionsMap.get(assetIdValue);

  return (
    <VStack alignItems="stretch">
      <HStack gap={0}>
        <Box flexGrow={1}>{inputElement}</Box>
        <Select
          aria-label="Asset"
          value={assetIdValue}
          options={assetOptions}
          onChange={onAssetIdChange}
          name="assetId"
          triggerProps={{
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
          }}
          renderChildren={(children) => (
            <HStack minWidth="100px">
              <Image
                src={selectedAsset?.asset.verification.logoURI ?? ""}
                alt=""
                height="24"
                width="24"
              />
              {children}
              {selectedAsset?.asset.verification.status === "verified" && (
                <Image src={verifiedIcon} alt="" />
              )}
            </HStack>
          )}
        />
      </HStack>
      {selectedAsset && (
        <Text color={COLORS.GRAY_MEDIUM}>
          {formatMessage(messages.balanceAvailable, {
            asset: selectedAsset.assetName,
            balance: selectedAsset.confirmedBalance,
          })}
        </Text>
      )}
      {error && (
        <Text
          color={COLORS.RED}
          fontSize="sm"
          textAlign="left"
          w="100%"
          _dark={{
            color: COLORS.RED,
          }}
        >
          {error}
        </Text>
      )}
    </VStack>
  );
}
