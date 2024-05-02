import * as z from "zod";

import {
  TRPCRouterOutputs,
  getTrpcVanillaClient,
} from "@/providers/TRPCProvider";
import { MIN_IRON_VALUE } from "@/utils/ironUtils";
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
  amount: z.coerce.number().min(MIN_IRON_VALUE),
  fee: z.union([z.literal("slow"), z.literal("average"), z.literal("fast")]),
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
  fee: number;
};

export type AccountType = TRPCRouterOutputs["getAccounts"][number];
export type BalanceType = AccountType["balances"]["iron"];
export type AssetType = BalanceType["asset"];
export type AssetOptionType = {
  assetName: string;
  label: string;
  value: string;
  asset: AssetType;
};
