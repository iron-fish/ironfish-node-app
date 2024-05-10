import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useChainportData(isDevNetwork = false) {
  const TOKENS_ENDPOINT = `https://${
    isDevNetwork ? "preprod-" : ""
  }api.chainport.io/token/list?network_name=IRONFISH`;
  const META_ENDPOINT = `https://${
    isDevNetwork ? "preprod-" : ""
  }api.chainport.io/meta`;

  return useQuery({
    queryKey: ["useChainportData", isDevNetwork],
    queryFn: async () => {
      try {
        const [tokensResponse, metaResponse] = await Promise.all([
          axios.get(TOKENS_ENDPOINT),
          axios.get(META_ENDPOINT),
        ]);

        console.log({
          tokensResponse: tokensResponse,
          metaResponse: metaResponse,
        });
      } catch (err) {
        console.error("Failed to fetch chainport data", err);
        throw err;
      }
    },
  });
}
