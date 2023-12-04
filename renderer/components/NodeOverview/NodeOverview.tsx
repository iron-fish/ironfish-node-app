import {
  Heading,
  LightMode,
  Text,
  Box,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { filesize } from "filesize";
import Image from "next/image";
import { ReactNode } from "react";
import { FormattedMessage } from "react-intl";

import nodeOverviewGlobe from "@/images/node-overview-globe.svg";
import { trpcReact } from "@/providers/TRPCProvider";
import { COLORS } from "@/ui/colors";
import { ShadowCard } from "@/ui/ShadowCard/ShadowCard";
import { truncateHash } from "@/utils/truncateHash";
import { truncateString } from "@/utils/truncateString";

function Stat({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <Box>
      <Text color="#9B7641" fontSize="sm" mb={2} whiteSpace="nowrap">
        {label}
      </Text>
      <Heading color={COLORS.BLACK} fontSize={24} mb={4} whiteSpace="nowrap">
        {value}
      </Heading>
    </Box>
  );
}

export function NodeOverview() {
  const { data: status } = trpcReact.getStatus.useQuery(undefined, {
    refetchInterval: 1000,
  });
  const { data: peers } = trpcReact.getPeers.useQuery(undefined, {
    refetchInterval: 1000,
  });

  const connectedPeers = peers?.filter((p) => p.state === "CONNECTED");

  return (
    <>
      <LightMode>
        <ShadowCard
          contentContainerProps={{
            bg: "#FFCD85",
            p: 8,
            pt: "120px",
            overflow: "hidden",
            position: "relative",
          }}
          mb={10}
        >
          <Box
            position="absolute"
            right={0}
            top={0}
            bottom={0}
            display="flex"
            alignItems="flex-end"
            width={{
              base: 0,
              lg: "350px",
              xl: "450px",
            }}
          >
            <Image
              src={nodeOverviewGlobe}
              alt=""
              style={{ objectFit: "contain" }}
            />
          </Box>
          <Grid
            position="relative"
            templateColumns={{
              base: "repeat(1, min-content)",
              md: "repeat(2, min-content)",
              lg: "repeat(3, min-content)",
            }}
            gap={8}
            zIndex={1}
          >
            <GridItem>
              <Stat
                label={<FormattedMessage defaultMessage="Connected Peers" />}
                value={status?.peerNetwork.peers}
              />
            </GridItem>
            <GridItem>
              <Stat
                label={<FormattedMessage defaultMessage="Node Status" />}
                value={status?.node.status}
              />
            </GridItem>
            <GridItem>
              <Stat
                label={<FormattedMessage defaultMessage="Outgoing" />}
                value={
                  status && `${filesize(status.peerNetwork.outboundTraffic)}/s`
                }
              />
            </GridItem>
            <GridItem>
              <Stat
                label={<FormattedMessage defaultMessage="Incoming" />}
                value={
                  status && `${filesize(status.peerNetwork.inboundTraffic)}/s`
                }
              />
            </GridItem>
            <GridItem>
              <Stat
                label={<FormattedMessage defaultMessage="Head Hash" />}
                value={
                  status && `...${truncateHash(status.blockchain.head.hash, 1)}`
                }
              />
            </GridItem>
            <GridItem>
              <Stat
                label={<FormattedMessage defaultMessage="Head Sequence" />}
                value={status?.blockchain.head.sequence}
              />
            </GridItem>
          </Grid>
        </ShadowCard>
      </LightMode>

      <Box>
        <Heading as="h2" fontSize="2xl" mb={8}>
          <FormattedMessage defaultMessage="Connected Peers" />
        </Heading>
        <Grid templateColumns="repeat(4, 1fr)" opacity="0.8" mb={4}>
          <GridItem pl={8}>
            <Text as="span">
              <FormattedMessage defaultMessage="Peer ID" />
            </Text>
          </GridItem>
          <GridItem pl={8}>
            <Text as="span">
              <FormattedMessage defaultMessage="Name" />
            </Text>
          </GridItem>
          <GridItem>
            <Text as="span">
              <FormattedMessage defaultMessage="Connection Type" />
            </Text>
          </GridItem>
          <GridItem>
            <Text as="span">
              <FormattedMessage defaultMessage="Address" />
            </Text>
          </GridItem>
        </Grid>
      </Box>

      {connectedPeers?.map(
        ({
          connectionWebRTC,
          connectionWebSocket,
          name,
          identity,
          address,
        }) => {
          const connectionType =
            connectionWebRTC === "CONNECTED" ? (
              "WebRTC"
            ) : connectionWebSocket === "CONNECTED" ? (
              "WebSocket"
            ) : (
              <FormattedMessage defaultMessage="Unknown" />
            );
          return (
            <ShadowCard
              key={identity}
              height="86px"
              contentContainerProps={{
                display: "flex",
                alignItems: "center",
                px: 8,
              }}
              mb={4}
            >
              <Grid
                templateColumns="repeat(4, 1fr)"
                opacity="0.8"
                w="100%"
                gap={4}
              >
                <GridItem display="flex" alignItems="center">
                  <Text as="span">
                    {identity ? truncateString(identity) : "—"}
                  </Text>
                </GridItem>
                <GridItem display="flex" alignItems="center">
                  <Text as="span">{name || "—"}</Text>
                </GridItem>
                <GridItem display="flex" alignItems="center">
                  <Text as="span">{connectionType}</Text>
                </GridItem>
                <GridItem display="flex" alignItems="center">
                  <Text as="span">{address || "—"}</Text>
                </GridItem>
              </Grid>
            </ShadowCard>
          );
        },
      )}
    </>
  );
}
