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
    shortLabel: string;
  }>(() => {
    if (!data || !data.peerNetwork.isReady) {
      return {
        status: "CONNECTING",
        label: "Connecting",
        shortLabel: "--%",
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
        shortLabel: data.blockSyncer.syncing
          ? `${Math.floor(data.blockSyncer.syncing.progress * 100)}%`
          : "--%",
      };
    }
    if (!data.blockchain.synced) {
      return {
        status: "SYNCING",
        label: "Waiting for peers to sync from",
        shortLabel: "--%",
      };
    }
    if (data.accounts.scanning) {
      return {
        status: "SCANNING",
        label: `Scanning blocks: ${data.accounts.scanning.sequence} / ${data.accounts.scanning.endSequence}`,
        shortLabel: `${Math.floor(
          100 *
            (data.accounts.scanning.sequence /
              data.accounts.scanning.endSequence),
        )}%`,
      };
    }
    if (data.accounts.head.hash !== data.blockchain.head.hash) {
      return {
        status: "SCANNING",
        label: `Scanning blocks: ${data.accounts.head.sequence} / ${data.blockchain.head.sequence}`,
        shortLabel: `${Math.floor(
          100 * (data.accounts.head.sequence / data.blockchain.head.sequence),
        )}%`,
      };
    }
    return {
      status: "SYNCED",
      label: "Synced",
      shortLabel: "",
    };
  }, [data]);
}

export function StatusIndicator() {
  const { status, label, shortLabel } = useStatus();

  return (
    <Flex
      as="span"
      bg={status === "SYNCED" ? COLORS.GREEN_LIGHT : COLORS.YELLOW_LIGHT}
      borderRadius={4}
      color={status === "SYNCED" ? COLORS.GREEN_DARK : COLORS.YELLOW_DARK}
      justifyContent="center"
      py={2}
      textAlign="center"
      lineHeight="1.25em"
      _dark={{
        bg:
          status === "SYNCED"
            ? COLORS.DARK_MODE.GREEN_DARK
            : COLORS.DARK_MODE.YELLOW_DARK,
        color:
          status === "SYNCED"
            ? COLORS.DARK_MODE.GREEN_LIGHT
            : COLORS.DARK_MODE.YELLOW_LIGHT,
      }}
    >
      <Text
        as="span"
        color="inherit"
        _dark={{
          color: "inherit",
        }}
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
        <Text
          as="span"
          color="inherit"
          _dark={{
            color: "inherit",
          }}
        >
          {shortLabel}
        </Text>
        {status === "SYNCED" && <IoMdCheckmark size="1.25em" />}
      </Box>
    </Flex>
  );
}
