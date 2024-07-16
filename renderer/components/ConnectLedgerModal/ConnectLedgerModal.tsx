import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalFooter,
  ModalBody,
  Heading,
  HStack,
  Flex,
  VStack,
  Text,
} from "@chakra-ui/react";
import Image from "next/image";
import { useState } from "react";
import { IoMdCheckmark } from "react-icons/io";
import { useIntl, defineMessages } from "react-intl";

import { trpcReact } from "@/providers/TRPCProvider";
import { COLORS } from "@/ui/colors";
import { PillButton } from "@/ui/PillButton/PillButton";

import connectImage from "./assets/connect.svg";

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
};

const STEPS = ["CONNECT_LEDGER", "CONNECT_ACCOUNT"] as const;

export function ConnectLedgerModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { formatMessage } = useIntl();
  const [
    { isLedgerConnected, isLedgerUnlocked, isIronfishAppOpen },
    setLedgerStatus,
  ] = useState<LedgerStatus>(() => ({
    isLedgerConnected: false,
    isLedgerUnlocked: false,
    isIronfishAppOpen: false,
  }));
  const [_statusError, setStatusError] = useState("");
  const [step, setStep] = useState<(typeof STEPS)[number]>(STEPS[0]);

  trpcReact.ledgerStatus.useSubscription(undefined, {
    onData: (data) => {
      setLedgerStatus(data);
    },
    onError: (err) => {
      console.log(err);
      setStatusError(err.message);
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent maxW="100%" width="600px">
        <ModalBody px={16} pt={16}>
          {step === "CONNECT_LEDGER" && (
            <>
              <Heading mb={4}>
                {formatMessage(messages.headingConnectLedger)}
              </Heading>
              <Image src={connectImage} alt="" />
              <VStack alignItems="stretch" gap={2} mt={6}>
                <ListItem
                  number="1"
                  content={formatMessage(messages.plugDevice)}
                  isNextStep={!isLedgerConnected}
                  isComplete={isLedgerConnected}
                />
                <ListItem
                  number="2"
                  content={formatMessage(messages.unlockLedger)}
                  isNextStep={isLedgerConnected && !isLedgerUnlocked}
                  isComplete={isLedgerUnlocked}
                />
                <ListItem
                  number="3"
                  content={formatMessage(messages.openApp)}
                  isNextStep={
                    isLedgerConnected && isLedgerUnlocked && !isIronfishAppOpen
                  }
                  isComplete={isIronfishAppOpen}
                />
              </VStack>
            </>
          )}
          {step === "CONNECT_ACCOUNT" && (
            <Heading mb={4}>{formatMessage(messages.connectAccount)}</Heading>
          )}
        </ModalBody>

        <ModalFooter display="flex" gap={2} px={16} py={8}>
          <PillButton size="sm" onClick={onClose} variant="inverted" border={0}>
            {formatMessage(messages.cancel)}
          </PillButton>
          <PillButton
            size="sm"
            isDisabled={
              !isLedgerConnected || !isLedgerUnlocked || !isIronfishAppOpen
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

function ListItem({
  number,
  content,
  isNextStep,
  isComplete,
}: {
  number: string;
  content: string;
  isNextStep: boolean;
  isComplete: boolean;
}) {
  return (
    <HStack>
      <Flex
        alignItems="center"
        justifyContent="center"
        boxSize="32px"
        border="1px solid"
        // bg={isNextStep ? COLORS.BLACK : COLORS.WHITE}
        bg={
          (isNextStep && COLORS.BLACK) ||
          (isComplete && COLORS.GREEN_LIGHT) ||
          COLORS.WHITE
        }
        borderColor={
          (isNextStep && COLORS.BLACK) ||
          (isComplete && COLORS.GREEN_LIGHT) ||
          COLORS.GRAY_MEDIUM
        }
        color={
          (isNextStep && COLORS.WHITE) ||
          (isComplete && COLORS.GREEN_DARK) ||
          COLORS.BLACK
        }
        borderRadius="full"
        _dark={{
          bg: isNextStep ? COLORS.WHITE : COLORS.DARK_MODE.GRAY_MEDIUM,
          borderColor: isNextStep ? COLORS.WHITE : COLORS.DARK_MODE.GRAY_MEDIUM,
          color: isNextStep ? COLORS.DARK_MODE.GRAY_MEDIUM : COLORS.WHITE,
        }}
      >
        {isComplete ? <IoMdCheckmark /> : number}
      </Flex>
      <Text textAlign="center" fontSize="md">
        {content}
      </Text>
    </HStack>
  );
}
