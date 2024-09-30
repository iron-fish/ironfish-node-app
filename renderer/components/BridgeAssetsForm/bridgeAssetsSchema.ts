import { z } from "zod";

import { TRPCRouterOutputs } from "@/providers/TRPCProvider";
import { getChecksumAddress } from "@/utils/ethereumAddressUtils";

export const bridgeAssetsFormSchema = z.object({
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
  destinationNetworkId: z.string().min(1).nullable(),
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

type ChainportNetwork =
  TRPCRouterOutputs["getChainportTokenPaths"]["chainportTokenPaths"][number];

export type BridgeAssetsConfirmationData = Omit<
  BridgeAssetsFormData,
  "destinationNetworkId"
> & { destinationNetwork: ChainportNetwork };

export type BridgeAssetsFormData = z.infer<typeof bridgeAssetsFormSchema>;
