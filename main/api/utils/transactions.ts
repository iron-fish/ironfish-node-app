import {
  CreateTransactionRequest,
  CurrencyUtils,
  RawTransactionSerde,
  RpcClient,
} from "@ironfish/sdk";
import { z } from "zod";

import { manager } from "../manager";

export const createTransactionInput = z.object({
  fromAccount: z.string(),
  toAccount: z.string(),
  assetId: z.string(),
  amount: z.string(),
  fee: z.number().nullable(),
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

  const baseTx = await createTransaction(
    {
      fromAccount,
      toAccount,
      assetId,
      amount,
      fee,
      memo,
    },
    rpcClient,
  );

  const builtTransactionResponse = await rpcClient.wallet.buildTransaction({
    rawTransaction: baseTx.content.transaction,
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

  const createResponse = await createTransaction(
    {
      fromAccount,
      toAccount,
      assetId,
      amount,
      fee,
      memo,
    },
    rpcClient,
  );
  const bytes = Buffer.from(createResponse.content.transaction, "hex");
  return RawTransactionSerde.deserialize(bytes);
}

function createTransaction(
  {
    fromAccount,
    toAccount,
    assetId,
    amount,
    fee,
    memo,
  }: CreateTransactionInput,
  rpcClient: RpcClient,
) {
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
    fee: fee ? CurrencyUtils.encode(BigInt(fee)) : null,
    feeRate: null,
    expiration: undefined,
    confirmations: undefined,
  };

  return rpcClient.wallet.createTransaction(params);
}
