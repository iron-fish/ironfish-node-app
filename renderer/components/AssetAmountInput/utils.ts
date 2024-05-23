import { ChangeEvent, useMemo } from "react";

import { TRPCRouterOutputs } from "@/providers/TRPCProvider";
import { CurrencyUtils } from "@/utils/currency";
import { hexToUTF16String } from "@/utils/hexToUTF16String";

type AccountType = TRPCRouterOutputs["getAccounts"][number];
type BalanceType = AccountType["balances"]["iron"];
type AssetType = BalanceType["asset"];
export type AssetOptionType = {
  assetName: string;
  label: string;
  value: string;
  asset: AssetType;
  confirmedBalance: string;
};

function getAccountBalances(account: AccountType): {
  [key: string]: BalanceType;
} {
  const customAssets = account.balances.custom?.reduce((acc, customAsset) => {
    return {
      ...acc,
      [customAsset.asset.id]: customAsset,
    };
  }, {});
  return {
    [account.balances.iron.asset.id]: account.balances.iron,
    ...customAssets,
  };
}

export function useAccountAssets(
  account: AccountType,
  { balanceInLabel = true }: { balanceInLabel?: boolean } = {},
) {
  const accountBalances = useMemo(() => {
    return getAccountBalances(account);
  }, [account]);

  const assetOptionsMap = useMemo(() => {
    const entries: Array<[string, AssetOptionType]> = Object.values(
      accountBalances,
    ).map((balance) => {
      const assetName = hexToUTF16String(balance.asset.name);
      const confirmed = CurrencyUtils.render(
        BigInt(balance.confirmed),
        balance.asset.id,
        balance.asset.verification,
      );

      return [
        balance.asset.id,
        {
          assetName: assetName,
          label: assetName + (balanceInLabel ? ` (${confirmed})` : ""),
          value: balance.asset.id,
          asset: balance.asset,
          confirmedBalance: confirmed,
          disabled: true,
        },
      ];
    });
    return new Map(entries);
  }, [accountBalances, balanceInLabel]);

  const assetOptions = useMemo(
    () => Array.from(assetOptionsMap.values()),
    [assetOptionsMap],
  );

  return {
    accountBalances,
    assetOptions,
    assetOptionsMap,
  };
}

export function normalizeAmountInputChange({
  changeEvent,
  selectedAsset,
  onChange,
  onStart,
}: {
  changeEvent: ChangeEvent<HTMLInputElement>;
  selectedAsset: AssetOptionType | undefined;
  onChange: (value: string) => void;
  onStart?: () => void;
}) {
  onStart?.();

  // remove any non-numeric characters except for periods
  const azValue = changeEvent.target.value.replace(/[^\d.]/g, "");

  if (
    !selectedAsset ||
    // only allow one period
    azValue.split(".").length > 2
  ) {
    changeEvent.preventDefault();
    return;
  }
  const decimals = selectedAsset.asset.verification?.decimals ?? 0;

  let finalValue = azValue;

  if (decimals === 0) {
    // If decimals is 0, take the left side of the decimal.
    // If no decimal is present, this will still work correctly.
    finalValue = azValue.split(".")[0];
  } else {
    // Otherwise, take the left side of the decimal and up to the correct number of decimal places.
    const parts = azValue.split(".");
    if (parts[1]?.length > decimals) {
      finalValue = `${parts[0]}.${parts[1].slice(0, decimals)}`;
    }
  }

  onChange(finalValue);
}
