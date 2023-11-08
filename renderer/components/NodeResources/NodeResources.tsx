import { Heading } from "@chakra-ui/react";
import { filesize } from "filesize";

import { trpcReact } from "@/providers/TRPCProvider";

export function NodeResources() {
  const { data } = trpcReact.getStatus.useQuery(undefined, {
    refetchInterval: 1000,
  });

  if (!data) {
    return null;
  }

  return (
    <>
      <Heading>Node Resources</Heading>
      <div>
        <div>Cores</div>
        <div>{data.cpu.cores}</div>
        <div>Current</div>
        <div>{`${data.cpu.percentCurrent.toFixed(1)}%`}</div>
        <div>RSS</div>
        <div>{`${filesize(data.memory.rss)} (${(
          (data.memory.rss / data.memory.memTotal) *
          100
        ).toFixed(1)}%)`}</div>
        <div>Free</div>
        <div>{`${filesize(data.memory.memFree)} (${(
          (1 - data.memory.memFree / data.memory.memTotal) *
          100
        ).toFixed(1)}%)`}</div>
        <div>Heap used</div>
        <div>{filesize(data.memory.heapUsed)}</div>
        <div>Heap total</div>
        <div>{filesize(data.memory.heapTotal)}</div>
        <div>Heap max</div>
        <div>{`${filesize(data.memory.heapMax)} (${(
          (data.memory.heapUsed / data.memory.heapMax) *
          100
        ).toFixed(1)}%)`}</div>
      </div>
    </>
  );
}
