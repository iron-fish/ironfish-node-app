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
import { TransactionData, TransactionFormData } from "../transactionSchema";
import { normalizeTransactionData } from "@/utils/transactionUtils";

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
  const { watch } = useFormContext<TransactionFormData>();
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
    const result = normalizeTransactionData(
      transactionData,
      estimatedFeesData,
      selectedAsset,
    );
    if (result && !result.errors.message) {
      submitTransaction(result.normalizedTransactionData);
      setStep("CONFIRM_TRANSACTION");
    } else {
      // Handle error case, e.g., show an error message
      console.error(
        result?.errors.message || "Failed to normalize transaction data",
      );
    }
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
