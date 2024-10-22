import { Box, Flex } from "@chakra-ui/react";
import { useState } from "react";

import { trpcReact } from "@/providers/TRPCProvider";
import { PillButton } from "@/ui/PillButton/PillButton";
import { CreateAccount } from "@/ui/SVGs/CreateAccount";

import { CopyField } from "../Components/CopyField";
import { RemovableField } from "../Components/RemovableField";

export function CollectIdentities({
  onSubmit,
}: {
  onSubmit: (identities: string[]) => void;
}) {
  const {
    mutate: getLedgerIdentity,
    data: myIdentity,
    isIdle,
    isLoading,
    isError,
    isSuccess,
    error,
    reset,
  } = trpcReact.getLedgerIdentity.useMutation();

  const [otherIdentities, setOtherIdentities] = useState<string[]>([]);

  if (isIdle) {
    getLedgerIdentity();
  } else if (isSuccess) {
    return (
      <Box>
        <Flex direction={"column"} gap={5}>
          <CopyField label={"My Identity"} value={myIdentity} />
          {otherIdentities.map((identity, index) => {
            return (
              <RemovableField
                onRemove={() => {
                  const newItems = [...otherIdentities];
                  newItems.splice(index, 1);
                  setOtherIdentities(newItems);
                }}
                value={identity}
                onChange={(newValue) => {
                  const newItems = [...otherIdentities];
                  newItems[index] = newValue;
                  setOtherIdentities(newItems);
                }}
                key={index}
                label={"Participant Identity"}
              />
            );
          })}
        </Flex>
        <PillButton
          size="sm"
          mt={8}
          variant="inverted"
          onClick={() => {
            setOtherIdentities([...otherIdentities, ""]);
          }}
        >
          <CreateAccount />
          {"Add Participant"}
        </PillButton>
        <PillButton
          mt={8}
          height="60px"
          px={8}
          onClick={() => {
            // Trim whitespace from all identities
            const allIdentities = otherIdentities.reduce(
              (acc, identity) => {
                if (identity) {
                  acc.push(identity.trim());
                }
                return acc;
              },
              [myIdentity],
            );
            onSubmit(allIdentities);
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
        <h1>Getting Identity from Ledger...</h1>
      </div>
    );
  }
}
