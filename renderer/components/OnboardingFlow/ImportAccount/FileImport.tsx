import { Box, Text, VStack, chakra } from "@chakra-ui/react";
import { useRef, useState } from "react";

import { COLORS } from "@/ui/colors";
import { PillButton } from "@/ui/PillButton/PillButton";

type Props = {
  handleImport: (args: { account: string }) => void;
  isLoading: boolean;
  error?: string | null;
};

export function FileImport({ handleImport, isLoading, error }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Box>
      <VStack alignItems="stretch" gap={4}>
        <Text>Select your JSON or Bech32 file to import your account.</Text>
        <chakra.input
          h="1px"
          w="1px"
          overflow="hidden"
          position="absolute"
          opacity={0}
          ref={fileInputRef}
          type="file"
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (!file) {
              setFile(null);
              return;
            }

            setFile(file);
          }}
        />
        <Text color={COLORS.GRAY_MEDIUM}>
          Selected file: {file?.name || "—"}
        </Text>
        {error && <Text color={COLORS.RED}>{error}</Text>}
      </VStack>
      <PillButton
        mt={8}
        height="60px"
        px={8}
        onClick={() => {
          fileInputRef.current?.click();
        }}
        variant="inverted"
        borderWidth="1.5px"
      >
        Browse
      </PillButton>
      <PillButton
        mt={4}
        height="60px"
        px={8}
        isDisabled={isLoading || !file}
        onClick={async () => {
          const fileContent = await file?.text();
          if (!fileContent) return;
          handleImport({
            account: fileContent,
          });
        }}
      >
        Continue
      </PillButton>
    </Box>
  );
}
