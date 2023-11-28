import { Heading } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";

import { trpcReact } from "@/providers/TRPCProvider";

export function NodeSettings() {
  const utils = trpcReact.useUtils();

  const { data } = trpcReact.getConfig.useQuery();

  const { mutate, isLoading } = trpcReact.resetNode.useMutation();
  const { mutate: setConfig, isLoading: isSetConfigLoading } =
    trpcReact.setConfig.useMutation({
      onSettled() {
        utils.getConfig.invalidate();
      },
    });

  const [nodeName, setNodeName] = useState(data?.nodeName);

  useEffect(() => {
    setNodeName(data?.nodeName);
  }, [data?.nodeName]);

  const resetOnClick = useCallback(() => {
    mutate();
  }, [mutate]);

  if (!data) {
    return null;
  }

  return (
    <>
      <Heading>Node Settings</Heading>
      <div>
        <div>Node name</div>
        <input
          value={nodeName}
          onChange={(e) => {
            setNodeName(e.target.value);
          }}
        />
        <button
          onClick={() =>
            setConfig({ configValues: [{ name: "nodeName", value: nodeName }] })
          }
        >
          {isSetConfigLoading ? "Loading..." : "Update Node Name"}
        </button>
        <div>Block graffiti</div>
        <div>{data.blockGraffiti}</div>
        <div>Min peers</div>
        <div>{data.minPeers}</div>
        <div>Max peers</div>
        <div>{data.maxPeers}</div>
        <div>Node workers</div>
        <div>{data.nodeWorkers}</div>
        <div>Blocks per message</div>
        <div>{data.blocksPerMessage}</div>
        <div>Telemetry</div>
        <div>{data.enableTelemetry}</div>
        <button onClick={resetOnClick}>
          {isLoading ? "Loading..." : "Reset Node"}
        </button>
      </div>
    </>
  );
}
