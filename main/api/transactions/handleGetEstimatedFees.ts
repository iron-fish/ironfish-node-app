import { CreateTransactionResponse, RawTransactionSerde } from "@ironfish/sdk";

import { manager } from "../manager";

export async function handleGetEstimatedFees({
  accountName,
  outputs,
}: {
  accountName: string;
  outputs: {
    publicAddress: string;
    amount: string;
    memo?: string;
    memoHex?: string;
    assetId?: string;
  }[];
}) {
  const ironfish = await manager.getIronfish();
  const rpcClient = await ironfish.rpcClient();
  const estimatedFees = await rpcClient.chain.estimateFeeRates();

  const results: CreateTransactionResponse[] = await Promise.all(
    [
      estimatedFees.content.slow,
      estimatedFees.content.average,
      estimatedFees.content.fast,
    ].map((feeRate) =>
      rpcClient.wallet
        .createTransaction({
          account: accountName,
          outputs,
          feeRate,
        })
        .then((result) => result.content),
    ),
  );

  const fees: bigint[] = results.map(
    (result) =>
      RawTransactionSerde.deserialize(Buffer.from(result.transaction, "hex"))
        .fee,
  );

  return {
    slow: parseInt(fees[0].toString()),
    average: parseInt(fees[1].toString()),
    fast: parseInt(fees[2].toString()),
  };
}
