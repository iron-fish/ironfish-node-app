import { useMemo } from "react";
import { defineMessages } from "react-intl";

import { trpcReact, TRPCRouterOutputs } from "@/providers/TRPCProvider";

type ChainportTransactionStatus =
  | "loading"
  | "iron_fish_submitted"
  | "bridge_pending"
  | "bridge_submitted"
  | "complete"
  | "failed";

const chainportStatusMessages = defineMessages({
  loading: {
    defaultMessage: "Loading",
  },
  iron_fish_submitted: {
    defaultMessage: "Submitted",
  },
  bridge_pending: {
    defaultMessage: "Preparing destination txn",
  },
  bridge_submitted: {
    defaultMessage: "Submitted destination txn",
  },
  complete: {
    defaultMessage: "Complete",
  },
  failed: {
    defaultMessage: "Failed",
  },
});

export function getMessageForStatus(status: ChainportTransactionStatus) {
  return chainportStatusMessages[status];
}

export function useChainportTransactionStatus(
  transaction: TRPCRouterOutputs["getTransaction"]["transaction"],
): ChainportTransactionStatus {
  const { data, error, isLoading } =
    trpcReact.getChainportTransactionStatus.useQuery({
      transactionHash: transaction.hash,
    });

  return useMemo(() => {
    if (!data || isLoading) return "loading";

    if (error) return "failed";

    if (!("base_tx_status" in data) || Object.keys(data).length === 0)
      return "iron_fish_submitted";

    if (data.base_tx_status === 1 && data.target_tx_status === null)
      return "bridge_pending";

    if (data.target_tx_status === 1) return "complete";

    if (data.target_tx_hash) return "bridge_submitted";

    return "iron_fish_submitted";
  }, [data, isLoading, error]);
}
