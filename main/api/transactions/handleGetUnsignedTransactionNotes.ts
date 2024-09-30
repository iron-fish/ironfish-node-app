import { GetUnsignedTransactionNotesRequest } from "@ironfish/sdk";

import { manager } from "../manager";

export async function handleGetUnsignedTransactionNotes({
  request,
}: {
  request: GetUnsignedTransactionNotesRequest;
}) {
  const ironfish = await manager.getIronfish();
  const rpcClient = await ironfish.rpcClient();

  const response = await rpcClient.wallet.getUnsignedTransactionNotes(request);
  return response.content;
}
