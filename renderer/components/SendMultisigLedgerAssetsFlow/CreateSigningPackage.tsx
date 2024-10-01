import { Box } from "@chakra-ui/react";
import { useState } from "react";

import { trpcReact } from "@/providers/TRPCProvider";
import { TextareaInput } from "@/ui/Forms/TextareaInput/TextareaInput";
import { PillButton } from "@/ui/PillButton/PillButton";

import { CopyField } from "./CopyField";

export function CreateSigningPackage({ commitments, unsignedTransaction, onSubmit }: { commitments: string[], unsignedTransaction: string, onSubmit: (signingPackage: string) => void } ) {
    const {
        mutate: createSigningPackage,
        data,
        isIdle,
        isLoading,
        isError,
        isSuccess,
        error,
        reset,
    } = trpcReact.createSigningPackage.useMutation();

    if (isIdle) {
      createSigningPackage({ commitments, unsignedTransaction });
    } else if (isSuccess) {
      return <div>
        <h1>Send the signing package to the participants</h1>
        <CopyField label={"Signing Package"} value={data.signingPackage} />
        <PillButton
            mt={8}
            height="60px"
            px={8}
            onClick={() => {
              onSubmit(data.signingPackage);
            }}
        >
            Next
        </PillButton>
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
      <h1>Creating Signing Package...</h1>
    </div>
  }
}


export function EnterSigningPackage( {onSubmit }: { onSubmit: (signingPackage: string) => void } ) {
  const [signingPackage, setSigningPackage] = useState("");
  
  return (
      <Box>
          <TextareaInput
              label="Enter Signing Package from Coordinator"
              value={signingPackage}
              onChange={(e) => { setSigningPackage(e.target.value) }}
          />
          <PillButton
              mt={8}
              height="60px"
              px={8}
              onClick={() => {
                  onSubmit(signingPackage);
              }}
          >
              Next
          </PillButton>
      </Box>
  );
}
