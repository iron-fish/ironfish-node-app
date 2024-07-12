import { ledgerManager } from "./utils/ledger";
import { t } from "../trpc";

export const ledgerRouter = t.router({
  isLedgerConnected: t.procedure.query(async () => {
    const isConnected = await ledgerManager.isLedgerConnected();
    return isConnected;
  }),
  isLedgerUnlocked: t.procedure.query(async () => {
    const isUnlocked = await ledgerManager.isLedgerUnlocked();
    return isUnlocked;
  }),
  isIronfishAppOpen: t.procedure.query(async () => {
    const isOpen = await ledgerManager.isIronfishAppOpen();
    return isOpen;
  }),
  getLedgerPublicAddress: t.procedure.query(async () => {
    const address = await ledgerManager.getPublicAddress();
    return address;
  }),
});
