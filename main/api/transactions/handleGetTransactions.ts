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
