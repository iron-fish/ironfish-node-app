import { CreateTransactionRequest, RawTransactionSerde } from "@ironfish/sdk";

import { manager } from "../manager";

export async function handleCreateUnsignedTransaction({
  request,
}: {
  request: CreateTransactionRequest;
}) {
  const ironfish = await manager.getIronfish();
  const rpcClient = await ironfish.rpcClient();

  let feeRate = request.feeRate;
  if (request.fee === null && request.feeRate === null) {
    const response = await rpcClient.wallet.estimateFeeRates();
    feeRate = response.content.fast;
  }

  const responseRaw = await rpcClient.wallet.createTransaction({
    ...request,
    feeRate,
  });
  const bytes = Buffer.from(responseRaw.content.transaction, "hex");
  const raw = RawTransactionSerde.deserialize(bytes);
  const responseUnsigned = await rpcClient.wallet.buildTransaction({
    account: request.account,
    rawTransaction: RawTransactionSerde.serialize(raw).toString("hex"),
  });

  return responseUnsigned.content;
}
