import { Box } from "@chakra-ui/react";
import { useState } from "react";

import { trpcReact } from "@/providers/TRPCProvider";
import { TextareaInput } from "@/ui/Forms/TextareaInput/TextareaInput";
import { PillButton } from "@/ui/PillButton/PillButton";

export function CreateSignatureShare({
  signingPackage,
  unsignedTransaction,
  onSubmit,
}: {
  signingPackage: string;
  unsignedTransaction: string;
  onSubmit: (signatureShares: string[]) => void;
}) {
  const {
    mutate: createSignatureShare,
    data: signatureShare,
    isIdle,
    isLoading,
    isError,
    isSuccess,
    error,
    reset,
  } = trpcReact.createSignatureShare.useMutation();

  const [signatureShares, setSignatureShares] = useState("");

  if (isIdle) {
    createSignatureShare({ signingPackage, unsignedTransaction });
  } else if (isSuccess) {
    return (
      <Box>
        <TextareaInput
          label="Enter Signature Shares from Participant Separated by Commas"
          value={signatureShares}
          onChange={(e) => {
            setSignatureShares(e.target.value);
          }}
        />
        <PillButton
          mt={8}
          height="60px"
          px={8}
          onClick={() => {
            const shares = signatureShares.split(",");
            shares.push(signatureShare);
            onSubmit(shares);
          }}
        >
          Next
        </PillButton>
      </Box>
    );
  } else if (isError) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
        <PillButton mt={8} height="60px" px={8} onClick={reset}>
          Retry
        </PillButton>
      </div>
    );
  } else if (isLoading) {
    return (
      <div>
        <h1>Creating Signature Share...</h1>
      </div>
    );
  }
}
