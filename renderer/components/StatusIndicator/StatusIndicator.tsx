import { Box, Flex, Text } from "@chakra-ui/react";
import { useMemo } from "react";
import { IoMdCheckmark } from "react-icons/io";

import { trpcReact } from "@/providers/TRPCProvider";
import { COLORS } from "@/ui/colors";

type Status = "CONNECTING" | "SYNCING" | "SCANNING" | "SYNCED";

function useStatus() {
  const { data } = trpcReact.getStatus.useQuery(undefined, {
    refetchInterval: 1000,
  });

  return useMemo<{
    status: Status;
    label: string;
  }>(() => {
    if (!data || !data.peerNetwork.isReady) {
      return {
        status: "CONNECTING",
        label: "Connecting",
      };
    }
    if (data.blockSyncer.status === "syncing") {
      return {
        status: "SYNCING",
        label: data.blockSyncer.syncing
          ? `Syncing blocks: ${(
              data.blockSyncer.syncing.progress * 100
            ).toFixed(2)}%`
          : "Syncing blocks",
      };
    }
    if (data.accounts.head.hash !== data.blockchain.head.hash) {
      return {
        status: "SCANNING",
        label: `Scanning blocks: ${data.accounts.head.sequence} / ${data.blockchain.head.sequence}`,
      };
    }
    return {
      status: "SYNCED",
      label: "Synced",
    };
  }, [data]);
}

export function StatusIndicator() {
  const { status, label } = useStatus();

  return (
    <Flex
      as="span"
      bg={status === "SYNCED" ? COLORS.GREEN_LIGHT : "gray"}
      borderRadius={4}
      color={status === "SYNCED" ? COLORS.GREEN_DARK : "red"}
      justifyContent="center"
      my={4}
      py={3}
      textAlign="center"
      _dark={{
        bg: status === "SYNCED" ? COLORS.DARK_MODE.GREEN_DARK : "gray",
        color: status === "SYNCED" ? COLORS.DARK_MODE.GREEN_LIGHT : "red",
      }}
    >
      <Text
        as="span"
        color="inherit"
        display={{
          base: "none",
          sm: "block",
        }}
      >
        Node Status: {label}
      </Text>
      <Box
        display={{
          base: "block",
          sm: "none",
        }}
      >
        <IoMdCheckmark size="1.25em" />
      </Box>
    </Flex>
  );
}
