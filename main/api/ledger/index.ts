import { ledgerManager } from "./utils/ledger";
import { t } from "../trpc";

async function test() {
  const app = await ledgerManager.connect();
  const appInfo = await app.appInfo();
  return appInfo.appVersion;
}

console.log(await test());

export const ledgerRouter = t.router({
  connectLedger: t.procedure.query(async () => {
    console.log("CONNECT");
    try {
      const app = await ledgerManager.connect();
      const appInfo = await app.appInfo();
      return appInfo.appVersion;
    } catch (err) {
      console.log(err);
      return "error";
    }
  }),
  getLedgerPublicAddress: t.procedure.query(async () => {
    const address = await ledgerManager.getPublicAddress();
    return address;
  }),
});
