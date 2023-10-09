import { ironfish } from "../ironfish";
import { resolveContentStream } from "../utils/resolveContentStream";

type Params = {
  name: string;
};

export async function handleGetTransactions({ name }: Params) {
  const rpcClient = await ironfish.getRpcClient();

  const transactionsStream =
    await rpcClient.wallet.getAccountTransactionsStream({
      account: name,
    });

  return resolveContentStream(transactionsStream.contentStream());
}
