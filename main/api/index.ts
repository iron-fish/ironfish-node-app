import { EventEmitter } from "events";

import { initTRPC } from "@trpc/server";
import { dialog } from "electron";
import log from "electron-log";

import { getAccounts } from "./accounts/getAccounts";
import { ironfish } from "./ironfish";
import { mainWindow } from "../main-window";

const ee = new EventEmitter();
const t = initTRPC.create({ isServer: true });

let count = 1;
function emitEveryFiveSecs() {
  setInterval(() => {
    ee.emit("demo-event", `Count is ${count++}`);
  }, 5000);
}
emitEveryFiveSecs();

export const router = t.router({
  getAccounts: t.procedure.query(getAccounts),
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
