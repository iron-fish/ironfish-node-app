import { Box, Flex, Input } from "@chakra-ui/react";
import { useState } from "react";

import { trpcReact } from "@/providers/TRPCProvider";
import { FormField } from "@/ui/Forms/FormField/FormField";
import { PillButton } from "@/ui/PillButton/PillButton";

import { CopyField } from "../Components/CopyField";
import { SigningRole } from "../SigningFlow";

export function CreateSigningCommitment({
  txHash,
  onSubmit,
  role,
  identities,
}: {
  identities: string[];
  role: SigningRole;
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

  const [otherSigningCommitments, setOtherSigningCommitments] = useState<
    string[]
  >(identities.slice(1).map(() => ""));

  if (isIdle) {
    createSigningCommitment({ txHash, identities });
  } else if (isSuccess) {
    return (
      <Flex direction={"column"} gap={6}>
        <CopyField label={"My Signing Commitment"} value={signingCommitment} />
        {role === "coordinator" && (
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
        )}
        {role === "participant" && (
          <PillButton mt={8} height="60px" px={8} onClick={() => onSubmit([])}>
            Next
          </PillButton>
        )}
      </Flex>
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
