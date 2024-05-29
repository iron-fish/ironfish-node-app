import { manager } from "../../manager";

export async function getChainportEndpoints() {
  const ironfish = await manager.getIronfish();
  const rpcClient = await ironfish.rpcClient();
  const response = await rpcClient.chain.getNetworkInfo();
  const prefix = {
    "0": "preprod-",
    "1": "",
  }[response.content.networkId.toString()];

  if (typeof prefix !== "string") {
    throw new Error(
      `Iron Fish node is currently using an unknown network id: ${response.content.networkId}`,
    );
  }

  const baseUrl = `https://${prefix}api.chainport.io`;
  const tokensEndpoint = `${baseUrl}/token/list?network_name=IRONFISH`;
  const metadataEndpoint = `${baseUrl}/meta`;

  return { baseUrl, tokensEndpoint, metadataEndpoint };
}
