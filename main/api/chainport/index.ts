import axios from "axios";
import { z } from "zod";

import { handleGetChainportBridgeTransactionEstimatedFees } from "./handleGetChainportBridgeTransactionEstimatedFees";
import {
  handleSendChainportBridgeTransaction,
  handleSendChainportBridgeTransactionInput,
} from "./handleSendChainportBridgeTransaction";
import { buildTransactionRequestParamsInputs } from "./utils/buildTransactionRequestParams";
import {
  ChainportBridgeTransaction,
  ChainportTargetNetwork,
  ChainportToken,
  assertMetadataApiResponse,
  assertTokensApiResponse,
} from "../../../shared/chainport";
import { manager } from "../manager";
import { t } from "../trpc";

async function getChainportEndpoints() {
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

export const chainportRouter = t.router({
  getChainportEndpoints: t.procedure.query(async () => {
    const endpoints = await getChainportEndpoints();
    return endpoints;
  }),
  getChainportTokens: t.procedure.query(async () => {
    const { tokensEndpoint, metadataEndpoint } = await getChainportEndpoints();

    try {
      const [tokensResponse, metadataResponse] = await Promise.all([
        axios.get(tokensEndpoint),
        axios.get(metadataEndpoint),
      ]);
      const tokensData = assertTokensApiResponse(tokensResponse.data);
      const chainportMeta = assertMetadataApiResponse(metadataResponse.data);

      const chainportTokens = tokensData.verified_tokens.map((token) => {
        const targetNetworks: Array<ChainportTargetNetwork> =
          token.target_networks
            .map((networkId) => {
              const networkDetails = chainportMeta.cp_network_ids[networkId];
              if (!networkDetails) {
                throw new Error(`Unknown network id: ${networkId}`);
              }
              return {
                chainportNetworkId: networkId,
                label: networkDetails.label,
                networkIcon: networkDetails.network_icon,
                chainId: networkDetails.chain_id,
                value: networkDetails.chain_id
                  ? networkDetails.chain_id.toString()
                  : "",
              };
            })
            .filter((item) => {
              return item.value !== null;
            });

        return {
          chainportId: token.id,
          ironfishId: token.web3_address,
          symbol: token.symbol,
          name: token.name,
          decimals: token.decimals,
          targetNetworks,
        };
      });

      const tokenEntries = chainportTokens.map<[string, ChainportToken]>(
        (token) => [token.ironfishId, token],
      );
      const chainportTokensMap: Record<string, ChainportToken> =
        Object.fromEntries(tokenEntries);

      const networksEntries = chainportTokens.flatMap((token) =>
        token.targetNetworks.map<[string, ChainportTargetNetwork]>(
          (network) => [network.value, network],
        ),
      );
      const chainportNetworksMap: Record<string, ChainportTargetNetwork> =
        Object.fromEntries(networksEntries);
      return {
        chainportTokens,
        chainportTokensMap,
        chainportNetworksMap,
      };
    } catch (err) {
      console.error("Failed to fetch chainport data", err);
      throw err;
    }
  }),
  getChainportBridgeTransactionDetails: t.procedure
    .input(
      z.object({
        amount: z.string(),
        assetId: z.string(),
        to: z.string(),
        selectedNetwork: z.string(),
      }),
    )
    .query(async (opts) => {
      const endpoints = await getChainportEndpoints();

      const { amount, assetId, to, selectedNetwork } = opts.input;

      const url = `${
        endpoints.baseUrl
      }/ironfish/metadata?raw_amount=${amount.toString()}&asset_id=${assetId}&target_network_id=${selectedNetwork}&target_web3_address=${to}`;

      const response: {
        data: ChainportBridgeTransaction;
      } = await axios.get(url);

      return response.data;
    }),
  getChainportBridgeTransactionEstimatedFees: t.procedure
    .input(buildTransactionRequestParamsInputs)
    .query(async (opts) => {
      const result = await handleGetChainportBridgeTransactionEstimatedFees(
        opts.input,
      );
      return result;
    }),
  sendChainportBridgeTransaction: t.procedure
    .input(handleSendChainportBridgeTransactionInput)
    .mutation(async (opts) => {
      const result = await handleSendChainportBridgeTransaction(opts.input);
      return result;
    }),
});
