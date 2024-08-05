import {
  CreateTransactionRequest,
  CurrencyUtils,
  RawTransactionSerde,
} from "@ironfish/sdk";
import { z } from "zod";

import { manager } from "../manager";

export const createTransactionInput = z.object({
  fromAccount: z.string(),
  toAccount: z.string(),
  assetId: z.string(),
  amount: z.string(),
  fee: z.number(),
  memo: z.string().optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionInput>;

export async function createUnsignedTransaction({
  fromAccount,
  toAccount,
  assetId,
  amount,
  fee,
  memo,
}: CreateTransactionInput) {
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

  const serializedRawTx = RawTransactionSerde.serialize(rawTx);
  const builtTransactionResponse = await rpcClient.wallet.buildTransaction({
    rawTransaction: serializedRawTx.toString("hex"),
    account: fromAccount,
  });
  return builtTransactionResponse.content.unsignedTransaction;
}

export async function createRawTransaction({
  fromAccount,
  toAccount,
  assetId,
  amount,
  fee,
  memo,
}: CreateTransactionInput) {
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
  return RawTransactionSerde.deserialize(bytes);
}
