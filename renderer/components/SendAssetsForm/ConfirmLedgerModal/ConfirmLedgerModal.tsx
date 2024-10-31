import { Modal, ModalOverlay, ModalContent } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

import { AssetOptionType } from "@/components/AssetAmountInput/utils";
import { trpcReact, TRPCRouterOutputs } from "@/providers/TRPCProvider";
import { normalizeTransactionData } from "@/utils/transactionUtils";

import { StepConfirm } from "./Steps/StepConfirm";
import { StepConnect } from "./Steps/StepConnect";
import { ReviewTransaction } from "../SharedConfirmSteps/ReviewTransaction";
import { SubmissionError } from "../SharedConfirmSteps/SubmissionError";
import { TransactionSubmitted } from "../SharedConfirmSteps/TransactionSubmitted";
import { TransactionFormData } from "../transactionSchema";

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
  const transactionFormData = watch();

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
  const { setError } = useFormContext();

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
      !["CONNECT_LEDGER", "ERROR", "IDLE"].includes(step) &&
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
    const { normalizedTransactionData, error } = normalizeTransactionData(
      transactionFormData,
      estimatedFeesData,
      selectedAsset,
    );

    if (normalizedTransactionData) {
      submitTransaction(normalizedTransactionData);
      setStep("CONFIRM_TRANSACTION");
    } else if (error) {
      setError("root.serverError", {
        message: error,
      });
      setStep("IDLE");
    }
  }, [
    transactionFormData,
    estimatedFeesData,
    selectedAsset,
    submitTransaction,
    setError,
  ]);

  const handleClose = useCallback(() => {
    if (step === "CONFIRM_TRANSACTION") {
      cancelTransaction();
    }
    reset();
    onCancel();
  }, [onCancel, reset, step, cancelTransaction]);

  const stepMap = {
    IDLE: (
      <ReviewTransaction
        selectedAccount={selectedAccount}
        selectedAsset={selectedAsset}
        estimatedFeesData={estimatedFeesData}
        onClose={handleClose}
        onSubmit={() => {
          setStep("CONNECT_LEDGER");
        }}
      />
    ),
    CONNECT_LEDGER: (
      <StepConnect
        isLedgerConnected={isLedgerConnected}
        isLedgerUnlocked={isLedgerUnlocked}
        isIronfishAppOpen={isIronfishAppOpen}
        onCancel={handleClose}
        onContinue={handleSubmitTransaction}
        isLoading={isLoading}
      />
    ),
    CONFIRM_TRANSACTION: <StepConfirm onCancel={handleClose} />,
    TRANSACTION_SUBMITTED: (
      <TransactionSubmitted
        fromAccount={selectedAccount.name}
        transactionHash={submittedTransactionData?.hash ?? ""}
        handleClose={handleClose}
      />
    ),
    SUBMISSION_ERROR: (
      <SubmissionError
        errorMessage={error?.message ?? ""}
        isLoading={isLoading}
        handleClose={handleClose}
        handleSubmit={handleSubmitTransaction}
      />
    ),
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent maxW="100%" width="600px">
        {stepMap[step]}
      </ModalContent>
    </Modal>
  );
}
