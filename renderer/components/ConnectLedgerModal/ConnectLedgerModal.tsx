import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalFooter,
  ModalBody,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useIntl, defineMessages } from "react-intl";

import { trpcReact } from "@/providers/TRPCProvider";
import { PillButton } from "@/ui/PillButton/PillButton";

import { StepAddAccount } from "./Steps/StepAddAccount";
import { StepApprove } from "./Steps/StepApprove";
import { StepConnect } from "./Steps/StepConnect";
import { StepError } from "./Steps/StepError";

const messages = defineMessages({
  cancel: {
    defaultMessage: "Cancel",
  },
  continue: {
    defaultMessage: "Continue",
  },
  tryAgain: {
    defaultMessage: "Try again",
  },
});

type LedgerStatus = {
  isLedgerConnected: boolean;
  isLedgerUnlocked: boolean;
  isIronfishAppOpen: boolean;
  publicAddress: string;
  deviceName: string;
};

const STEPS = ["CONNECT_LEDGER", "SELECT_ACCOUNT", "APPROVE", "ERROR"] as const;

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
    mutate: importLedgerAccount,
  } = trpcReact.importLedgerAccount.useMutation({
    onSuccess: () => {
      onClose();
    },
    onError: () => {
      setStep("ERROR");
    },
  });
  const {
    isLoading: isMarkingAsLedger,
    error: markAsLedgerError,
    mutate: markAccountAsLedger,
  } = trpcReact.markAccountAsLedger.useMutation({
    onSuccess: () => {
      onClose();
    },
    onError: () => {
      setStep("ERROR");
    },
  });

  const { data: userAccounts } = trpcReact.getAccounts.useQuery();
  const existingLedgerAccount = useMemo(() => {
    return userAccounts?.find((account) => account.address === publicAddress);
  }, [publicAddress, userAccounts]);
  const isLedgerAccountImportedAndFlagged = !!existingLedgerAccount?.isLedger;

  useEffect(() => {
    if (
      !["CONNECT_LEDGER", "ERROR"].includes(step) &&
      (!isLedgerConnected || !isLedgerUnlocked || !isIronfishAppOpen)
    ) {
      setStep("CONNECT_LEDGER");
    }
  }, [step, isLedgerConnected, isLedgerUnlocked, isIronfishAppOpen]);

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
              isImported={isLedgerAccountImportedAndFlagged}
            />
          )}
          {step === "APPROVE" && <StepApprove />}
          {step === "ERROR" && (
            <StepError
              errorMessage={
                importError?.message ||
                markAsLedgerError?.message ||
                "An unknown error occurred. Please try again."
              }
            />
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
              isImporting ||
              isMarkingAsLedger
            }
            onClick={() => {
              if (step === "ERROR") {
                setStep("CONNECT_LEDGER");
                return;
              }

              if (step === "CONNECT_LEDGER") {
                setStep("SELECT_ACCOUNT");
                return;
              }

              if (step === "SELECT_ACCOUNT") {
                if (existingLedgerAccount) {
                  markAccountAsLedger({ publicAddress });
                } else {
                  importLedgerAccount();
                  setStep("APPROVE");
                }
              }
            }}
          >
            {formatMessage(
              step === "ERROR" ? messages.tryAgain : messages.continue,
            )}
          </PillButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
