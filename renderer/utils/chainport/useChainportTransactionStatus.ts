import { useMemo } from "react";

import { trpcReact, TRPCRouterOutputs } from "@/providers/TRPCProvider";

import { IRONFISH_NETWORK_ID } from "./constants";

type ChainportTransactionStatus =
  | "loading"
  | "iron_fish_submitted"
  | "bridge_pending"
  | "bridge_submitted"
  | "complete"
  | "failed";

export function useChainportTransactionStatus(
  transaction: TRPCRouterOutputs["getTransaction"]["transaction"],
): ChainportTransactionStatus {
  const { data, error, isLoading } =
    trpcReact.getChainportTransactionStatus.useQuery({
      transactionHash: transaction.hash,
      baseNetworkId: IRONFISH_NETWORK_ID,
    });

  return useMemo(() => {
    if (!data || isLoading) return "loading";

    if (error) return "failed";

    if (Object.entries(data).length === 0) return "bridge_pending";

    if (data.target_tx_status === 0) return "bridge_submitted";

    if (data.target_tx_status === 1) return "complete";

    return "iron_fish_submitted";
  }, [data, isLoading, error]);
}
