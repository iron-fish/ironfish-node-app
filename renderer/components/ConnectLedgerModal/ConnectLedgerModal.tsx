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
import { useIntl, defineMessages } from "react-intl";

import { trpcReact } from "@/providers/TRPCProvider";
import { COLORS } from "@/ui/colors";
import { PillButton } from "@/ui/PillButton/PillButton";

import connectImage from "./assets/connect.svg";

const messages = defineMessages({
  connectLedger: {
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
  cancel: {
    defaultMessage: "Cancel",
  },
  continue: {
    defaultMessage: "Continue",
  },
});

export function ConnectLedgerModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { formatMessage } = useIntl();

  const { data: isLedgerConnected } = trpcReact.isLedgerConnected.useQuery(
    undefined,
    {
      refetchInterval: (isConnected) => {
        return isConnected ? false : 3000;
      },
    },
  );

  const { data: isLedgerUnlocked } = trpcReact.isLedgerUnlocked.useQuery(
    undefined,
    {
      enabled: isLedgerConnected,
      refetchInterval: (isUnlocked) => {
        return isUnlocked ? false : 3000;
      },
    },
  );

  const { data: isAppOpen } = trpcReact.isIronfishAppOpen.useQuery(undefined, {
    enabled: isLedgerUnlocked,
    refetchInterval: (isOpen) => {
      return isOpen ? false : 3000;
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent maxW="100%" width="600px">
        <ModalBody px={16} pt={16}>
          <Heading mb={4}>{formatMessage(messages.connectLedger)}</Heading>
          <Image src={connectImage} alt="" />
          <VStack alignItems="stretch" gap={2} mt={6}>
            <ListItem
              number="1"
              content={formatMessage(messages.plugDevice)}
              complete={!!isLedgerConnected}
            />
            <ListItem
              number="2"
              content={formatMessage(messages.unlockLedger)}
              complete={!!isLedgerUnlocked}
            />
            <ListItem
              number="3"
              content={formatMessage(messages.openApp)}
              complete={!!isAppOpen}
            />
          </VStack>
        </ModalBody>

        <ModalFooter display="flex" gap={2} px={16} py={8}>
          <PillButton size="sm" onClick={onClose} variant="inverted" border={0}>
            {formatMessage(messages.cancel)}
          </PillButton>
          <PillButton size="sm" isDisabled onClick={() => {}}>
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
  complete,
}: {
  number: string;
  content: string;
  complete: boolean;
}) {
  return (
    <HStack>
      <Flex
        alignItems="center"
        justifyContent="center"
        boxSize="32px"
        border="1px solid"
        bg={complete ? COLORS.BLACK : COLORS.WHITE}
        borderColor={complete ? COLORS.BLACK : COLORS.GRAY_MEDIUM}
        color={complete ? COLORS.WHITE : COLORS.BLACK}
        borderRadius="full"
        _dark={{
          bg: complete ? COLORS.WHITE : COLORS.DARK_MODE.GRAY_MEDIUM,
          borderColor: complete ? COLORS.WHITE : COLORS.DARK_MODE.GRAY_MEDIUM,
          color: complete ? COLORS.DARK_MODE.GRAY_MEDIUM : COLORS.WHITE,
        }}
      >
        {number}
      </Flex>
      <Text textAlign="center" fontSize="md">
        {content}
      </Text>
    </HStack>
  );
}
