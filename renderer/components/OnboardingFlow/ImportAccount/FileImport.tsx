import { Box, Text, chakra } from "@chakra-ui/react";
import { useRef, useState } from "react";

import { PillButton } from "@/ui/PillButton/PillButton";

type Props = {
  handleImport: (args: { account: string }) => void;
  isLoading: boolean;
  error?: string | null;
};

export function FileImport({ handleImport, isLoading, error }: Props) {
  const [filePath, setFilePath] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  console.log(error);

  return (
    <Box>
      <Text mt={8} mb={4}>
        Select your JSON or Bech32 file to import your account.
      </Text>
      <chakra.input
        ref={fileInputRef}
        type="file"
        onChange={(e) => setFilePath(e.target.value)}
      />
      <PillButton
        mt={8}
        height="60px"
        px={8}
        onClick={() => {
          fileInputRef.current?.click();
        }}
      >
        Browse
      </PillButton>
      <PillButton
        mt={8}
        height="60px"
        px={8}
        isDisabled={isLoading || !filePath}
        onClick={() => {
          handleImport({
            account: filePath,
          });
        }}
      >
        Continue
      </PillButton>
    </Box>
  );
}
