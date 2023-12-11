import { Box, Text, VStack, HStack, chakra } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { FormattedMessage } from "react-intl";

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
        <Text>
          <FormattedMessage defaultMessage="Select your JSON or Bech32 file to import your account." />
        </Text>
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
        <HStack alignItems="center" gap={3}>
          <PillButton
            height="40px"
            px={8}
            onClick={() => {
              fileInputRef.current?.click();
            }}
            variant="inverted"
            borderWidth="1.5px"
          >
            <FormattedMessage defaultMessage="Browse" />
          </PillButton>
          <VStack>
            <Text color={COLORS.GRAY_MEDIUM}>
              <FormattedMessage
                defaultMessage="Selected file: {fileName}"
                values={{ fileName: file?.name || "—" }}
              />
            </Text>
          </VStack>
        </HStack>
        {error && <Text color={COLORS.RED}>{error}</Text>}
      </VStack>
      <HStack justifyContent="flex-end">
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
          <FormattedMessage defaultMessage="Continue" />
        </PillButton>
      </HStack>
    </Box>
  );
}
