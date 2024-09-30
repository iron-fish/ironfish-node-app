import { AggregateSignatureSharesRequest } from "@ironfish/sdk";

import { manager } from "../../manager";

export async function handleAggregateSignatureShares({
  request,
}: {
  request: AggregateSignatureSharesRequest;
}) {
  const ironfish = await manager.getIronfish();
  const rpcClient = await ironfish.rpcClient();

  const response =
    await rpcClient.wallet.multisig.aggregateSignatureShares(request);
  return response.content;
}
