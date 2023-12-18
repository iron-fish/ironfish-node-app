import { formatTransactionsToNotes } from "./utils/formatTransactionsToNotes";
import { manager } from "../manager";
import { resolveContentStream } from "../utils/resolveContentStream";

type Params = {
  accountName: string;
  cursor?: number;
  limit?: number;
};

export async function handleGetTransactions({
  accountName,
  cursor,
  limit,
}: Params) {
  const ironfish = await manager.getIronfish();
  const rpcClient = await ironfish.rpcClient();

  const transactionsStream =
    await rpcClient.wallet.getAccountTransactionsStream({
      offset: cursor,
      limit: limit,
      account: accountName,
      notes: true,
    });

  const transactions = await resolveContentStream(
    transactionsStream.contentStream(),
  );

  const notes = await formatTransactionsToNotes(
    rpcClient,
    transactions,
    accountName,
  );

  return {
    transactions: notes,
    hasNextPage:
      typeof limit === "undefined" ? false : transactions.length >= limit,
    nextCursor: (cursor ?? 0) + transactions.length,
  };
}
