import { trpcReact } from "@/providers/TRPCProvider";

export const StatusIndicator = () => {
  const { data } = trpcReact.getStatus.useQuery(undefined, {
    refetchInterval: 1000,
  });

  let status = "";
  let statusColor = "yellow";

  if (!data || !data.peerNetwork.isReady) {
    status = "Connecting";
    statusColor = "yellow";
  } else if (data.blockSyncer.status === "syncing") {
    status = data.blockSyncer.syncing
      ? `Syncing blocks: ${(data.blockSyncer.syncing.progress * 100).toFixed(
          2,
        )}%`
      : "Syncing blocks";
    statusColor = "yellow";
  } else if (data.accounts.head.hash !== data.blockchain.head.hash) {
    status = `Scanning blocks: ${data.accounts.head.sequence} / ${data.blockchain.head.sequence}`;
    statusColor = "yellow";
  } else {
    status = "Synced";
    statusColor = "green";
  }

  return (
    <div>
      <div>
        Node Status: <span style={{ background: statusColor }}>{status}</span>
      </div>
    </div>
  );
};
