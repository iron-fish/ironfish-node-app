import { Box } from "@chakra-ui/react";
import router from "next/router";

import { trpcReact } from "@/providers/TRPCProvider";
import { PillButton } from "@/ui/PillButton/PillButton";

export function AggregateSignatureShares({
  signingPackage,
  signatureShares,
  selectedAccount,
}: {
  selectedAccount: string;
  signingPackage: string;
  signatureShares: string[];
}) {
  const {
    mutate: aggregateSignatureShares,
    data,
    isIdle,
    isLoading,
    isError,
    isSuccess,
    error,
    reset,
  } = trpcReact.aggregateSignatureShares.useMutation();

  if (isIdle) {
    return (
      <PillButton
        mt={8}
        height="60px"
        px={8}
        onClick={() => {
          aggregateSignatureShares({
            signingPackage,
            signatureShares,
            account: selectedAccount,
            broadcast: true,
          });
        }}
      >
        Submit Transaction
      </PillButton>
    );
  } else if (isSuccess) {
    return (
      <Box>
        Transaction submitted successfully!
        <PillButton
          mt={8}
          height="60px"
          px={8}
          onClick={() => {
            router.push(
              `/accounts/${selectedAccount}/transaction/${data.txHash}`,
            );
          }}
        >
          {"View Transaction"}
        </PillButton>
      </Box>
    );
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
        <h1>Sending Transaction...</h1>
      </div>
    );
  }
}
