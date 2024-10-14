import { Box } from "@chakra-ui/react";

import { trpcReact } from "@/providers/TRPCProvider";
import { PillButton } from "@/ui/PillButton/PillButton";

export function ReviewTransaction({
  unsignedTransaction,
  onSubmit,
}: {
  unsignedTransaction: string;
  onSubmit: (hash: string) => void;
}) {
  const {
    mutate: reviewTransaction,
    data: txHash,
    isIdle,
    isLoading,
    isError,
    isSuccess,
    error,
    reset,
  } = trpcReact.reviewTransaction.useMutation();

  if (isIdle) {
    reviewTransaction({ unsignedTransaction });
  } else if (isSuccess) {
    onSubmit(txHash);
  } else if (isError) {
    return (
      <Box>
        {`Error: ${error.message}`}
        <PillButton mt={8} height="60px" px={8} onClick={reset}>
          Retry
        </PillButton>
      </Box>
    );
  } else if (isLoading) {
    return (
      <div>
        <h1>Review and approve the transaction on your Ledger...</h1>
      </div>
    );
  }
}
