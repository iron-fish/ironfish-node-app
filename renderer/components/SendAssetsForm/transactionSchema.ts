import * as z from "zod";

import { getTrpcVanillaClient } from "@/providers/TRPCProvider";
import { MIN_IRON_VALUE } from "@/utils/ironUtils";

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
  amount: z.coerce.number().min(MIN_IRON_VALUE),
  fee: z.union([z.literal("slow"), z.literal("average"), z.literal("fast")]),
  memo: z.string().max(32).optional(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;

export type TransactionData = Omit<TransactionFormData, "fee"> & {
  fee: number;
};
