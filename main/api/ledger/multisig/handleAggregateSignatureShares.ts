import { AggregateSignatureSharesRequest, Transaction } from "@ironfish/sdk";

import { manager } from "../../manager";

export async function handleAggregateSignatureShares(
  request: AggregateSignatureSharesRequest,
) {
  const ironfish = await manager.getIronfish();
  const rpcClient = await ironfish.rpcClient();

  const response =
    await rpcClient.wallet.multisig.aggregateSignatureShares(request);

  const transaction = new Transaction(
    Buffer.from(response.content.transaction, "hex"),
  );
  return { ...response.content, txHash: transaction.hash().toString("hex") };
}
