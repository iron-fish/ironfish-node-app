import { formatTransactionsToNotes } from "./utils/formatTransactionsToNotes";
import { ironfish } from "../ironfish";
import { resolveContentStream } from "../utils/resolveContentStream";

type Params = {
  accountName: string;
};

export async function handleGetTransactions({ accountName }: Params) {
  const rpcClient = await ironfish.getRpcClient();

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
