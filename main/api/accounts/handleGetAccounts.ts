import { getAccount } from "./utils/getAccount";
import { manager } from "../manager";

export async function handleGetAccounts() {
  const ironfish = await manager.getIronfish();
  const rpcClient = await ironfish.rpcClient();

  const accountsResponse = await rpcClient.wallet.getAccounts();
  const fullAccounts = await Promise.all(
    accountsResponse.content.accounts.map((account) => getAccount(account)),
  );

  // Find and rename unnamed accounts
  const unnamedAccounts = fullAccounts.filter((account) => !account.name);

  // Try to rename each unnamed account
  for (const account of unnamedAccounts) {
    try {
      // Use last 4 characters of the address
      const newName = `unnamed-account-${account.address.slice(-4)}`;

      await rpcClient.wallet.renameAccount({
        account: "",
        newName,
      });
      // Update the account name in our local array
      account.name = newName;
    } catch (error) {
      console.error(`Failed to rename account ${account.address}:`, error);
    }
  }

  return fullAccounts;
}
