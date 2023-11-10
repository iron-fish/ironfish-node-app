import { Box } from "@chakra-ui/react";
import { useState } from "react";

import { TextInput } from "@/ui/Forms/TextInput/TextInput";
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
      <TextInput
        label="Enter Encoded Key"
        value={encodedKey}
        type="textarea"
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
