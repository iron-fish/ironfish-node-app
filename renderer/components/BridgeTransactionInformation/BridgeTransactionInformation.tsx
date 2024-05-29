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
import { useMemo } from "react";
import { defineMessages, useIntl } from "react-intl";

import chainportIcon from "@/images/chainport/chainport-icon.png";
import { trpcReact, TRPCRouterOutputs } from "@/providers/TRPCProvider";
import { COLORS } from "@/ui/colors";
import { ShadowCard } from "@/ui/ShadowCard/ShadowCard";

import { CopyAddress } from "../CopyAddress/CopyAddress";

type Transaction = TRPCRouterOutputs["getTransaction"]["transaction"];

const messages = defineMessages({
  heading: {
    defaultMessage: "Bridge Information",
  },
  status: {
    defaultMessage: "Status",
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
});

type Props = BoxProps & {
  transaction: Transaction;
};

export function BridgeTransactionInformation({ transaction, ...rest }: Props) {
  const { formatMessage } = useIntl();

  const { data: chainportStatus, isLoading: isChainportStatusLoading } =
    trpcReact.getChainportTransactionStatus.useQuery({
      transactionHash: transaction.hash,
    });
  const { data: chainportMeta } = trpcReact.getChainportMeta.useQuery();
  const { data: bridgeNoteMemo } = trpcReact.decodeMemo.useQuery({
    // @todo: Figure out how to do this without hardcoding the index
    memo: transaction.notes![1].memoHex,
  });

  const targetNetwork = useMemo(() => {
    if (!chainportStatus || !chainportMeta) return null;

    return chainportMeta.cp_network_ids[
      chainportStatus.target_network_id ?? ""
    ];
  }, [chainportMeta, chainportStatus]);

  const targetExplorerLink = useMemo(() => {
    if (!chainportStatus || !chainportMeta) return null;

    const baseUrl =
      chainportMeta.cp_network_ids[chainportStatus.target_network_id ?? ""]
        .explorer_url;

    return baseUrl + "tx/" + chainportStatus.target_tx_hash;
  }, [chainportMeta, chainportStatus]);

  if (isChainportStatusLoading) return null;

  return (
    <Box {...rest}>
      <Heading as="h3" fontSize="2xl" mb={8}>
        {formatMessage(messages.heading)}
      </Heading>
      <Grid templateColumns="repeat(3, 1fr)" gap={5}>
        <GridItem display="flex" alignItems="stretch">
          <ShadowCard
            contentContainerProps={{
              p: 8,
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
                <Box fontSize="md">
                  {chainportStatus?.target_tx_status === 1
                    ? "Success"
                    : "Pending"}
                </Box>
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
              p: 8,
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
                  {formatMessage(messages.destinationAddress)}
                </Text>
                <Box fontSize="md">
                  {bridgeNoteMemo
                    ? `${bridgeNoteMemo[1]
                        .toString()
                        .slice(0, 6)}...${bridgeNoteMemo[1]
                        .toString()
                        .slice(-4)}`
                    : "—"}
                </Box>
              </VStack>
              <Image
                width="48px"
                height="48px"
                src={targetNetwork?.network_icon}
                alt=""
              />
            </HStack>
          </ShadowCard>
        </GridItem>

        <GridItem display="flex" alignItems="stretch">
          <ShadowCard
            contentContainerProps={{
              p: 8,
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
                    <CopyAddress
                      fontSize="md"
                      color={COLORS.BLACK}
                      _dark={{ color: COLORS.WHITE }}
                      address={transaction.hash}
                      parts={2}
                    />
                    {targetExplorerLink && (
                      <Box
                        as="a"
                        target="_blank"
                        display="inline"
                        href={targetExplorerLink}
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
              <Image
                width="48px"
                height="48px"
                src={targetNetwork?.network_icon}
                alt=""
              />
            </HStack>
          </ShadowCard>
        </GridItem>
      </Grid>
    </Box>
  );
}
