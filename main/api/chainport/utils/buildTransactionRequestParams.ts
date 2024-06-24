import { CreateTransactionRequest, CurrencyUtils } from "@ironfish/sdk";
import { z } from "zod";

export const buildTransactionRequestParamsInputs = z.object({
  fromAccount: z.string(),
  txDetails: z.object({
    bridge_output: z.object({
      publicAddress: z.string(),
      amount: z.string(),
      memoHex: z.string(),
      assetId: z.string(),
    }),
    gas_fee_output: z.object({
      publicAddress: z.string(),
      amount: z.string(),
      memo: z.string(),
    }),
  }),
  fee: z.number().optional(),
  feeRate: z.string().optional(),
});

export type BuildTransactionRequestParamsInputs = z.infer<
  typeof buildTransactionRequestParamsInputs
>;

export function buildTransactionRequestParams({
  fromAccount,
  txDetails,
  fee,
  feeRate,
}: BuildTransactionRequestParamsInputs) {
  const params: CreateTransactionRequest = {
    account: fromAccount,
    outputs: [
      {
        publicAddress: txDetails.bridge_output.publicAddress,
        amount: txDetails.bridge_output.amount,
        memoHex: txDetails.bridge_output.memoHex,
        assetId: txDetails.bridge_output.assetId,
      },
      {
        publicAddress: txDetails.gas_fee_output.publicAddress,
        amount: txDetails.gas_fee_output.amount,
        memo: txDetails.gas_fee_output.memo,
      },
    ],
    fee: fee ? CurrencyUtils.encode(BigInt(fee)) : null,
    feeRate: feeRate ?? null,
    expiration: undefined,
    confirmations: undefined,
  };

  return params;
}
