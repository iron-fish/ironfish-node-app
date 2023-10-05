import { EventEmitter } from "events";

import { GetBalancesResponse, RpcAsset } from "@ironfish/sdk";
import { initTRPC } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { dialog } from "electron";
import log from "electron-log";
import { z } from "zod";

import { ironfish } from "./ironfish";
import { mainWindow } from "../main-window";

type Unpacked<T> = T extends (infer U)[] ? U : T;

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
  greeting: t.procedure.input(z.object({ name: z.string() })).query((req) => {
    const { input } = req;

    return {
      text: `Hello ${input.name}` as const,
    };
  }),
  subscriptionDemo: t.procedure.subscription(() => {
    return observable<{ text: string }>((emit) => {
      function onGreet(text: string) {
        emit.next({ text });
      }

      ee.on("demo-event", onGreet);

      return () => {
        ee.off("demo-event", onGreet);
      };
    });
  }),
  getBalances: t.procedure
    .input(z.object({ account: z.string(), confirmations: z.number() }))
    .query(async (opts) => {
      const { input } = opts;

      const rcpClient = await ironfish.getRpcClient();

      const balancesStream = await rcpClient.wallet.getAccountBalances(input);
      const accountsResponse = await balancesStream.waitForEnd();

      type BalanceResponse = Unpacked<GetBalancesResponse["balances"]> & {
        asset: RpcAsset;
      };
      const balances: BalanceResponse[] = [];

      for (const balance of accountsResponse.content.balances) {
        const assetStream = await rcpClient.chain.getAsset({
          id: balance.assetId,
        });
        const assetResponse = await assetStream.waitForEnd();
        balances.push({
          ...balance,
          asset: assetResponse.content,
        });
      }

      return {
        ...accountsResponse.content,
        balances,
      };
    }),
  getAccounts: t.procedure.query(async () => {
    const rcpClient = await ironfish.getRpcClient();

    const accountsStream = await rcpClient.wallet.getAccounts();
    const accountsResponse = await accountsStream.waitForEnd();

    return accountsResponse.content.accounts.map((account) => {
      return account.toUpperCase();
    });
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
