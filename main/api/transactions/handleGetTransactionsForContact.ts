import { RpcWalletTransaction } from "@ironfish/sdk";

import { formatTransactionsToNotes } from "./utils/formatTransactionsToNotes";
import { TransactionNote } from "../../../shared/types";
import { manager } from "../manager";

export async function handleGetTransactionsForContact({
  contactAddress,
}: {
  contactAddress: string;
}) {
  const ironfish = await manager.getIronfish();
  const rpcClient = await ironfish.rpcClient();

  const accountsResponse = await rpcClient.wallet.getAccounts();
  const accountNames = accountsResponse.content.accounts;

  const result: Array<TransactionNote> = [];

  for (const accountName of accountNames) {
    const transactionsStream =
      await rpcClient.wallet.getAccountTransactionsStream({
        account: accountName,
        notes: true,
      });

    const transactions: Array<RpcWalletTransaction> = [];

    for await (const transaction of transactionsStream.contentStream()) {
      if (
        transaction.notes?.some(
          (note) =>
            note.owner === contactAddress || note.sender === contactAddress,
        )
      ) {
        transactions.push(transaction);
      }
    }

    const networkId = (await rpcClient.chain.getNetworkInfo()).content
      .networkId;

    const notes = await formatTransactionsToNotes(
      rpcClient,
      transactions,
      accountName,
      networkId,
    );

    result.push(...notes);
  }

  return result;
}
