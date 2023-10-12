import { formatBalances } from "./formatBalances";
import { ironfish } from "../../ironfish";

export async function getAccount(account: string) {
  const rpcClient = await ironfish.rpcClient();

  const balancesResponse = await rpcClient.wallet.getAccountBalances({
    account,
  });

  const balances = await Promise.all(
    balancesResponse.content.balances.map(async (balance) => {
      const assetResponse = await rpcClient.chain.getAsset({
        id: balance.assetId,
      });

      return {
        ...balance,
        asset: assetResponse.content,
      };
    }),
  );

  const publicAddressResponse = await rpcClient.wallet.getAccountPublicKey({
    account,
  });

  return {
    name: account,
    address: publicAddressResponse.content.publicKey,
    balances: formatBalances(balances),
  };
}
