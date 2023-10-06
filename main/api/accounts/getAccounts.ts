import { ironfish } from "../ironfish";

export async function getAccounts() {
  const rcpClient = await ironfish.getRpcClient();

  const accountsResponse = await rcpClient.wallet.getAccounts();

  const fullAccounts = accountsResponse.content.accounts.map(
    async (account) => {
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
        name: account.toUpperCase(),
        address: publicAddressResponse.content.publicKey,
        balances,
      };
    },
  );

  const response = await Promise.all(fullAccounts);

  return response;
}
