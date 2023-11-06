import { Heading } from "@chakra-ui/react";
import { filesize } from "filesize";

import { trpcReact } from "@/providers/TRPCProvider";
import { truncateHash } from "@/utils/truncateHash";

function Peer({
  id,
  name,
  type,
  address,
}: {
  id: string | null;
  name: string | null;
  type: string;
  address: string | null;
}) {
  return (
    <tr>
      <td>{name ? `${id} (${name})` : id}</td>
      <td>{type}</td>
      <td>{address}</td>
    </tr>
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
      <div>
        <div>Connected Peers</div>
        <div>{status?.peerNetwork.peers}</div>
        <div>Node Status</div>
        <div>{status?.node.status}</div>
        <div>Outgoing</div>
        <div>
          {status && `${filesize(status.peerNetwork.outboundTraffic)}/s`}
        </div>
        <div>Incoming</div>
        <div>
          {status && `${filesize(status.peerNetwork.inboundTraffic)}/s`}
        </div>
        <div>Head Hash</div>
        <div>
          {status && `...${truncateHash(status.blockchain.head.hash, 1)}`}
        </div>
        <div>Head Sequence</div>
        <div>{status?.blockchain.head.sequence}</div>
      </div>
      <Heading>Connected Peers</Heading>
      <table>
        <tr>
          <th>Peer ID</th>
          <th>Connection Type</th>
          <th>Address</th>
        </tr>
        {connectedPeers?.map((p) => {
          const connectionType =
            p.connectionWebRTC === "CONNECTED"
              ? "WebRTC"
              : p.connectionWebSocket === "CONNECTED"
              ? "WebSocket"
              : "Unknown";
          return (
            <Peer
              key={p.identity}
              id={p.identity}
              name={p.name}
              type={connectionType}
              address={p.address}
            />
          );
        })}
      </table>
    </>
  );
}
