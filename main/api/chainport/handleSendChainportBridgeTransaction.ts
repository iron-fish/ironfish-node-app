import { RawTransactionSerde } from "@ironfish/sdk";
import { z } from "zod";

import {
  buildTransactionRequestParams,
  buildTransactionRequestParamsInputs,
  isBridgeFeeV1,
  isBridgeFeeV2,
} from "./utils/buildTransactionRequestParams";
import { getConfig } from "./vendor/config";
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
  const currentNetwork = (await rpcClient.chain.getNetworkInfo()).content
    .networkId;
  const config = getConfig(currentNetwork);
  const isBridgeFeeUpgradeActivated =
    new Date(config.bridgeFeeUpgrade) < new Date();
  const bridgeFeeV1 = isBridgeFeeV1(txDetails);
  const bridgeFeeV2 = isBridgeFeeV2(txDetails);
  if (isBridgeFeeUpgradeActivated) {
    if (!bridgeFeeV2) {
      throw new Error("Unsupported bridge fee version");
    }
  } else {
    if (!bridgeFeeV1) {
      throw new Error("Unsupported bridge fee version");
    }
  }

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
