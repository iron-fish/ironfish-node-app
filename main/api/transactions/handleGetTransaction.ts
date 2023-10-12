import { ironfish } from "../ironfish";
import { resolveContentStream } from "../utils/resolveContentStream";

export async function handleGetTransaction({
  transactionHash,
}: {
  transactionHash: string;
}) {
  const rpcClient = await ironfish.getRpcClient();

  const transactionsStream =
    await rpcClient.wallet.getAccountTransactionsStream({
      hash: transactionHash,
      notes: true,
    });

  const transaction = await resolveContentStream(
    transactionsStream.contentStream(),
  );

  return transaction[0];
}
