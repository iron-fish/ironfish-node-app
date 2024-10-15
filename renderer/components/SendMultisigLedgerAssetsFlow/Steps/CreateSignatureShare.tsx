import { Box, Flex, Input } from "@chakra-ui/react";
import { useEffect, useState } from "react";

import { trpcReact } from "@/providers/TRPCProvider";
import { FormField } from "@/ui/Forms/FormField/FormField";
import { PillButton } from "@/ui/PillButton/PillButton";

import { CopyField } from "../Components/CopyField";

export function CreateSignatureShare({
  unsignedTransaction,
  commitments,
  selectedAccount,
  onSubmit,
  identities,
}: {
  identities: string[];
  commitments: string[];
  selectedAccount: string;
  unsignedTransaction: string;
  onSubmit: (signingPackage: string, signatureShares: string[]) => void;
}) {
  const createSigningPackage = trpcReact.createSigningPackage.useMutation();
  const createSignatureShare = trpcReact.createSignatureShare.useMutation();

  const [otherSignatureShares, setOtherSignatureShares] = useState<string[]>(
    identities.slice(1).map(() => ""),
  );

  const signatureShare = createSignatureShare.data;
  const signingPackage = createSigningPackage.data?.signingPackage;

  useEffect(() => {
    if (createSigningPackage.isIdle) {
      createSigningPackage.mutate({
        commitments,
        unsignedTransaction,
        account: selectedAccount,
      });
    }

    if (signingPackage && createSignatureShare.isIdle) {
      createSignatureShare.mutate({
        signingPackage,
        unsignedTransaction,
        identity: identities[0],
      });
    }
  }, [
    createSigningPackage,
    createSignatureShare,
    commitments,
    unsignedTransaction,
    selectedAccount,
    identities,
    signingPackage,
  ]);

  if (signingPackage && signatureShare) {
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
            onSubmit(signingPackage, [signatureShare, ...otherSignatureShares]);
          }}
        >
          Next
        </PillButton>
      </Box>
    );
  } else if (createSigningPackage.isError) {
    return (
      <Box>
        {`Error: ${createSigningPackage.error.message}`}
        <PillButton
          mt={8}
          height="60px"
          px={8}
          onClick={createSigningPackage.reset}
        >
          Retry
        </PillButton>
      </Box>
    );
  } else if (createSignatureShare.isError) {
    return (
      <Box>
        {`Error: ${createSignatureShare.error.message}`}
        <PillButton
          mt={8}
          height="60px"
          px={8}
          onClick={createSignatureShare.reset}
        >
          Retry
        </PillButton>
      </Box>
    );
  }

  return (
    <div>
      <h1>Creating Signature Share...</h1>
    </div>
  );
}
