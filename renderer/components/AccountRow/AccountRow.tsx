import { ChevronRightIcon } from "@chakra-ui/icons";
import {
  Box,
  Flex,
  Heading,
  HStack,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { defineMessages, useIntl } from "react-intl";

import { trpcReact } from "@/providers/TRPCProvider";
import { ChakraLink } from "@/ui/ChakraLink/ChakraLink";
import { COLORS } from "@/ui/colors";
import { PillButton } from "@/ui/PillButton/PillButton";
import { ShadowCard, type GradientOptions } from "@/ui/ShadowCard/ShadowCard";
import { ArrowReceive } from "@/ui/SVGs/ArrowReceive";
import { ArrowSend } from "@/ui/SVGs/ArrowSend";
import { LogoSm } from "@/ui/SVGs/LogoSm";
import { formatOre } from "@/utils/ironUtils";

import { CopyAddress } from "../CopyAddress/CopyAddress";
import { ViewOnlyChip } from "../ViewOnlyChip/ViewOnlyChip";

const messages = defineMessages({
  viewOnlySendDisabled: {
    defaultMessage: "View only accounts cannot send transactions",
  },
  syncingSendDisabled: {
    defaultMessage:
      "This account is syncing. Please wait until the sync is complete before sending transactions.",
  },
  syncingProgressMessage: {
    defaultMessage: "Account Syncing: {progress}%",
  },
  syncingBalanceMessage: {
    defaultMessage: "Your balance might not be accurate while you're syncing",
  },
});

type AccountRowProps = {
  color: GradientOptions;
  name: string;
  balance: string;
  address: string;
  viewOnly: boolean;
};

function SyncingProgress({ progress }: { progress: number }) {
  const { formatMessage } = useIntl();

  return (
    <Box
      borderRadius="4px"
      bg={COLORS.YELLOW_LIGHT}
      color={COLORS.YELLOW_DARK}
      _dark={{
        bg: COLORS.DARK_MODE.YELLOW_DARK,
        color: COLORS.DARK_MODE.YELLOW_LIGHT,
      }}
      fontSize="sm"
      textAlign="center"
      p={1}
    >{`${formatMessage(messages.syncingProgressMessage, {
      progress: parseFloat((progress * 100).toFixed(2)),
    })} | ${formatMessage(messages.syncingBalanceMessage)}`}</Box>
  );
}

export function AccountRow({
  color,
  name,
  balance,
  address,
  viewOnly,
}: AccountRowProps) {
  const router = useRouter();
  const { formatMessage } = useIntl();
  const { data: isSynced = { synced: false, progress: 0 } } =
    trpcReact.isAccountSynced.useQuery(
      {
        account: name,
      },
      {
        refetchInterval: 5000,
      },
    );
  return (
    <ChakraLink href={`/accounts/${name}`} w="100%">
      <ShadowCard hoverable>
        <VStack alignItems="stretch">
          {!isSynced.synced && <SyncingProgress progress={isSynced.progress} />}

          <Flex>
            <ShadowCard
              h="110px"
              w="110px"
              gradient={color || "pink"}
              mr={8}
              position="relative"
            >
              <Flex
                position="absolute"
                inset={0}
                justifyContent="center"
                alignItems="center"
              >
                <Box transform="scale(1.5)" color="black">
                  <LogoSm />
                </Box>
              </Flex>
            </ShadowCard>
            <VStack
              alignItems="flex-start"
              justifyContent="center"
              flexGrow={1}
            >
              <HStack>
                <Text as="h3">{name}</Text>
                {viewOnly && <ViewOnlyChip />}
              </HStack>
              <Heading as="span" fontWeight="regular" fontSize="2xl">
                {formatOre(balance)} $IRON
              </Heading>
              <CopyAddress address={address} />
            </VStack>

            <VStack
              alignItems="stretch"
              justifyContent="center"
              position="relative"
            >
              <Tooltip
                label={
                  viewOnly
                    ? formatMessage(messages.viewOnlySendDisabled)
                    : !isSynced.synced
                    ? formatMessage(messages.syncingSendDisabled)
                    : null
                }
                placement="top"
              >
                <VStack w="100%" alignItems="stretch">
                  <PillButton
                    size="sm"
                    isDisabled={viewOnly || !isSynced.synced}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (viewOnly || !isSynced.synced) return;
                      router.push(`/send?account=${name}`);
                    }}
                  >
                    <ArrowSend transform="scale(0.8)" />
                    Send
                  </PillButton>
                </VStack>
              </Tooltip>
              <PillButton
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  router.push(`/receive?account=${name}`);
                }}
              >
                <ArrowReceive transform="scale(0.8)" />
                Receive
              </PillButton>
            </VStack>

            <VStack pl={8} pr={4} justifyContent="center">
              <ChevronRightIcon
                boxSize={5}
                color={COLORS.GRAY_MEDIUM}
                _dark={{ color: COLORS.DARK_MODE.GRAY_LIGHT }}
              />
            </VStack>
          </Flex>
        </VStack>
      </ShadowCard>
    </ChakraLink>
  );
}
