import { getAddress } from "ethers";
import { z } from "zod";

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
      getAddress(value);
    } catch (err) {
      let message = "Please provide a valid address";

      if (
        err instanceof Error &&
        "shortMessage" in err &&
        typeof err.shortMessage === "string" &&
        err.shortMessage === "bad address checksum"
      ) {
        message = "This address does not have a valid checksum";
      }

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message,
      });
    }
  }),
});

export type BridgeAssetsFormData = z.infer<typeof bridgeAssetsSchema>;
