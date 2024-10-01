import { UnsignedTransaction } from "@ironfish/sdk";
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
      const result = await ledgerDkg.dkgGetCommitments(opts.input.txHash)
      return result.toString("hex");
    }),
  reviewTransaction: t.procedure
    .input(z.object({ unsignedTransaction: z.string() }))
    .mutation(async (opts) => {
      console.log("reviewTransaction");
      const result = await ledgerDkg.reviewTransaction(opts.input.unsignedTransaction)
      console.log("reviewTransactionComplete");
      return result.toString("hex");
    }),
  createSignatureShare: t.procedure
    .input(
      z.object({
        unsignedTransaction: z.string(),
        signingPackage: z.string(),
      }),
    )
    .mutation(async (opts) => {
      const unsignedTransaction = new UnsignedTransaction(Buffer.from(opts.input.unsignedTransaction, "hex"));
      const ref = unsignedTransaction.takeReference();
      const publicKeyRandomness = ref.publicKeyRandomness();
      const hash = ref.hash();
      unsignedTransaction.returnReference();

      const signatureShare = await ledgerDkg.dkgSign(
        publicKeyRandomness,
        opts.input.signingPackage,
        hash.toString('hex'),
      );

      return signatureShare.toString("hex");
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
