import { z } from "zod";

import { handleGetTransaction } from "./handleGetTransaction";
import { handleGetTransactions } from "./handleGetTransactions";
import { manager } from "../manager";
import { t } from "../trpc";

export const transactionRouter = t.router({
  getEstimatedFees: t.procedure.query(async () => {
    const ironfish = await manager.getIronfish();
    const rpcClient = await ironfish.rpcClient();
    const estimatedFees = await rpcClient.chain.estimateFeeRates();
    return estimatedFees.content;
  }),
  getTransaction: t.procedure
    .input(
      z.object({
        accountName: z.string(),
        transactionHash: z.string(),
      }),
    )
    .query(async (opts) => {
      return handleGetTransaction(opts.input);
    }),
  getTransactions: t.procedure
    .input(
      z.object({
        accountName: z.string(),
      }),
    )
    .query(async (opts) => {
      return handleGetTransactions(opts.input);
    }),
});
