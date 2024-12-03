import { z } from "zod";

import { handleCreateUnsignedTransaction } from "./handleCreateUnsignedTransaction";
import {
  handleExportTransactions,
  handleExportTransactionsInput,
} from "./handleExportTransactions";
import { handleGetEstimatedFees } from "./handleGetEstimatedFees";
import { handleGetTransaction } from "./handleGetTransaction";
import { handleGetTransactions } from "./handleGetTransactions";
import { handleGetTransactionsForContact } from "./handleGetTransactionsForContact";
import {
  handleSendTransaction,
  handleSendTransactionInput,
} from "./handleSendTransaction";
import { t } from "../trpc";

export const transactionRouter = t.router({
  getEstimatedFees: t.procedure
    .input(
      z.object({
        accountName: z.string(),
        outputs: z.array(
          z.object({
            publicAddress: z.string(),
            amount: z.string(),
            memo: z.string().optional(),
            memoHex: z.string().optional(),
            assetId: z.string().optional(),
          }),
        ),
      }),
    )
    .query(async (opts) => {
      return handleGetEstimatedFees(opts.input);
    }),
  getTransaction: t.procedure
    .input(
      z.object({
        accountName: z.string(),
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
        cursor: z.number().optional(),
        limit: z.number().min(1).max(100).optional(),
      }),
    )
    .query(async (opts) => {
      return handleGetTransactions(opts.input);
    }),
  getTransactionsForContact: t.procedure
    .input(
      z.object({
        contactAddress: z.string(),
      }),
    )
    .query(async (opts) => {
      return handleGetTransactionsForContact(opts.input);
    }),
  sendTransaction: t.procedure
    .input(handleSendTransactionInput)
    .mutation(async (opts) => {
      return handleSendTransaction(opts.input);
    }),
  handleCreateUnsignedTransaction: t.procedure
    .input(handleSendTransactionInput)
    .mutation(async (opts) => {
      return handleCreateUnsignedTransaction(opts.input);
    }),
  handleExportTransactions: t.procedure
    .input(handleExportTransactionsInput)
    .mutation(async (opts) => {
      return handleExportTransactions(opts.input);
    }),
});
