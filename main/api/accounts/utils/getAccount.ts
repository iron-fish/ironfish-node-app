import { formatBalances } from "./formatBalances";
import { manager } from "../../manager";

export async function getAccount(account: string) {
  const ironfish = await manager.getIronfish();
  const rpcClient = await ironfish.rpcClient();

  const balancesResponse = await rpcClient.wallet.getAccountBalances({
    account,
  });

  const status = await rpcClient.wallet.getAccountStatus({ account });

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
    status: status.content.account,
  };
}
