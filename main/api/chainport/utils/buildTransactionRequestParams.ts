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
    bridge_fee: z.union([
      z.object({
        source_token_fee_amount: z.string(),
        portx_fee_amount: z.string(),
        is_portx_fee_payment: z.boolean(),
      }),
      z.object({
        publicAddress: z.string(),
        source_token_fee_amount: z.string(),
        memo: z.string(),
        assetId: z.string(),
      }),
    ]),
  }),
  fee: z.number().optional(),
  feeRate: z.string().optional(),
});

export type BuildTransactionRequestParamsInputs = z.infer<
  typeof buildTransactionRequestParamsInputs
>;

export function isBridgeFeeV1(
  txDetails: BuildTransactionRequestParamsInputs["txDetails"],
): txDetails is BuildTransactionRequestParamsInputs["txDetails"] & {
  bridge_fee: {
    source_token_fee_amount: string;
    portx_fee_amount: string;
    is_portx_fee_payment: boolean;
  };
} {
  return (
    "is_portx_fee_payment" in txDetails.bridge_fee &&
    "source_token_fee_amount" in txDetails.bridge_fee &&
    "portx_fee_amount" in txDetails.bridge_fee
  );
}

export function isBridgeFeeV2(
  txDetails: BuildTransactionRequestParamsInputs["txDetails"],
): txDetails is BuildTransactionRequestParamsInputs["txDetails"] & {
  bridge_fee: {
    publicAddress: string;
    assetId: string;
    memo: string;
    source_token_fee_amount: string;
  };
} {
  return (
    "publicAddress" in txDetails.bridge_fee &&
    "memo" in txDetails.bridge_fee &&
    "assetId" in txDetails.bridge_fee &&
    "source_token_fee_amount" in txDetails.bridge_fee
  );
}

export function buildTransactionRequestParams({
  fromAccount,
  txDetails,
  fee,
  feeRate,
}: BuildTransactionRequestParamsInputs) {
  const userOutput = {
    publicAddress: txDetails.bridge_output.publicAddress,
    amount: txDetails.bridge_output.amount,
    memoHex: txDetails.bridge_output.memoHex,
    assetId: txDetails.bridge_output.assetId,
  };
  const gasFeeOutput = {
    publicAddress: txDetails.gas_fee_output.publicAddress,
    amount: txDetails.gas_fee_output.amount,
    memo: txDetails.gas_fee_output.memo,
  };

  const outputs = [userOutput, gasFeeOutput];

  const bridgeFee = txDetails.bridge_fee.source_token_fee_amount;
  if (isBridgeFeeV2(txDetails) && BigInt(bridgeFee) > 0n) {
    userOutput.amount = (
      BigInt(userOutput.amount) - BigInt(bridgeFee)
    ).toString();

    const bridgeFeeOutput = {
      publicAddress: txDetails.bridge_fee.publicAddress,
      amount: bridgeFee,
      memo: txDetails.bridge_fee.memo,
      assetId: txDetails.bridge_fee.assetId,
    };
    outputs.push(bridgeFeeOutput);
  }

  const params: CreateTransactionRequest = {
    account: fromAccount,
    outputs,
    fee: fee ? CurrencyUtils.encode(BigInt(fee)) : null,
    feeRate: feeRate ?? null,
    expiration: undefined,
    confirmations: undefined,
  };

  return params;
}
