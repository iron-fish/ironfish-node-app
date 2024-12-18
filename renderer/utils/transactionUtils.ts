import type { TransactionStatus } from "@ironfish/sdk";

import { TRPCRouterOutputs } from "@/providers/TRPCProvider";

export const isTransactionStatusTerminal = (status: TransactionStatus) => {
  return status === "confirmed" || status === "expired";
};

export const refetchTransactionUntilTerminal = (
  query: TRPCRouterOutputs["getTransaction"] | undefined,
) => {
  if (!query) {
    return 5000;
  }
  const txStatus = query.transaction.status;
  const isTerminalStatus = isTransactionStatusTerminal(txStatus);

  return !isTerminalStatus ? 5000 : false;
};
