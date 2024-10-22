import { Heading, HStack, Flex, VStack, Text } from "@chakra-ui/react";
import Image from "next/image";
import { useMemo } from "react";
import { IoMdCheckmark } from "react-icons/io";
import { useIntl, defineMessages } from "react-intl";

import { COLORS } from "@/ui/colors";

import connectImage from "./assets/connect.svg";
import connectedImage from "./assets/connected.svg";
import openIronFishImage from "./assets/openIronFish.svg";
import unlockImage from "./assets/unlock.svg";

const messages = defineMessages({
  headingConnectLedger: {
    defaultMessage: "Connect your Ledger",
  },
  plugDevice: {
    defaultMessage: "Plug your Ledger device directly into your computer",
  },
  unlockLedger: {
    defaultMessage: "Unlock your Ledger",
  },
  openApp: {
    defaultMessage: "Open the Iron Fish app",
  },
});

type Props = {
  isLedgerConnected: boolean;
  isLedgerUnlocked: boolean;
  isIronfishAppOpen: boolean;
};

export function StepConnect({
  isLedgerConnected,
  isLedgerUnlocked,
  isIronfishAppOpen,
}: Props) {
  const { formatMessage } = useIntl();

  const imageSrc = useMemo(() => {
    if (!isLedgerConnected) {
      return connectImage;
    }
    if (!isLedgerUnlocked) {
      return unlockImage;
    }
    if (!isIronfishAppOpen) {
      return openIronFishImage;
    }
    return connectedImage;
  }, [isLedgerConnected, isLedgerUnlocked, isIronfishAppOpen]);

  return (
    <>
      <Heading mb={4}>{formatMessage(messages.headingConnectLedger)}</Heading>
      <Image src={imageSrc} alt="" />
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
          bg:
            (isNextStep && COLORS.WHITE) ||
            (isComplete && COLORS.DARK_MODE.GREEN_LIGHT) ||
            COLORS.DARK_MODE.GRAY_MEDIUM,
          borderColor:
            (isNextStep && COLORS.WHITE) ||
            (isComplete && COLORS.DARK_MODE.GREEN_LIGHT) ||
            COLORS.DARK_MODE.GRAY_MEDIUM,
          color:
            (isNextStep && COLORS.DARK_MODE.GRAY_MEDIUM) ||
            (isComplete && COLORS.DARK_MODE.GREEN_DARK) ||
            COLORS.WHITE,
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
