import {
  Box,
  BoxProps,
  Grid,
  GridItem,
  Heading,
  Text,
  HStack,
  VStack,
  Image,
} from "@chakra-ui/react";
import NextImage from "next/image";
import { ReactNode } from "react";
import { defineMessages, useIntl } from "react-intl";

import chainportIcon from "@/images/chainport/chainport-icon-lg.png";
import { COLORS } from "@/ui/colors";
import { ShadowCard } from "@/ui/ShadowCard/ShadowCard";

import { CopyAddress } from "../CopyAddress/CopyAddress";

const messages = defineMessages({
  heading: {
    defaultMessage: "Bridge Information",
  },
  status: {
    defaultMessage: "Status",
  },
  senderAddress: {
    defaultMessage: "Sender Address",
  },
  destinationAddress: {
    defaultMessage: "Destination Address",
  },
  destinationTxnHash: {
    defaultMessage: "Destination Txn Hash",
  },
  viewInBlockExplorer: {
    defaultMessage: "View in Block Explorer",
  },
  sourceNetwork: {
    defaultMessage: "Source Network",
  },
});

type Props = BoxProps & {
  status: ReactNode;
  type: ReactNode;
  address: ReactNode;
  networkIcon?: string;
  targetTxHash?: string;
  blockExplorerUrl?: string;
  sourceNetwork?: {
    name: string;
    icon: string;
  };
};

export function BridgeTransactionInformationShell({
  status,
  type,
  address,
  networkIcon,
  targetTxHash,
  blockExplorerUrl,
  sourceNetwork,
  ...rest
}: Props) {
  const { formatMessage } = useIntl();
  const isSend = type === "send";

  return (
    <Box {...rest}>
      <Heading as="h3" fontSize="2xl" mb={8}>
        {formatMessage(messages.heading)}
      </Heading>
      <Grid templateColumns="repeat(3, 1fr)" gap={5}>
        <GridItem display="flex" alignItems="stretch">
          <ShadowCard
            contentContainerProps={{
              px: 5,
              py: 6,
              display: "flex",
              alignItems: "center",
            }}
            w="100%"
          >
            <HStack justifyContent="space-between" w="100%">
              <VStack alignItems="flex-start">
                <Text
                  color={COLORS.GRAY_MEDIUM}
                  fontSize="md"
                  _dark={{
                    color: COLORS.DARK_MODE.GRAY_LIGHT,
                  }}
                >
                  {formatMessage(messages.status)}
                </Text>
                <Box fontSize="md">{status}</Box>
              </VStack>
              <NextImage
                width="48px"
                height="48px"
                src={chainportIcon}
                alt=""
              />
            </HStack>
          </ShadowCard>
        </GridItem>

        <GridItem display="flex" alignItems="stretch">
          <ShadowCard
            contentContainerProps={{
              px: 5,
              py: 6,
              display: "flex",
              alignItems: "center",
            }}
            w="100%"
          >
            <HStack justifyContent="space-between" w="100%">
              <VStack alignItems="flex-start">
                <Text
                  color={COLORS.GRAY_MEDIUM}
                  fontSize="md"
                  _dark={{
                    color: COLORS.DARK_MODE.GRAY_LIGHT,
                  }}
                >
                  {formatMessage(
                    isSend
                      ? messages.destinationAddress
                      : messages.senderAddress,
                  )}
                </Text>
                <Box fontSize="md">
                  {typeof address === "string"
                    ? `${address.slice(0, 6)}...${address.toString().slice(-4)}`
                    : address}
                </Box>
              </VStack>
              {networkIcon && (
                <Image width="48px" height="48px" src={networkIcon} alt="" />
              )}
            </HStack>
          </ShadowCard>
        </GridItem>

        {isSend && (
          <GridItem display="flex" alignItems="stretch">
            <ShadowCard
              contentContainerProps={{
                px: 5,
                py: 6,
                display: "flex",
                alignItems: "center",
              }}
              w="100%"
            >
              <HStack justifyContent="space-between" w="100%">
                <VStack alignItems="flex-start">
                  <Text
                    color={COLORS.GRAY_MEDIUM}
                    fontSize="md"
                    _dark={{
                      color: COLORS.DARK_MODE.GRAY_LIGHT,
                    }}
                  >
                    {formatMessage(messages.destinationTxnHash)}
                  </Text>
                  <Box fontSize="md">
                    <VStack alignItems="flex-start">
                      {targetTxHash ? (
                        <CopyAddress
                          fontSize="md"
                          color={COLORS.BLACK}
                          _dark={{ color: COLORS.WHITE }}
                          address={targetTxHash}
                          parts={2}
                        />
                      ) : (
                        <Text>—</Text>
                      )}
                      {blockExplorerUrl && (
                        <Box
                          as="a"
                          target="_blank"
                          display="inline"
                          href={blockExplorerUrl}
                          _hover={{ textDecor: "underline" }}
                        >
                          <Text fontSize="xs" lineHeight="160%">
                            {formatMessage(messages.viewInBlockExplorer)}
                          </Text>
                        </Box>
                      )}
                    </VStack>
                  </Box>
                </VStack>
                {networkIcon && (
                  <Image width="48px" height="48px" src={networkIcon} alt="" />
                )}
              </HStack>
            </ShadowCard>
          </GridItem>
        )}
        {!isSend && sourceNetwork && (
          <GridItem display="flex" alignItems="stretch">
            <ShadowCard
              contentContainerProps={{
                px: 5,
                py: 6,
                display: "flex",
                alignItems: "center",
              }}
              w="100%"
            >
              <HStack justifyContent="space-between" w="100%">
                <VStack alignItems="flex-start">
                  <Text
                    color={COLORS.GRAY_MEDIUM}
                    fontSize="md"
                    _dark={{
                      color: COLORS.DARK_MODE.GRAY_LIGHT,
                    }}
                  >
                    {formatMessage(messages.sourceNetwork)}
                  </Text>
                  <Box fontSize="md">{sourceNetwork?.name}</Box>
                </VStack>
                <Image
                  width="48px"
                  height="48px"
                  src={sourceNetwork?.icon}
                  alt=""
                />
              </HStack>
            </ShadowCard>
          </GridItem>
        )}
      </Grid>
    </Box>
  );
}
