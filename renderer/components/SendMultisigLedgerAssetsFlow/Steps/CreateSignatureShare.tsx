import { Box, Flex, Input } from "@chakra-ui/react";
import { useState } from "react";

import { trpcReact } from "@/providers/TRPCProvider";
import { FormField } from "@/ui/Forms/FormField/FormField";
import { PillButton } from "@/ui/PillButton/PillButton";

import { CopyField } from "../Components/CopyField";

export function CreateSignatureShare({
  signingPackage,
  unsignedTransaction,
  onSubmit,
  identities,
}: {
  identities: string[];
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

  const [otherSignatureShares, setOtherSignatureShares] = useState<string[]>(
    identities.slice(1).map(() => ""),
  );

  if (isIdle) {
    createSignatureShare({
      signingPackage,
      unsignedTransaction,
      identity: identities[0],
    });
  } else if (isSuccess) {
    return (
      <Box>
        <CopyField label={"My Signature Share"} value={signatureShare} />
        <Flex direction={"column"} gap={5} mt={5}>
          {otherSignatureShares.map((sigShare, index) => {
            return (
              <FormField
                label={"Signature Share"}
                flexGrow={1}
                key={index}
                triggerProps={{
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                }}
              >
                <Input
                  type="text"
                  variant="unstyled"
                  value={sigShare}
                  onChange={(e) => {
                    const newItems = [...otherSignatureShares];
                    newItems[index] = e.target.value;
                    setOtherSignatureShares(newItems);
                  }}
                />
              </FormField>
            );
          })}
        </Flex>
        <PillButton
          mt={8}
          height="60px"
          px={8}
          onClick={() => {
            onSubmit([signatureShare, ...otherSignatureShares]);
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
        <h1>Creating Signature Share...</h1>
      </div>
    );
  }
}
