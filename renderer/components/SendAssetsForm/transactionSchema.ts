import * as z from "zod";

import { getTrpcVanillaClient } from "@/providers/TRPCProvider";
import { sliceToUtf8Bytes } from "@/utils/sliceToUtf8Bytes";

export const MAX_MEMO_SIZE = 32;

export const transactionSchema = z.object({
  fromAccount: z.string().min(1),
  toAccount: z
    .string()
    .min(1)
    .refine(async (value) => {
      const client = getTrpcVanillaClient();
      const response = await client.isValidPublicAddress.query({
        address: value,
      });
      return !!response?.valid;
    }, "Invalid public address"),
  assetId: z.string().min(1),
  amount: z
    .string()
    .min(1)
    .refine((value) => {
      return !isNaN(Number(value));
    }, "Amount must be a valid number")
    .refine((value) => {
      return Number(value) > 0;
    }, "Amount must be greater than 0"),
  fee: z.union([
    z.literal("slow"),
    z.literal("average"),
    z.literal("fast"),
    z.literal("custom"),
  ]),
  customFee: z
    .union([
      z.literal(""),
      z
        .string()
        .refine((val) => {
          const num = parseFloat(val);
          return !isNaN(num) && num > 0;
        }, "Must be a number greater than 0")
        .transform((val) => parseFloat(val)),
    ])
    .optional(),
  memo: z
    .string()
    .refine(
      (s) => s === sliceToUtf8Bytes(s, MAX_MEMO_SIZE),
      "Memo can't be more than 32 bytes",
    )
    .optional(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;

export type TransactionData = Omit<TransactionFormData, "fee"> & {
  fee: number | null;
};
