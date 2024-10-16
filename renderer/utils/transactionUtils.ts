import { CurrencyUtils } from "@/utils/currency";
import { parseIron } from "@/utils/ironUtils";
import { AssetOptionType } from "@/components/AssetAmountInput/utils";
import { TRPCRouterOutputs } from "@/providers/TRPCProvider";
import {
  TransactionData,
  TransactionFormData,
} from "@/components/SendAssetsForm/transactionSchema";

export const isPositiveInputValue = (val: string): boolean => {
  // Check for empty string
  if (val.trim() === "") return false;

  // Split the string by decimal point
  const splitVal = val.split(".");
  if (splitVal.length > 2) return false;

  const [integerVal, decimalVal] = splitVal;

  // Check if the input is just a decimal point
  if (integerVal === "" && decimalVal === undefined) return false;

  // Check if the integer Val is valid
  if (integerVal !== "" && !/^(0|[1-9]\d*)$/.test(integerVal)) return false;

  // Check if the decimal Val is valid (if it exists)
  if (decimalVal !== undefined && !/^\d+$/.test(decimalVal)) return false;

  // Parse the number and check if it's greater than 0
  const num = parseFloat(val);
  return !isNaN(num) && num > 0;
};

export const getFormattedFee = (
  fee: string,
  customFee: string,
  estimatedFeesData: TRPCRouterOutputs["getEstimatedFees"] | undefined,
): string => {
  if (fee === "custom" && customFee) {
    return customFee;
  }
  if (estimatedFeesData && fee in estimatedFeesData) {
    return CurrencyUtils.formatOre(
      estimatedFeesData[fee as keyof typeof estimatedFeesData],
    );
  }
  return CurrencyUtils.formatOre(0);
};

interface NormalizedTransactionResult {
  normalizedTransactionData: TransactionData | null;
  errors: {
    message?: string;
  };
}

export const normalizeTransactionData = (
  transactionData: TransactionFormData,
  estimatedFeesData: Record<string, number>,
  selectedAsset: AssetOptionType,
): NormalizedTransactionResult => {
  let feeValue: number;
  if (transactionData.fee === "custom") {
    if (!transactionData.customFee) {
      return {
        normalizedTransactionData: null,
        errors: {
          message: "Custom fee must be a number greater than 0",
        },
      };
    }
    const feeString = transactionData.customFee.toString();
    feeValue = parseIron(feeString);
  } else {
    feeValue = estimatedFeesData[transactionData.fee] ?? 0;
  }

  const [normalizedAmount, amountError] = CurrencyUtils.tryMajorToMinor(
    transactionData.amount,
    transactionData.assetId,
    selectedAsset?.asset.verification,
  );

  if (!normalizedAmount) {
    return {
      normalizedTransactionData: null,
      errors: {
        message:
          amountError?.message ||
          "There was an issue processing your transaction amount",
      },
    };
  }
  const normalizedTransactionData = {
    fromAccount: transactionData.fromAccount,
    toAccount: transactionData.toAccount,
    assetId: transactionData.assetId,
    amount: normalizedAmount.toString(),
    fee: feeValue,
    memo: transactionData.memo,
  } as TransactionData;

  return {
    normalizedTransactionData,
    errors: {},
  };
};
