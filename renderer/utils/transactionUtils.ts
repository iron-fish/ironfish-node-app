import type { TransactionStatus } from "@ironfish/sdk";

import { AssetOptionType } from "@/components/AssetAmountInput/utils";
import {
  TransactionData,
  TransactionFormData,
} from "@/components/SendAssetsForm/transactionSchema";
import { TRPCRouterOutputs } from "@/providers/TRPCProvider";
import { CurrencyUtils } from "@/utils/currency";
import { formatOre, parseIron } from "@/utils/ironUtils";

export const getFormattedFee = (
  fee: TransactionFormData["fee"],
  customFee: string,
  estimatedFeesData: TRPCRouterOutputs["getEstimatedFees"] | undefined,
): string => {
  if (fee === "custom" && customFee) {
    return customFee;
  } else if (estimatedFeesData && fee !== "custom") {
    return formatOre(estimatedFeesData[fee]);
  }
  return formatOre(0);
};

interface NormalizedTransactionResult {
  normalizedTransactionData: TransactionData | null;
  error: string;
}

export const normalizeTransactionData = (
  transactionFormData: TransactionFormData,
  estimatedFeesData: TRPCRouterOutputs["getEstimatedFees"],
  selectedAsset: AssetOptionType,
): NormalizedTransactionResult => {
  let feeValue: number;
  if (transactionFormData.fee === "custom") {
    if (!transactionFormData.customFee) {
      return {
        normalizedTransactionData: null,
        error: "Custom fee must be a number greater than 0",
      };
    }
    const feeString = transactionFormData.customFee.toString();
    feeValue = parseIron(feeString);
  } else {
    feeValue = estimatedFeesData[transactionFormData.fee] ?? 0;
  }

  const [normalizedAmount, amountError] = CurrencyUtils.tryMajorToMinor(
    transactionFormData.amount,
    transactionFormData.assetId,
    selectedAsset?.asset.verification,
  );

  console;

  if (!normalizedAmount || amountError) {
    return {
      normalizedTransactionData: null,
      error:
        amountError?.message ||
        "There was an issue processing your transaction",
    };
  }
  const normalizedTransactionData = {
    fromAccount: transactionFormData.fromAccount,
    toAccount: transactionFormData.toAccount,
    assetId: transactionFormData.assetId,
    amount: normalizedAmount.toString(),
    fee: feeValue,
    memo: transactionFormData.memo,
  } as TransactionData;

  return {
    normalizedTransactionData,
    error: "",
  };
};

export const isTransactionStatusTerminal = (status: TransactionStatus) => {
  return status === "confirmed" || status === "expired";
};

export const refetchTransactionUntilTerminal = (
  query: TRPCRouterOutputs["getTransaction"] | undefined,
) => {
  if (!query) {
    return 5000;
  }
  const txStatus = query.transaction.status;
  const isTerminalStatus = isTransactionStatusTerminal(txStatus);

  return !isTerminalStatus ? 5000 : false;
};
