import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalFooter,
  ModalBody,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useIntl, defineMessages } from "react-intl";

import { trpcReact } from "@/providers/TRPCProvider";
import { PillButton } from "@/ui/PillButton/PillButton";

import { StepAddAccount } from "./Steps/StepAddAccount";
import { StepConnect } from "./Steps/StepConnect";

const messages = defineMessages({
  headingConnectLedger: {
    defaultMessage: "Connect your Ledger",
  },
  plugDevice: {
    defaultMessage: "Plug your ledger device directly into your computer",
  },
  unlockLedger: {
    defaultMessage: "Unlock your Ledger",
  },
  openApp: {
    defaultMessage: "Open the Iron Fish app",
  },
  connectAccount: {
    defaultMessage: "Connect account",
  },
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

const STEPS = ["CONNECT_LEDGER", "SELECT_ACCOUNT", "CONFIRM"] as const;

export function ConnectLedgerModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { formatMessage } = useIntl();
  const [
    {
      isLedgerConnected,
      isLedgerUnlocked,
      isIronfishAppOpen,
      publicAddress,
      deviceName,
    },
    setLedgerStatus,
  ] = useState<LedgerStatus>(() => ({
    isLedgerConnected: false,
    isLedgerUnlocked: false,
    isIronfishAppOpen: false,
    publicAddress: "",
    deviceName: "",
  }));
  const [_statusError, setStatusError] = useState("");
  const [step, setStep] = useState<(typeof STEPS)[number]>(STEPS[0]);
  const [isConfirmed, setIsConfirmed] = useState(false);

  trpcReact.ledgerStatus.useSubscription(undefined, {
    onData: (data) => {
      setLedgerStatus(data);
    },
    onError: (err) => {
      setStatusError(err.message);
    },
  });

  const {
    isLoading: isImporting,
    error: importError,
    isSuccess: isImportSuccess,
    mutate: importLedgerAccount,
  } = trpcReact.importLedgerAccount.useMutation();

  useEffect(() => {
    if (
      step !== "CONNECT_LEDGER" &&
      (!isLedgerConnected || !isLedgerUnlocked || !isIronfishAppOpen)
    ) {
      setStep("CONNECT_LEDGER");
    }
  }, [step, isLedgerConnected, isLedgerUnlocked, isIronfishAppOpen]);

  useEffect(() => {
    if (isImportSuccess) {
      onClose();
    }
  }, [isImportSuccess, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent maxW="100%" width="600px">
        <ModalBody px={16} pt={16}>
          {step === "CONNECT_LEDGER" && (
            <StepConnect
              isLedgerConnected={isLedgerConnected}
              isLedgerUnlocked={isLedgerUnlocked}
              isIronfishAppOpen={isIronfishAppOpen}
            />
          )}
          {step === "SELECT_ACCOUNT" && (
            <StepAddAccount
              publicAddress={publicAddress}
              deviceName={deviceName}
              isConfirmed={isConfirmed}
              onConfirmChange={setIsConfirmed}
            />
          )}
          {step === "CONFIRM" && (
            <div>
              <h2>
                Confirm this action on your device. This is a placeholder while
                this step is designed.
              </h2>
              {importError?.message && (
                <p>
                  <strong>Error:</strong> {importError.message}
                </p>
              )}
            </div>
          )}
        </ModalBody>

        <ModalFooter display="flex" gap={2} px={16} py={8}>
          <PillButton size="sm" onClick={onClose} variant="inverted" border={0}>
            {formatMessage(messages.cancel)}
          </PillButton>
          <PillButton
            size="sm"
            isDisabled={
              !isLedgerConnected ||
              !isLedgerUnlocked ||
              !isIronfishAppOpen ||
              (step === "SELECT_ACCOUNT" && !isConfirmed) ||
              isImporting
            }
            onClick={() => {
              if (step === "CONNECT_LEDGER") {
                setStep("SELECT_ACCOUNT");
                return;
              }

              if (step === "SELECT_ACCOUNT") {
                importLedgerAccount();
                setStep("CONFIRM");
              }
            }}
          >
            {formatMessage(messages.continue)}
          </PillButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
