import { observable } from "@trpc/server/observable";
import { z } from "zod";

import { handleAggregateSignatureShares } from "./multisig/handleAggregateSignatureShares";
import { handleCreateSigningPackage } from "./multisig/handleCreateSigningPackage";
import { ledgerDkg } from "./utils/dkg";
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
  createSigningCommitment: t.procedure
    .input(z.object({ txHash: z.string() }))
    .mutation(async (opts) => {
      return ledgerDkg.dkgGetCommitments(opts.input.txHash);
    }),
  createSignatureShare: t.procedure
    .input(
      z.object({
        randomness: z.string(),
        signingPackage: z.string(),
        txHash: z.string(),
      }),
    )
    .mutation(async (opts) => {
      return ledgerDkg.dkgSign(
        opts.input.randomness,
        opts.input.signingPackage,
        opts.input.txHash,
      );
    }),
  aggregateSignatureShares: t.procedure
    .input(
      z.object({
        account: z.string().optional(),
        signingPackage: z.string(),
        signatureShares: z.array(z.string()),
        broadcast: z.boolean().optional(),
      }),
    )
    .mutation(async (opts) => {
      return handleAggregateSignatureShares({ request: opts.input });
    }),
  createSigningPackage: t.procedure
    .input(
      z.object({
        account: z.string().optional(),
        unsignedTransaction: z.string(),
        commitments: z.array(z.string()),
      }),
    )
    .mutation(async (opts) => {
      return handleCreateSigningPackage({ request: opts.input });
    }),
});
