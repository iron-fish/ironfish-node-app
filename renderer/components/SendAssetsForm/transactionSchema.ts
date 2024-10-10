import * as z from "zod";
import { defineMessages } from "react-intl";

import { getTrpcVanillaClient } from "@/providers/TRPCProvider";
import { sliceToUtf8Bytes } from "@/utils/sliceToUtf8Bytes";

export const MAX_MEMO_SIZE = 32;

const messages = defineMessages({
  invalidPublicAddress: {
    defaultMessage: "Invalid public address",
  },
  invalidAmount: {
    defaultMessage: "Amount must be a valid number",
  },
  amountMustBePositive: {
    defaultMessage: "Amount must be greater than 0",
  },
  invalidCustomFee: {
    defaultMessage: "Custom fee must be a number greater than 0",
  },
  memoTooLong: {
    defaultMessage: "Memo can't be more than 32 bytes",
  },
  feeAmountRequired: {
    defaultMessage: "A fee amount is required",
  },
  fieldRequired: {
    defaultMessage: "This field is required",
  },
});

export const createTransactionSchema = (
  formatMessage: (descriptor: { defaultMessage: string }) => string,
) =>
  z
    .object({
      fromAccount: z.string().min(1, formatMessage(messages.fieldRequired)),
      toAccount: z
        .string()
        .min(1, formatMessage(messages.fieldRequired))
        .refine(async (value) => {
          const client = getTrpcVanillaClient();
          const response = await client.isValidPublicAddress.query({
            address: value,
          });
          return !!response?.valid;
        }, formatMessage(messages.invalidPublicAddress)),
      assetId: z.string().min(1, formatMessage(messages.fieldRequired)),
      amount: z
        .string()
        .min(1, formatMessage(messages.fieldRequired))
        .refine((value) => {
          return !isNaN(Number(value));
        }, formatMessage(messages.invalidAmount))
        .refine((value) => {
          return Number(value) > 0;
        }, formatMessage(messages.amountMustBePositive)),
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
            .min(1)
            .refine((val) => {
              const num = parseFloat(val);
              return !isNaN(num) && num > 0;
            }, formatMessage(messages.invalidCustomFee))
            .transform((val) => parseFloat(val)),
        ])
        .optional(),
      memo: z
        .string()
        .refine(
          (s) => s === sliceToUtf8Bytes(s, MAX_MEMO_SIZE),
          formatMessage(messages.memoTooLong),
        )
        .optional(),
    })
    .refine(
      (data) => {
        if (data.fee === "custom") {
          return data.customFee !== undefined && data.customFee !== "";
        }
        return true;
      },
      {
        message: formatMessage(messages.feeAmountRequired),
        path: ["customFee"],
      },
    );

export type TransactionFormData = z.infer<
  ReturnType<typeof createTransactionSchema>
>;

export type TransactionData = Omit<TransactionFormData, "fee"> & {
  fee: number | null;
};
