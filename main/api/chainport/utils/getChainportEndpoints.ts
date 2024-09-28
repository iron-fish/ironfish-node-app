import { MAINNET } from "@ironfish/sdk";

import { manager } from "../../manager";

export async function getChainportEndpoints() {
  const ironfish = await manager.getIronfish();
  const rpcClient = await ironfish.rpcClient();
  const response = await rpcClient.chain.getNetworkInfo();

  const networkId = response.content.networkId.toString();

  const prefix = {
    "0": "preprod-",
    "1": "",
  }[networkId];

  if (typeof prefix !== "string") {
    throw new Error(
      `Iron Fish node is currently using an unknown network id: ${response.content.networkId}`,
    );
  }

  const baseUrl = `https://${prefix}api.chainport.io`;

  // TODO: Remove this once the Mainnet API is updated
  const tokensEndpoint =
    networkId === MAINNET.id.toString()
      ? `${baseUrl}/token/list?network_name=IRONFISH`
      : `${baseUrl}/token_list?network_name=IRONFISH`;
  console.log("tokensEndpoint", tokensEndpoint);
  const metadataEndpoint = `${baseUrl}/meta`;

  return { baseUrl, tokensEndpoint, metadataEndpoint };
}
