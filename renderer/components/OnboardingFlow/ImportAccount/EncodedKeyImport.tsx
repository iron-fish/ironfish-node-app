import { Box } from "@chakra-ui/react";
import { useState } from "react";

import { TextareaInput } from "@/ui/Forms/TextareaInput/TextareaInput";
import { PillButton } from "@/ui/PillButton/PillButton";

type Props = {
  handleImport: (args: { account: string }) => void;
  isLoading: boolean;
  error?: string | null;
};

export function EncodedKeyImport({ handleImport, isLoading, error }: Props) {
  const [encodedKey, setEncodedKey] = useState("");

  return (
    <Box>
      <TextareaInput
        label="Enter Encoded Key"
        value={encodedKey}
        error={error}
        onChange={(e) => {
          setEncodedKey(e.target.value);
        }}
      />
      <PillButton
        mt={8}
        height="60px"
        px={8}
        isDisabled={isLoading || !encodedKey}
        onClick={() => {
          handleImport({
            account: encodedKey,
          });
        }}
      >
        Continue
      </PillButton>
    </Box>
  );
}
