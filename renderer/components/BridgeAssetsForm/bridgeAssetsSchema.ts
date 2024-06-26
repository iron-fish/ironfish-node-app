import { z } from "zod";

import { getChecksumAddress } from "@/utils/ethereumAddressUtils";

export const bridgeAssetsSchema = z.object({
  fromAccount: z.string().min(1),
  amount: z
    .string()
    .min(1)
    .refine((value) => {
      return !isNaN(Number(value));
    }, "Amount must be a valid number")
    .refine((value) => {
      return Number(value) > 0;
    }, "Amount must be greater than 0"),
  assetId: z.string().min(1),
  destinationNetwork: z.string().min(1),
  targetAddress: z.string().superRefine((value, ctx) => {
    try {
      getChecksumAddress(value);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Please provide a valid address";

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message,
      });
    }
  }),
});

export type BridgeAssetsFormData = z.infer<typeof bridgeAssetsSchema>;
