import { RawTransactionSerde } from "@ironfish/sdk";
import { z } from "zod";

import {
  buildTransactionRequestParams,
  buildTransactionRequestParamsInputs,
} from "./utils/buildTransactionRequestParams";
import { manager } from "../manager";

export const handleSendChainportBridgeTransactionInput =
  buildTransactionRequestParamsInputs.extend({
    fee: z.number(),
  });

export async function handleSendChainportBridgeTransaction({
  fromAccount,
  txDetails,
  fee,
}: z.infer<typeof handleSendChainportBridgeTransactionInput>) {
  const ironfish = await manager.getIronfish();
  const rpcClient = await ironfish.rpcClient();

  const params = buildTransactionRequestParams({
    fromAccount,
    txDetails,
    fee,
  });

  const createResponse = await rpcClient.wallet.createTransaction(params);
  const bytes = Buffer.from(createResponse.content.transaction, "hex");
  const rawTx = RawTransactionSerde.deserialize(bytes);

  const postResponse = await rpcClient.wallet.postTransaction({
    transaction: RawTransactionSerde.serialize(rawTx).toString("hex"),
    account: fromAccount,
  });

  return postResponse.content;
}
