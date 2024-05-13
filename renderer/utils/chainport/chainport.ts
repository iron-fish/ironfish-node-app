import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { assertMetadataApiResponse, assertTokensApiResponse } from "./types";

export function useChainportData(isDevNetwork = true) {
  const TOKENS_ENDPOINT = `https://${
    isDevNetwork ? "preprod-" : ""
  }api.chainport.io/token/list?network_name=IRONFISH`;
  const METADATA_ENDPOINT = `https://${
    isDevNetwork ? "preprod-" : ""
  }api.chainport.io/meta`;

  return useQuery({
    queryKey: ["useChainportData", isDevNetwork],
    queryFn: async () => {
      try {
        const [tokensResponse, metadataResponse] = await Promise.all([
          axios.get(TOKENS_ENDPOINT),
          axios.get(METADATA_ENDPOINT),
        ]);
        const tokensData = assertTokensApiResponse(tokensResponse.data);
        const chainportMeta = assertMetadataApiResponse(metadataResponse.data);

        return tokensData.verified_tokens.map((token) => {
          const targetNetworks = token.target_networks.map((networkId) => {
            const networkDetails = chainportMeta.cp_network_ids[networkId];
            if (!networkDetails) {
              throw new Error(`Unknown network id: ${networkId}`);
            }
            return {
              chainportNetworkId: networkId,
              chainId: networkDetails.chain_id,
              label: networkDetails.label,
              networkIcon: networkDetails.network_icon,
            };
          });

          return {
            id: token.id,
            symbol: token.symbol,
            name: token.name,
            decimals: token.decimals,
            targetNetworks,
          };
        });
      } catch (err) {
        console.error("Failed to fetch chainport data", err);
        throw err;
      }
    },
  });
}
