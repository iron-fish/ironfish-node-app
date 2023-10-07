import { getAccount } from "./utils/getAccount";
import { ironfish } from "../ironfish";

export async function handleGetAccounts() {
  const rcpClient = await ironfish.getRpcClient();

  const accountsResponse = await rcpClient.wallet.getAccounts();

  const fullAccounts = accountsResponse.content.accounts.map((account) =>
    getAccount(account),
  );

  const response = await Promise.all(fullAccounts);

  return response;
}
