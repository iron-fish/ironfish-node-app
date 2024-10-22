import { Box, Flex, Input } from "@chakra-ui/react";
import { useState } from "react";

import { trpcReact } from "@/providers/TRPCProvider";
import { FormField } from "@/ui/Forms/FormField/FormField";
import { PillButton } from "@/ui/PillButton/PillButton";

import { CopyField } from "../Components/CopyField";

export function CreateSigningCommitment({
  unsignedTransaction,
  onSubmit,
  identities,
}: {
  identities: string[];
  unsignedTransaction: string;
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

  const [otherSigningCommitments, setOtherSigningCommitments] = useState<
    string[]
  >(identities.slice(1).map(() => ""));

  if (isIdle) {
    createSigningCommitment({ unsignedTransaction, identities });
  } else if (isSuccess) {
    return (
      <Flex direction={"column"} gap={6}>
        <CopyField label={"My Signing Commitment"} value={signingCommitment} />
        <Box>
          <Flex direction={"column"} gap={5}>
            {otherSigningCommitments.map((commitment, index) => {
              return (
                <FormField
                  label={"Other Signing Commitment"}
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
                    value={commitment}
                    onChange={(e) => {
                      const newItems = [...otherSigningCommitments];
                      newItems[index] = e.target.value;
                      setOtherSigningCommitments(newItems);
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
              onSubmit([...otherSigningCommitments, signingCommitment]);
            }}
          >
            Next
          </PillButton>
        </Box>
      </Flex>
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
        <h1>Creating Signing Commitment...</h1>
      </div>
    );
  }
}
