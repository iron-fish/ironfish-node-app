import { AccountFormat } from "@ironfish/sdk";
import { AccountImport } from "@ironfish/sdk/build/src/wallet/exporter";

import { getAccount } from "./utils/getAccount";
import { manager } from "../manager";

export async function handleGetMultisigLedgerAccounts() {
  const ironfish = await manager.getIronfish();
  const rpcClient = await ironfish.rpcClient();

  const accountsResponse = await rpcClient.wallet.getAccounts();

  const multisigLedgerAccounts: string[] = [];
  for (const account of accountsResponse.content.accounts) {
    const exported = await rpcClient.wallet.exportAccount({
      account,
      format: AccountFormat.JSON,
    });
    const decoded = JSON.parse(exported.content.account) as AccountImport;
    if(decoded.multisigKeys && decoded.spendingKey === null) {
      multisigLedgerAccounts.push(account);
    }
  }

  const fullAccounts = multisigLedgerAccounts.map((account) =>
    getAccount(account),
  );

  const response = await Promise.all(fullAccounts);

  return response;
}
