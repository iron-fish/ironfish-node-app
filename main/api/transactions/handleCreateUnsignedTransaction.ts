import { RawTransactionSerde } from "@ironfish/sdk";
import { z } from "zod";

import { handleSendTransactionInput } from "./handleSendTransaction";
import { manager } from "../manager";
import { createRawTransaction } from "../utils/transactions";

export async function handleCreateUnsignedTransaction(
  request: z.infer<typeof handleSendTransactionInput>,
) {
  const ironfish = await manager.getIronfish();
  const rpcClient = await ironfish.rpcClient();

  const raw = await createRawTransaction(request);

  const response = await rpcClient.wallet.buildTransaction({
    account: request.fromAccount,
    rawTransaction: RawTransactionSerde.serialize(raw).toString("hex"),
  });

  return { unsignedTransaction: response.content.unsignedTransaction };
}
