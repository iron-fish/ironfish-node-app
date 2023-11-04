import { z } from "zod";

import { handleCreateAccount } from "./handleCreateAccount";
import {
  handleExportAccount,
  handleExportAccountInputs,
} from "./handleExportAccount";
import { handleGetAccount } from "./handleGetAccount";
import { handleGetAccounts } from "./handleGetAccounts";
import { manager } from "../manager";
import { t } from "../trpc";

export const accountRouter = t.router({
  getAccount: t.procedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .query(async (opts) => {
      return handleGetAccount(opts.input);
    }),
  getAccounts: t.procedure.query(handleGetAccounts),
  createAccount: t.procedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async (opts) => {
      return handleCreateAccount(opts.input);
    }),
  exportAccount: t.procedure
    .input(handleExportAccountInputs)
    .query(async (opts) => {
      return handleExportAccount(opts.input);
    }),
  isValidPublicAddress: t.procedure
    .input(
      z.object({
        address: z.string(),
      }),
    )
    .query(async (opts) => {
      const ironfish = await manager.getIronfish();
      const rpcClient = await ironfish.rpcClient();
      const response = await rpcClient.chain.isValidPublicAddress({
        address: opts.input.address,
      });

      return response.content;
    }),
});
