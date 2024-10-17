import type { TransactionStatus } from "@ironfish/sdk";
import { useState, useEffect } from "react";

import { trpcReact } from "@/providers/TRPCProvider";

export function useTransactionPolling(
  accountName: string,
  transactionHash: string,
  initialStatus?: TransactionStatus,
) {
  const [status, setStatus] = useState<TransactionStatus | undefined>(
    initialStatus,
  );

  const { data: transactionData } = trpcReact.getTransaction.useQuery(
    { accountName, transactionHash },
    {
      enabled:
        !status ||
        status === "pending" ||
        status === "unconfirmed" ||
        status === "unknown",
      refetchInterval: 5000,
    },
  );

  useEffect(() => {
    if (transactionData && transactionData.transaction.status !== status) {
      setStatus(transactionData.transaction.status);
    }
  }, [transactionData, status]);

  return { status, transactionData };
}
