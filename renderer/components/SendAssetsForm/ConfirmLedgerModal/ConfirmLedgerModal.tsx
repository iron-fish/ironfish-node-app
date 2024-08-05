import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalFooter,
  ModalBody,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useIntl, defineMessages } from "react-intl";

import { AssetOptionType } from "@/components/AssetAmountInput/utils";
import { trpcReact, TRPCRouterOutputs } from "@/providers/TRPCProvider";
import { PillButton } from "@/ui/PillButton/PillButton";

import { StepConfirm } from "./Steps/StepConfirm";
import { StepConnect } from "./Steps/StepConnect";
import { ReviewTransaction } from "../ReviewTransaction/ReviewTransaction";
import { TransactionData } from "../transactionSchema";

const messages = defineMessages({
  cancel: {
    defaultMessage: "Cancel",
  },
  continue: {
    defaultMessage: "Continue",
  },
});

type LedgerStatus = {
  isLedgerConnected: boolean;
  isLedgerUnlocked: boolean;
  isIronfishAppOpen: boolean;
  publicAddress: string;
  deviceName: string;
};

type Props = {
  isOpen: boolean;
  transactionData: TransactionData;
  selectedAccount: TRPCRouterOutputs["getAccounts"][number];
  selectedAsset?: AssetOptionType;
  onCancel: () => void;
};

export function ConfirmLedgerModal({
  isOpen,
  onCancel,
  transactionData,
  selectedAccount,
  selectedAsset,
}: Props) {
  const { formatMessage } = useIntl();

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
    "IDLE" | "CONNECT_LEDGER" | "CONFIRM_TRANSACTION" | "TRANSACTION_SUBMITTED"
  >("IDLE");

  trpcReact.ledgerStatus.useSubscription(undefined, {
    onData: (data) => {
      setLedgerStatus(data);
    },
    onError: (err) => {
      setStatusError(err.message);
    },
  });

  const {
    mutate: submitTransaction,
    data: submittedTransactionData,
    isIdle,
    isLoading,
    isError: _isError,
    isSuccess: _isSuccess,
    reset,
    error: error,
  } = trpcReact.submitLedgerTransaction.useMutation({
    onSuccess: () => {
      setStep("TRANSACTION_SUBMITTED");
    },
  });

  useEffect(() => {
    if (
      step === "CONFIRM_TRANSACTION" &&
      (!isLedgerConnected || !isLedgerUnlocked || !isIronfishAppOpen)
    ) {
      setStep("CONNECT_LEDGER");
    }
  }, [isLedgerConnected, isLedgerUnlocked, isIronfishAppOpen, step]);

  const handleClose = useCallback(() => {
    reset();
    onCancel();
  }, [onCancel, reset]);

  // @todo: Remove this once the backend is submitting the signed transaction to the network
  if (!isIdle) {
    console.log({ submittedTransactionData, error });
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent maxW="100%" width="600px">
        {step === "IDLE" && (
          <ReviewTransaction
            transactionData={transactionData}
            selectedAccount={selectedAccount}
            selectedAsset={selectedAsset}
            onClose={handleClose}
            onSubmit={() => {
              setStep("CONNECT_LEDGER");
            }}
          />
        )}
        {step === "CONNECT_LEDGER" && (
          <>
            <ModalBody px={16} pt={16}>
              <StepConnect
                isLedgerConnected={isLedgerConnected}
                isLedgerUnlocked={isLedgerUnlocked}
                isIronfishAppOpen={isIronfishAppOpen}
              />
            </ModalBody>
            <ModalFooter display="flex" gap={2} px={16} py={8}>
              <PillButton
                size="sm"
                onClick={handleClose}
                variant="inverted"
                border={0}
              >
                {formatMessage(messages.cancel)}
              </PillButton>
              <PillButton
                size="sm"
                isDisabled={
                  isLoading ||
                  !isLedgerConnected ||
                  !isLedgerUnlocked ||
                  !isIronfishAppOpen
                }
                onClick={() => {
                  submitTransaction(transactionData);
                  setStep("CONFIRM_TRANSACTION");
                }}
              >
                {formatMessage(messages.continue)}
              </PillButton>
            </ModalFooter>
          </>
        )}
        {step === "CONFIRM_TRANSACTION" && (
          <>
            <ModalBody px={16} pt={16}>
              <StepConfirm />
            </ModalBody>
            <ModalFooter display="flex" gap={2} px={16} py={8}>
              <PillButton
                size="sm"
                onClick={handleClose}
                variant="inverted"
                border={0}
              >
                {formatMessage(messages.cancel)}
              </PillButton>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
