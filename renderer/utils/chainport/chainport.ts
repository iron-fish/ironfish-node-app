import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { assertMetadataApiResponse, assertTokensApiResponse } from "./types";

export type ChainportToken = {
  chainportId: number;
  ironfishId: string;
  symbol: string;
  name: string;
  decimals: number;
  targetNetworks: {
    chainportNetworkId: number;
    chainId: number | null;
    value: string;
    label: string;
    networkIcon: string;
  }[];
};

export type ChainportTargetNetwork = {
  chainportNetworkId: number;
  label: string;
  networkIcon: string;
  chainId: number | null;
  value: string;
};

export function useChainportTokens(isDevNetwork = true) {
  const TOKENS_ENDPOINT = `https://${
    isDevNetwork ? "preprod-" : ""
  }api.chainport.io/token/list?network_name=IRONFISH`;
  const METADATA_ENDPOINT = `https://${
    isDevNetwork ? "preprod-" : ""
  }api.chainport.io/meta`;

  return useQuery<{
    chainportTokens: ChainportToken[];
    chainportTokensMap: Map<string, ChainportToken>;
    chainportNetworksMap: Map<string, ChainportTargetNetwork>;
  }>({
    queryKey: ["useChainportTokens", isDevNetwork],
    queryFn: async () => {
      try {
        const [tokensResponse, metadataResponse] = await Promise.all([
          axios.get(TOKENS_ENDPOINT),
          axios.get(METADATA_ENDPOINT),
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
        const chainportTokensMap: Map<string, ChainportToken> = new Map(
          tokenEntries,
        );
        const networksEntries = chainportTokens.flatMap((token) =>
          token.targetNetworks.map<[string, ChainportTargetNetwork]>(
            (network) => [network.value, network],
          ),
        );
        const chainportNetworksMap: Map<string, ChainportTargetNetwork> =
          new Map(networksEntries);
        return {
          chainportTokens,
          chainportTokensMap,
          chainportNetworksMap,
        };
      } catch (err) {
        console.error("Failed to fetch chainport data", err);
        throw err;
      }
    },
  });
}
