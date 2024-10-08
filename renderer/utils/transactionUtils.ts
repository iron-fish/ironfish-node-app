import { CurrencyUtils } from "@/utils/currency";
import { parseIron } from "@/utils/ironUtils";
import { AssetOptionType } from "@/components/AssetAmountInput/utils";
import { TRPCRouterOutputs } from "@/providers/TRPCProvider";
import { TransactionData } from "@/components/SendAssetsForm/transactionSchema";

export const isPositiveValue = (val: string): boolean => {
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

export const normalizeTransactionData = (
  transactionData: Partial<TransactionData>,
  estimatedFeesData: TRPCRouterOutputs["getEstimatedFees"],
  selectedAsset: AssetOptionType,
): TransactionData | null => {
  let feeValue: number;
  if (transactionData.fee === "custom") {
    const feeString = transactionData.customFee?.toString() ?? "0";
    feeValue = parseIron(feeString);
  } else if (transactionData.fee) {
    feeValue = estimatedFeesData[transactionData.fee] ?? 0;
  } else {
    return null;
  }

  if (!transactionData.amount || !transactionData.assetId) {
    return null;
  }

  const [normalizedAmount, amountError] = CurrencyUtils.tryMajorToMinor(
    transactionData.amount,
    transactionData.assetId,
    selectedAsset?.asset.verification,
  );

  if (!normalizedAmount) {
    console.log(`Error with amount: ${amountError}`);
    return null;
  }

  return {
    fromAccount: transactionData.fromAccount ?? "",
    toAccount: transactionData.toAccount ?? "",
    assetId: transactionData.assetId,
    amount: normalizedAmount.toString(),
    fee: feeValue,
    memo: transactionData.memo ?? "",
  };
};
