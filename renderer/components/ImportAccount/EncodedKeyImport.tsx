import { Box, HStack } from "@chakra-ui/react";
import { useCallback, useState } from "react";

import { TextareaInput } from "@/ui/Forms/TextareaInput/TextareaInput";
import { PillButton } from "@/ui/PillButton/PillButton";

type Props = {
  onImport: (args: { name?: string; account: string }) => void;
  isLoading: boolean;
  error?: string | null;
};

export function EncodedKeyImport({ onImport, isLoading, error }: Props) {
  const [encodedKey, setEncodedKey] = useState("");
  const commitImport = useCallback(() => {
    onImport({
      account: encodedKey,
    });
  }, [encodedKey, onImport]);

  const isDisabled = isLoading || !encodedKey;

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
      <HStack justifyContent="flex-end">
        <PillButton
          mt={8}
          height="60px"
          px={8}
          isDisabled={isDisabled}
          onClick={commitImport}
        >
          Continue
        </PillButton>
      </HStack>
    </Box>
  );
}
