import {
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  LightMode,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import Image from "next/image";
import { defineMessages, useIntl } from "react-intl";

import treasureChest from "@/images/treasure-chest.svg";
import { trpcReact } from "@/providers/TRPCProvider";
import { ChakraLink } from "@/ui/ChakraLink/ChakraLink";
import { COLORS } from "@/ui/colors";
import { PillButton } from "@/ui/PillButton/PillButton";
import { ShadowCard } from "@/ui/ShadowCard/ShadowCard";
import { ArrowReceive } from "@/ui/SVGs/ArrowReceive";
import { ArrowSend } from "@/ui/SVGs/ArrowSend";
import { hexToUTF16String } from "@/utils/hexToUTF16String";
import { formatOre } from "@/utils/ironUtils";

import { AccountSyncingProgress } from "../AccountSyncingProgress/AccountSyncingProgress";

const messages = defineMessages({
  viewOnlySendDisabled: {
    defaultMessage: "View only accounts cannot send transactions",
  },
  syncingSendDisabled: {
    defaultMessage:
      "This account is syncing. Please wait until the sync is complete before sending transactions.",
  },
  yourAssets: {
    defaultMessage: "Your Assets",
  },
  otherAssets: {
    defaultMessage: "Other Assets",
  },
  sendButton: {
    defaultMessage: "Send",
  },
  receiveButton: {
    defaultMessage: "Receive",
  },
});

export function AccountAssets({ accountName }: { accountName: string }) {
  const { formatMessage } = useIntl();
  const { data } = trpcReact.getAccount.useQuery({
    name: accountName,
  });

  const { data: isSynced = { synced: false, progress: 0 } } =
    trpcReact.isAccountSynced.useQuery(
      {
        account: accountName,
      },
      {
        refetchInterval: 5000,
      },
    );

  if (!data) {
    // @todo: Error handling
    return null;
  }

  return (
    <Box>
      <LightMode>
        <ShadowCard
          contentContainerProps={{
            p: 0,
            bg: COLORS.VIOLET,
          }}
          mb={10}
        >
          {!isSynced.synced && (
            <Box px={3} pt={3}>
              <AccountSyncingProgress progress={isSynced.progress} />
            </Box>
          )}
          <Box p={8}>
            <Heading color={COLORS.BLACK} fontSize={24} mb={4}>
              {formatMessage(messages.yourAssets)}
            </Heading>
            <HStack
              bg="rgba(255, 255, 255, 0.15)"
              p={8}
              borderRadius="7px"
              justifyContent="space-between"
            >
              <Flex alignItems="flex-start" flexDirection="column">
                <Text fontSize="lg" mb={2}>
                  $IRON
                </Text>
                <Heading as="span" color="black" mb={5}>
                  {formatOre(data.balances.iron.confirmed)}
                </Heading>
                <HStack alignItems="stretch" justifyContent="center">
                  <ChakraLink
                    href={
                      data.status.viewOnly
                        ? "#"
                        : `/send?account=${accountName}`
                    }
                  >
                    <Tooltip
                      label={
                        data.status.viewOnly
                          ? formatMessage(messages.viewOnlySendDisabled)
                          : !isSynced.synced
                          ? formatMessage(messages.syncingSendDisabled)
                          : null
                      }
                      placement="top"
                    >
                      <Box>
                        <PillButton
                          size="sm"
                          as="div"
                          isDisabled={data.status.viewOnly || !isSynced.synced}
                        >
                          <ArrowSend transform="scale(0.8)" />
                          {formatMessage(messages.sendButton)}
                        </PillButton>
                      </Box>
                    </Tooltip>
                  </ChakraLink>
                  <ChakraLink href={`/receive?account=${accountName}`}>
                    <PillButton size="sm" as="div">
                      <ArrowReceive transform="scale(0.8)" />
                      {formatMessage(messages.receiveButton)}
                    </PillButton>
                  </ChakraLink>
                </HStack>
              </Flex>
              <Image alt="" src={treasureChest} />
            </HStack>

            {data.balances.custom.length > 0 && (
              <Box
                bg="rgba(255, 255, 255, 0.15)"
                p={8}
                mt={8}
                borderRadius="7px"
                justifyContent="space-between"
              >
                <Text fontSize="lg" mb={4}>
                  {formatMessage(messages.otherAssets)}
                </Text>
                <Grid
                  gap={4}
                  templateColumns={
                    data.balances.custom.length > 1 ? "repeat(2, 1fr)" : "1fr"
                  }
                >
                  {data.balances.custom.map((balance) => {
                    return (
                      <GridItem
                        key={balance.assetId}
                        bg="rgba(255, 255, 255, 0.15)"
                        display="flex"
                        alignItems="center"
                        p={4}
                        borderRadius="4px"
                      >
                        <Text fontSize="lg" flexGrow={1} as="span">
                          {hexToUTF16String(balance.asset.name)}
                        </Text>
                        <Text fontSize="lg">
                          {formatOre(balance.confirmed)}
                        </Text>
                      </GridItem>
                    );
                  })}
                </Grid>
              </Box>
            )}
          </Box>
        </ShadowCard>
      </LightMode>
    </Box>
  );
}
