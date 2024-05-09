import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { defineMessages, useIntl } from "react-intl";

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
  assetIdValue: string;
  amountValue: string;
  onAmountChange: (value: string) => void;
  error?: string;
};

export function AssetAmountInput({
  assetOptions,
  assetOptionsMap,
  amountValue,
  assetIdValue,
  onAmountChange,
  error,
}: Props) {
  const { formatMessage } = useIntl();

  const selectedAsset = assetOptionsMap.get(assetIdValue);

  return (
    <VStack alignItems="stretch">
      <HStack gap={0}>
        <Box flexGrow={1}>
          <TextInput
            value={amountValue}
            onChange={(e) => {
              normalizeAmountInputChange({
                changeEvent: e,
                selectedAsset,
                onChange: (value) => onAmountChange(value),
                onStart: () => console.log("start"),
              });
            }}
            onFocus={() => {}}
            onBlur={() => {}}
            label="Amount"
            error={error}
            triggerProps={{
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              borderRightWidth: 0,
            }}
          />
        </Box>
        <Select
          value={assetIdValue}
          label="Asset"
          options={assetOptions}
          onChange={async () => {}}
          name="assetId"
          triggerProps={{
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
          }}
        />
      </HStack>
      {selectedAsset && (
        <Text>
          {formatMessage(messages.balanceAvailable, {
            asset: selectedAsset.assetName,
            balance: selectedAsset.confirmedBalance,
          })}
        </Text>
      )}
    </VStack>
  );
}
