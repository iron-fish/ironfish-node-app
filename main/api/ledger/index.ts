import { observable } from "@trpc/server/observable";

import { ledgerManager, ConnectionStatus } from "./utils/ledger";
import { t } from "../trpc";

export const ledgerRouter = t.router({
  ledgerStatus: t.procedure.subscription(async () => {
    return observable<ConnectionStatus>((emit) => {
      const subscriptionId = ledgerManager.subscribe((status) => {
        emit.next(status);
      });

      return () => {
        ledgerManager.unsubscribe(subscriptionId);
      };
    });
  }),
  // getLedgerPublicAddress: t.procedure.query(async () => {
  //   const address = await ledgerManager.getPublicAddress();
  //   return address;
  // }),
});
