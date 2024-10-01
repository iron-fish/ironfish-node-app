import { Box } from "@chakra-ui/react";
import { useState } from "react";

import { trpcReact } from "@/providers/TRPCProvider";
import { TextareaInput } from "@/ui/Forms/TextareaInput/TextareaInput";
import { PillButton } from "@/ui/PillButton/PillButton";

import { CopyField } from "./CopyField";

type SigningRole = "participant" | "coordinator"

export function CreateSigningCommitment({ txHash, onSubmit, role }: { role: SigningRole, txHash: string, onSubmit: (commitments: string[]) => void } ) {
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

    const [signingCommitments, setSigningCommitments] = useState("")

    if (isIdle) {
        createSigningCommitment({ txHash });
    } else if (isSuccess) {
        
    return <div>
      <h1>Send the signing commitment to the coordinator</h1>
      <CopyField label={"Signing Commitment"} value={signingCommitment} />
      {role === "coordinator" && (
        <Box>
          <TextareaInput
              label="Enter Signing Commitments from Participant Separated by Commas"
              value={signingCommitments}
              onChange={(e) => { setSigningCommitments(e.target.value) }}
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
      )}
      {role === "participant" && (
        <PillButton
            mt={8}
            height="60px"
            px={8}
            onClick={() => onSubmit([])}
        >
            Next
        </PillButton>
      )}
    </div>
  } else if (isError) {
    return <div>
      <h1>Error</h1>
      <p>{error.message}</p>
      <PillButton
          mt={8}
          height="60px"
          px={8}
          onClick={reset}
      >
          Retry
      </PillButton>
    </div>
  } else if (isLoading) {
    return <div>
      <h1>Creating Signing Commitment...</h1>
    </div>
  }

}
