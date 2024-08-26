import { observable } from "@trpc/server/observable";
import { z } from "zod";

import { ledgerManager, ConnectionStatus } from "./utils/ledger";
import { handleSendTransactionInput } from "../transactions/handleSendTransaction";
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
  importLedgerAccount: t.procedure.mutation(async () => {
    const result = await ledgerManager.importAccount();
    return result;
  }),
  submitLedgerTransaction: t.procedure
    .input(handleSendTransactionInput)
    .mutation(async (opts) => {
      return ledgerManager.submitTransaction(opts.input);
    }),
  cancelSubmitLedgerTransaction: t.procedure.mutation(async () => {
    return ledgerManager.cancelTransaction();
  }),
  markAccountAsLedger: t.procedure
    .input(
      z.object({
        publicAddress: z.string(),
      }),
    )
    .mutation((opts) => {
      return ledgerManager.markAccountAsLedger(opts.input.publicAddress);
    }),
});
