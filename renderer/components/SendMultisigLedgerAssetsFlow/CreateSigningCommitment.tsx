import { Box } from "@chakra-ui/react";
import { useState } from "react";

import { trpcReact } from "@/providers/TRPCProvider";
import { TextareaInput } from "@/ui/Forms/TextareaInput/TextareaInput";
import { PillButton } from "@/ui/PillButton/PillButton";

import { CopyField } from "./CopyField";

export function CreateSigningCommitment({
  identity,
  unsignedTransaction,
  txHash,
  onSubmit,
}: {
  identity: string;
  unsignedTransaction: string;
  txHash: string;
  onSubmit: (commitments: string[]) => void;
}) {
  const {
    mutate: createSigningCommitment,
    data: signingCommitment,
    isIdle,
    isLoading,
    isError,
    isSuccess,
    error,
    reset,
  } = trpcReact.createSigningCommitment.useMutation();

  const [signingCommitments, setSigningCommitments] = useState("");

  if (isIdle) {
    createSigningCommitment({ txHash });
  } else if (isSuccess) {
    return (
      <div>
        <h1>Send the signing commitment to the coordinator</h1>
        <CopyField label={"Signing Commitment"} value={signingCommitment} />
        <CopyField label={"Identity"} value={identity} />
        <CopyField label={"Unsigned Transaction"} value={unsignedTransaction} />
        <Box>
          <TextareaInput
            label="Enter Signing Commitments from Participant Separated by Commas"
            value={signingCommitments}
            onChange={(e) => {
              setSigningCommitments(e.target.value);
            }}
          />
          <PillButton
            mt={8}
            height="60px"
            px={8}
            onClick={() => {
              const commitments = signingCommitments.split(",");
              commitments.push(signingCommitment);
              onSubmit(commitments);
            }}
          >
            Next
          </PillButton>
        </Box>
      </div>
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
        <h1>Creating Signing Commitment...</h1>
      </div>
    );
  }
}
