import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { UseFormRegisterReturn } from "react-hook-form";
import { defineMessages, useIntl } from "react-intl";

import { COLORS } from "@/ui/colors";
import { Select } from "@/ui/Forms/Select/Select";
import { TextInput } from "@/ui/Forms/TextInput/TextInput";

import { normalizeAmountInputChange, AssetOptionType } from "./utils";

const messages = defineMessages({
  balanceAvailable: {
    defaultMessage: "{balance} {asset} available",
  },
});

type Props = {
  assetOptions: AssetOptionType[];
  assetOptionsMap: Map<string, AssetOptionType>;
  amountValue: string;
  onAmountChangeStart?: () => void;
  onAmountChange: (value: string) => void;
  assetIdValue: string;
  onAssetIdChange: UseFormRegisterReturn["onChange"];
  error?: string;
};

export function AssetAmountInput({
  assetOptions,
  assetOptionsMap,
  amountValue,
  onAmountChangeStart,
  onAmountChange,
  assetIdValue,
  onAssetIdChange,
  error,
}: Props) {
  const { formatMessage } = useIntl();

  const selectedAsset = assetOptionsMap.get(assetIdValue);

  return (
    <VStack alignItems="stretch">
      <HStack gap={0}>
        <Box flexGrow={1}>
          <TextInput
            aria-label="Amount"
            value={amountValue}
            onChange={(e) => {
              normalizeAmountInputChange({
                changeEvent: e,
                selectedAsset,
                onChange: (value) => onAmountChange(value),
                onStart: onAmountChangeStart,
              });
            }}
            onFocus={() => {
              if (amountValue === "0") {
                onAmountChange("");
              }
            }}
            onBlur={() => {
              if (!amountValue) {
                onAmountChange("0");
              }
              if (amountValue.endsWith(".")) {
                onAmountChange(amountValue.slice(0, -1));
              }
            }}
            error={error}
            triggerProps={{
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              borderRightWidth: 0,
            }}
            rightElement={
              selectedAsset ? (
                <Text
                  as="button"
                  type="button"
                  color={COLORS.VIOLET}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAmountChange(selectedAsset.confirmedBalance);
                  }}
                >
                  MAX
                </Text>
              ) : null
            }
          />
        </Box>
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
    </VStack>
  );
}
