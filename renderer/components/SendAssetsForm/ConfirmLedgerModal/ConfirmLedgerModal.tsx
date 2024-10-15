import { Modal, ModalOverlay, ModalContent } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

import { AssetOptionType } from "@/components/AssetAmountInput/utils";
import { trpcReact, TRPCRouterOutputs } from "@/providers/TRPCProvider";
import { CurrencyUtils } from "@/utils/currency";
import { parseIron } from "@/utils/ironUtils";

import { StepConfirm } from "./Steps/StepConfirm";
import { StepConnect } from "./Steps/StepConnect";
import { ReviewTransaction } from "../SharedConfirmSteps/ReviewTransaction";
import { SubmissionError } from "../SharedConfirmSteps/SubmissionError";
import { TransactionSubmitted } from "../SharedConfirmSteps/TransactionSubmitted";
import { TransactionData } from "../transactionSchema";

type LedgerStatus = {
  isLedgerConnected: boolean;
  isLedgerUnlocked: boolean;
  isIronfishAppOpen: boolean;
  publicAddress: string;
  deviceName: string;
};

type Props = {
  isOpen: boolean;
  selectedAccount: TRPCRouterOutputs["getAccounts"][number];
  selectedAsset: AssetOptionType;
  onCancel: () => void;
  estimatedFeesData: TRPCRouterOutputs["getEstimatedFees"];
};

export function ConfirmLedgerModal({
  isOpen,
  onCancel,
  selectedAccount,
  selectedAsset,
  estimatedFeesData,
}: Props) {
  const { watch } = useFormContext();
  const transactionData = watch();

  const [
    { isLedgerConnected, isLedgerUnlocked, isIronfishAppOpen },
    setLedgerStatus,
  ] = useState<LedgerStatus>(() => ({
    isLedgerConnected: false,
    isLedgerUnlocked: false,
    isIronfishAppOpen: false,
    publicAddress: "",
    deviceName: "",
  }));

  const [_statusError, setStatusError] = useState("");

  const [step, setStep] = useState<
    | "IDLE"
    | "CONNECT_LEDGER"
    | "CONFIRM_TRANSACTION"
    | "TRANSACTION_SUBMITTED"
    | "SUBMISSION_ERROR"
  >("IDLE");

  trpcReact.ledgerStatus.useSubscription(undefined, {
    onData: (data) => {
      setLedgerStatus(data);
    },
    onError: (err) => {
      setStatusError(err.message);
    },
  });

  useEffect(() => {
    if (
      !["CONNECT_LEDGER", "ERROR"].includes(step) &&
      (!isLedgerConnected || !isLedgerUnlocked || !isIronfishAppOpen)
    ) {
      setStep("CONNECT_LEDGER");
    }
  }, [step, isLedgerConnected, isLedgerUnlocked, isIronfishAppOpen]);

  const {
    mutate: submitTransaction,
    data: submittedTransactionData,
    isLoading,
    reset,
    error,
  } = trpcReact.submitLedgerTransaction.useMutation({
    onSuccess: () => {
      setStep("TRANSACTION_SUBMITTED");
    },
    onError: () => {
      setStep("SUBMISSION_ERROR");
    },
  });

  const { mutate: cancelTransaction } =
    trpcReact.cancelSubmitLedgerTransaction.useMutation();

  useEffect(() => {
    if (
      step === "CONFIRM_TRANSACTION" &&
      (!isLedgerConnected || !isLedgerUnlocked || !isIronfishAppOpen)
    ) {
      setStep("CONNECT_LEDGER");
    }
  }, [isLedgerConnected, isLedgerUnlocked, isIronfishAppOpen, step]);

  const handleSubmitTransaction = useCallback(() => {
    // Todo: consolidate logic with confirmTransactionModal
    let feeValue: number;
    if (transactionData.fee === "custom") {
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
      console.log(`Error with amount: ${amountError}`);
      return;
    }
    const normalizedTransactionData = {
      fromAccount: transactionData.fromAccount,
      toAccount: transactionData.toAccount,
      assetId: transactionData.assetId,
      amount: normalizedAmount.toString(),
      fee: feeValue,
      memo: transactionData.memo,
    } as TransactionData;
    submitTransaction(normalizedTransactionData);
    setStep("CONFIRM_TRANSACTION");
  }, [transactionData, estimatedFeesData, selectedAsset, submitTransaction]);

  const handleClose = useCallback(() => {
    if (step === "CONFIRM_TRANSACTION") {
      cancelTransaction();
    }
    reset();
    onCancel();
  }, [onCancel, reset, step, cancelTransaction]);

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent maxW="100%" width="600px">
        {step === "IDLE" && (
          <ReviewTransaction
            selectedAccount={selectedAccount}
            selectedAsset={selectedAsset}
            estimatedFeesData={estimatedFeesData}
            onClose={handleClose}
            onSubmit={() => {
              setStep("CONNECT_LEDGER");
            }}
          />
        )}
        {step === "CONNECT_LEDGER" && (
          <StepConnect
            isLedgerConnected={isLedgerConnected}
            isLedgerUnlocked={isLedgerUnlocked}
            isIronfishAppOpen={isIronfishAppOpen}
            onCancel={handleClose}
            onContinue={handleSubmitTransaction}
            isLoading={isLoading}
          />
        )}
        {step === "CONFIRM_TRANSACTION" && (
          <StepConfirm onCancel={handleClose} />
        )}
        {step === "TRANSACTION_SUBMITTED" && (
          <TransactionSubmitted
            fromAccount={selectedAccount.name}
            transactionHash={submittedTransactionData?.hash ?? ""}
            handleClose={handleClose}
          />
        )}
        {step === "SUBMISSION_ERROR" && (
          <SubmissionError
            errorMessage={error?.message ?? ""}
            isLoading={isLoading}
            handleClose={handleClose}
            handleSubmit={handleSubmitTransaction}
          />
        )}
      </ModalContent>
    </Modal>
  );
}
