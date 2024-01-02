import { useMemo } from "react";

import { trpcReact } from "@/providers/TRPCProvider";

type Status = "CONNECTING" | "SYNCING" | "SCANNING" | "SYNCED";

export function useSyncStatus() {
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
    if (!data.blockchain.synced) {
      return {
        status: "SYNCING",
        label: "Waiting for peers to sync from",
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
