import { ledgerManager } from "./utils/ledger";
import { t } from "../trpc";

export const ledgerRouter = t.router({
  connectLedger: t.procedure.query(async () => {
    const app = await ledgerManager.connect();
    const appInfo = await app.appInfo();
    return appInfo.appVersion;
  }),
  getLedgerPublicAddress: t.procedure.query(async () => {
    const address = await ledgerManager.getPublicAddress();
    return address;
  }),
});
