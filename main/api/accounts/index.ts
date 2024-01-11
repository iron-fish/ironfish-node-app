import { z } from "zod";

import { handleCreateAccount } from "./handleCreateAccount";
import {
  handleDeleteAccount,
  handleDeleteAccountInputs,
} from "./handleDeleteAccount";
import {
  handleExportAccount,
  handleExportAccountInputs,
} from "./handleExportAccount";
import { handleGetAccount } from "./handleGetAccount";
import { handleGetAccounts } from "./handleGetAccounts";
import {
  handleImportAccount,
  handleImportAccountInputs,
} from "./handleImportAccount";
import {
  handleRenameAccountInputs,
  handleRenameAccount,
} from "./handleRenameAccount";
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
  importAccount: t.procedure
    .input(handleImportAccountInputs)
    .mutation(async (opts) => {
      return handleImportAccount(opts.input);
    }),
  exportAccount: t.procedure
    .input(handleExportAccountInputs)
    .query(async (opts) => {
      return handleExportAccount(opts.input);
    }),
  renameAccount: t.procedure
    .input(handleRenameAccountInputs)
    .mutation(async (opts) => {
      return handleRenameAccount(opts.input);
    }),
  deleteAccount: t.procedure
    .input(handleDeleteAccountInputs)
    .mutation(async (opts) => {
      return handleDeleteAccount(opts.input);
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
  isAccountSynced: t.procedure
    .input(
      z.object({
        account: z.string(),
      }),
    )
    .query(async (opts) => {
      const ironfish = await manager.getIronfish();
      const rpcClient = await ironfish.rpcClient();

      const nodeStatus = await rpcClient.node.getStatus();
      const isBlockchainSynced = nodeStatus.content.blockchain.synced;
      if (!isBlockchainSynced) {
        return {
          synced: false,
          progress: null,
        };
      }

      const config = await rpcClient.config.getConfig({
        name: "confirmations",
      });

      if (config.content.confirmations === undefined) {
        throw new Error("confirmations should always be defined");
      }

      const accountStatus = await rpcClient.wallet.getAccountStatus({
        account: opts.input.account,
      });

      // Treat the account as synced if the blockchain is synced and the account has scanned all confirmed blocks
      const maxConfirmedSequence = Math.max(
        nodeStatus.content.blockchain.head.sequence -
          config.content.confirmations,
        1,
      );

      return {
        synced:
          (accountStatus.content.account.head?.sequence ?? 0) >=
          maxConfirmedSequence,
        progress:
          (accountStatus.content.account.head?.sequence ?? 0) /
          nodeStatus.content.blockchain.head.sequence,
      };
    }),
});
