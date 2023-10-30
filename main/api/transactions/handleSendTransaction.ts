import {
  CreateTransactionRequest,
  CurrencyUtils,
  RawTransactionSerde,
} from "@ironfish/sdk";
import { z } from "zod";

import { manager } from "../manager";

export const handleSendTransactionInput = z.object({
  fromAccount: z.string(),
  toAccount: z.string(),
  assetId: z.string(),
  amount: z.number(),
  fee: z.number(),
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

  const params: CreateTransactionRequest = {
    account: fromAccount,
    outputs: [
      {
        publicAddress: toAccount,
        amount: CurrencyUtils.encode(BigInt(amount)),
        memo: memo ?? "",
        assetId: assetId,
      },
    ],
    fee: CurrencyUtils.encode(BigInt(fee)),
    feeRate: null,
    expiration: undefined,
    confirmations: undefined,
  };

  const createResponse = await rpcClient.wallet.createTransaction(params);
  const bytes = Buffer.from(createResponse.content.transaction, "hex");
  const rawTx = RawTransactionSerde.deserialize(bytes);

  const postResponse = await rpcClient.wallet.postTransaction({
    transaction: RawTransactionSerde.serialize(rawTx).toString("hex"),
    account: fromAccount,
  });

  return postResponse;
}
