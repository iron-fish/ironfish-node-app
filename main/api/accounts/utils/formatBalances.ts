import type { RpcClient, RpcAsset } from "@ironfish/sdk";

import { IRON_ID } from "../../../../shared/constants";

type BalancesResponse = Awaited<
  ReturnType<RpcClient["wallet"]["getAccountBalances"]>
>;

type Balances = BalancesResponse["content"]["balances"];
type Balance = Balances[number];

type BalanceWithAsset = Balance & { asset: RpcAsset };

export function formatBalances(balances: BalanceWithAsset[]) {
  let ironAsset: BalanceWithAsset | null = null;
  const customAssets: BalanceWithAsset[] = [];

  for (const balance of balances) {
    if (balance.assetId === IRON_ID) {
      ironAsset = balance;
    } else {
      customAssets.push(balance);
    }
  }

  return {
    iron: ironAsset!,
    custom: customAssets,
  };
}
