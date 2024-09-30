import { CreateSigningPackageRequest } from "@ironfish/sdk";

import { manager } from "../../manager";

export async function handleCreateSigningPackage({
  request,
}: {
  request: CreateSigningPackageRequest;
}) {
  const ironfish = await manager.getIronfish();
  const rpcClient = await ironfish.rpcClient();

  const response =
    await rpcClient.wallet.multisig.createSigningPackage(request);
  return response.content;
}
