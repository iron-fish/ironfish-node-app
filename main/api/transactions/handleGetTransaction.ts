import { getTransactionNotes } from "./utils/formatTransactionsToNotes";
import { ironfish } from "../ironfish";
import { resolveContentStream } from "../utils/resolveContentStream";

export async function handleGetTransaction({
  accountName,
  transactionHash,
}: {
  accountName: string;
  transactionHash: string;
}) {
  const rpcClient = await ironfish.rpcClient();

  const transactionsStream =
    await rpcClient.wallet.getAccountTransactionsStream({
      hash: transactionHash,
      notes: true,
    });

  const streamResult = await resolveContentStream(
    transactionsStream.contentStream(),
  );

  const transaction = streamResult[0];

  const notes = await getTransactionNotes(rpcClient, transaction, accountName);

  return {
    transaction,
    notes,
  };
}
