import { RpcWalletTransaction } from "@ironfish/sdk";

import { formatTransactionsToNotes } from "./utils/formatTransactionsToNotes";
import { manager } from "../manager";
import { resolveContentStream } from "../utils/resolveContentStream";

type Params = {
  accountName: string;
};

export async function handleGetTransactions({ accountName }: Params) {
  const ironfish = await manager.getIronfish();
  const rpcClient = await ironfish.rpcClient();

  const transactionsStream =
    await rpcClient.wallet.getAccountTransactionsStream({
      account: accountName,
      notes: true,
    });

  const transactions = await resolveContentStream(
    transactionsStream.contentStream(),
  );

  return formatTransactionsToNotes(rpcClient, transactions, accountName);
}

export async function handleGetTransactionsForContact({
  accountName,
  contactAddress,
}: Params & { contactAddress: string }) {
  const ironfish = await manager.getIronfish();
  const rpcClient = await ironfish.rpcClient();

  const transactionsStream =
    await rpcClient.wallet.getAccountTransactionsStream({
      account: accountName,
      notes: true,
    });

  const results: Array<RpcWalletTransaction> = [];

  for await (const transaction of transactionsStream.contentStream()) {
    if (
      transaction.notes?.some(
        (note) =>
          note.owner === contactAddress || note.sender === contactAddress,
      )
    ) {
      results.push(transaction);
    }
  }

  return formatTransactionsToNotes(rpcClient, results, accountName);
}
