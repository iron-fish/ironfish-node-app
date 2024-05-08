import { Box, HStack } from "@chakra-ui/react";

import { TRPCRouterOutputs } from "@/providers/TRPCProvider";
import { Select } from "@/ui/Forms/Select/Select";
import { TextInput } from "@/ui/Forms/TextInput/TextInput";

type AccountType = TRPCRouterOutputs["getAccounts"][number];
type BalanceType = AccountType["balances"]["iron"];
type AssetType = BalanceType["asset"];
type AssetOptionType = {
  assetName: string;
  label: string;
  value: string;
  asset: AssetType;
};

type Props = {
  selectedAsset: string;
  assetOptions: AssetOptionType[];
  amountValue: string;
  error?: string;
};

export function AssetAmountInput({
  assetOptions,
  selectedAsset,
  amountValue,
  error,
}: Props) {
  return (
    <HStack gap={0}>
      <Box flexGrow={1}>
        <TextInput
          value={amountValue}
          onChange={(_e) => {
            // clearErrors("root.serverError");
            // // remove any non-numeric characters except for periods
            // const azValue = e.target.value.replace(/[^\d.]/g, "");
            // // only allow one period
            // if (azValue.split(".").length > 2) {
            //   e.preventDefault();
            //   return;
            // }
            // const assetToSend = assetOptionsMap.get(assetIdValue);
            // const decimals = assetToSend?.asset.verification?.decimals ?? 0;
            // let finalValue = azValue;
            // if (decimals === 0) {
            //   // If decimals is 0, take the left side of the decimal.
            //   // If no decimal is present, this will still work correctly.
            //   finalValue = azValue.split(".")[0];
            // } else {
            //   // Otherwise, take the left side of the decimal and up to the correct number of decimal places.
            //   const parts = azValue.split(".");
            //   if (parts[1]?.length > decimals) {
            //     finalValue = `${parts[0]}.${parts[1].slice(0, decimals)}`;
            //   }
            // }
            // field.onChange(finalValue);
          }}
          onFocus={() => {
            // if (field.value === "0") {
            //   field.onChange("");
            // }
          }}
          onBlur={() => {
            // if (!field.value) {
            //   field.onChange("0");
            // }
            // if (field.value.endsWith(".")) {
            //   field.onChange(field.value.slice(0, -1));
            // }
          }}
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
        // {...register("assetId")}
        value={selectedAsset}
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
  );
}
