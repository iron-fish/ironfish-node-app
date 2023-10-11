import { initTRPC } from "@trpc/server";
import { dialog } from "electron";
import log from "electron-log";
import { z } from "zod";

import { handleGetAccount } from "./accounts/handleGetAccount";
import { handleGetAccounts } from "./accounts/handleGetAccounts";
import { ironfish } from "./ironfish";
import { handleGetTransaction } from "./transactions/handleGetTransaction";
import { handleGetTransactions } from "./transactions/handleGetTransactions";
import { mainWindow } from "../main-window";

const t = initTRPC.create({ isServer: true });

export const router = t.router({
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
  getTransaction: t.procedure
    .input(
      z.object({
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
  getPeers: t.procedure.query(async () => {
    const rcpClient = await ironfish.getRpcClient();
    const peerResponse = await rcpClient.peer.getPeers();
    return peerResponse.content.peers;
  }),
  getStatus: t.procedure.query(async () => {
    const rcpClient = await ironfish.getRpcClient();
    const peerResponse = await rcpClient.node.getStatus();
    return peerResponse.content;
  }),
  openDirectoryDialog: t.procedure.query(async () => {
    const window = await mainWindow.getMainWindow();

    try {
      const { canceled, filePaths } = await dialog.showOpenDialog(window, {
        properties: ["openDirectory"],
      });
      if (canceled) {
        return;
      }
      return filePaths[0];
    } catch (e) {
      log.error(e);
    }

    return;
  }),
});

export type AppRouter = typeof router;
