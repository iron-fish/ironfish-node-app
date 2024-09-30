import { CreateSigningCommitmentRequest } from "@ironfish/sdk";

import { manager } from "../manager";

export async function handleCreateSigningCommitment({
  request,
}: {
  request: CreateSigningCommitmentRequest;
}) {
  const ironfish = await manager.getIronfish();
  const rpcClient = await ironfish.rpcClient();

  const response =
    await rpcClient.wallet.multisig.createSigningCommitment(request);
  return response.content;
}
