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

const STEPS = ["CONNECT_LEDGER", "ADD_ACCOUNT"] as const;

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

  useEffect(() => {
    if (
      step !== "CONNECT_LEDGER" &&
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
          {step === "ADD_ACCOUNT" && (
            <StepAddAccount
              publicAddress={publicAddress}
              deviceName={deviceName}
              isConfirmed={isConfirmed}
              onConfirmChange={setIsConfirmed}
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
              (step === "ADD_ACCOUNT" && !isConfirmed)
            }
            onClick={() => {
              setStep(STEPS.indexOf(step) + 1 < STEPS.length ? STEPS[1] : step);
            }}
          >
            {formatMessage(messages.continue)}
          </PillButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
