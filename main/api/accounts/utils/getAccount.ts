import { ironfish } from "../../ironfish";

export async function getAccount(account: string) {
  const rcpClient = await ironfish.getRpcClient();

  const balancesResponse = await rcpClient.wallet.getAccountBalances({
    account,
  });

  const balances = await Promise.all(
    balancesResponse.content.balances.map(async (balance) => {
      const assetResponse = await rcpClient.chain.getAsset({
        id: balance.assetId,
      });

      return {
        ...balance,
        asset: assetResponse.content,
      };
    }),
  );

  const publicAddressResponse = await rcpClient.wallet.getAccountPublicKey({
    account,
  });

  return {
    name: account,
    address: publicAddressResponse.content.publicKey,
    balances,
  };
}
