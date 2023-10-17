import { getAccount } from "./utils/getAccount";
import { manager } from "../manager";

export async function handleGetAccounts() {
  const ironfish = await manager.getIronfish();
  const rpcClient = await ironfish.rpcClient();

  const accountsResponse = await rpcClient.wallet.getAccounts();

  const fullAccounts = accountsResponse.content.accounts.map((account) =>
    getAccount(account),
  );

  const response = await Promise.all(fullAccounts);

  return response;
}
