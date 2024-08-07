import { RawTransactionSerde } from "@ironfish/sdk";
import { z } from "zod";

import { manager } from "../manager";
import { createRawTransaction } from "../utils/transactions";

export const handleSendTransactionInput = z.object({
  fromAccount: z.string(),
  toAccount: z.string(),
  assetId: z.string(),
  amount: z.string(),
  fee: z.number().nullable(),
  memo: z.string().optional(),
});

export async function handleSendTransaction({
  fromAccount,
  toAccount,
  assetId,
  amount,
  fee,
  memo,
}: z.infer<typeof handleSendTransactionInput>) {
  const ironfish = await manager.getIronfish();
  const rpcClient = await ironfish.rpcClient();

  const rawTx = await createRawTransaction({
    fromAccount,
    toAccount,
    assetId,
    amount,
    fee,
    memo,
  });

  const postResponse = await rpcClient.wallet.postTransaction({
    transaction: RawTransactionSerde.serialize(rawTx).toString("hex"),
    account: fromAccount,
  });

  return postResponse.content;
}
