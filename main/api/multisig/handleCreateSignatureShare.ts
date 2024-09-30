import { CreateSignatureShareRequest } from "@ironfish/sdk";

import { manager } from "../manager";

export async function handleCreateSignatureShare({
  request,
}: {
  request: CreateSignatureShareRequest;
}) {
  const ironfish = await manager.getIronfish();
  const rpcClient = await ironfish.rpcClient();

  const response =
    await rpcClient.wallet.multisig.createSignatureShare(request);
  return response.content;
}
