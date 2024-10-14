import { Box } from "@chakra-ui/react";

import { trpcReact } from "@/providers/TRPCProvider";
import { PillButton } from "@/ui/PillButton/PillButton";

import { CopyField } from "../Components/CopyField";

export function CreateSigningPackage({
  selectedAccount,
  commitments,
  unsignedTransaction,
  onSubmit,
}: {
  selectedAccount: string;
  commitments: string[];
  unsignedTransaction: string;
  onSubmit: (signingPackage: string) => void;
}) {
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
    createSigningPackage({
      commitments,
      unsignedTransaction,
      account: selectedAccount,
    });
  } else if (isSuccess) {
    return (
      <Box>
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
        <h1>Creating Signing Package...</h1>
      </div>
    );
  }
}
