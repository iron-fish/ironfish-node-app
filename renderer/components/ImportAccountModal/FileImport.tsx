import { Box, Text, VStack, HStack, chakra, Switch } from "@chakra-ui/react";
import { useCallback, useRef, useState } from "react";
import { defineMessages, useIntl } from "react-intl";

import { COLORS } from "@/ui/colors";
import { TextInput } from "@/ui/Forms/TextInput/TextInput";
import { PillButton } from "@/ui/PillButton/PillButton";

import { CustomNameChip } from "../CustomNameChip/CustomNameChip";

type Props = {
  onImport: (args: { name?: string; account: string }) => void;
  onCancel: () => void;
  isLoading: boolean;
  error?: string | null;
};

const messages = defineMessages({
  selectFile: {
    defaultMessage: "Select your JSON or Bech32 file to import your account.",
  },
  selectedFile: {
    defaultMessage: "Selected file: {fileName}",
  },
  browse: {
    defaultMessage: "Browse",
  },
  cancel: {
    defaultMessage: "Cancel",
  },
  continue: {
    defaultMessage: "Continue",
  },
  accountName: {
    defaultMessage: "Account Name",
  },
});

export function FileImport({ onImport, onCancel, isLoading, error }: Props) {
  const { formatMessage } = useIntl();
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isCustomNameEnabled, setIsCustomNameEnabled] = useState(false);
  const [customName, setCustomName] = useState("");

  const commitImport = useCallback(async () => {
    const fileContent = await file?.text();
    if (!fileContent) return;
    onImport({
      account: fileContent,
      name: isCustomNameEnabled ? customName : undefined,
    });
  }, [customName, file, isCustomNameEnabled, onImport]);

  const isDisabled = isLoading || !file;

  return (
    <Box>
      <VStack alignItems="stretch" gap={3} mb={6}>
        <HStack>
          <CustomNameChip />
          <Switch
            size="md"
            isChecked={isCustomNameEnabled}
            onChange={(e) => setIsCustomNameEnabled(e.target.checked)}
          />
        </HStack>
        {isCustomNameEnabled && (
          <TextInput
            label={formatMessage(messages.accountName)}
            value={customName}
            onChange={(e) => {
              setCustomName(e.target.value);
            }}
          />
        )}
      </VStack>
      <VStack alignItems="stretch" gap={4}>
        <Text>{formatMessage(messages.selectFile)}</Text>
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
            {formatMessage(messages.browse)}
          </PillButton>
          <VStack>
            <Text color={COLORS.GRAY_MEDIUM}>
              {formatMessage(messages.selectedFile, {
                fileName: file?.name || "—",
              })}
            </Text>
          </VStack>
        </HStack>
        {error && <Text color={COLORS.RED}>{error}</Text>}
      </VStack>
      <HStack justifyContent="flex-end" mt={8}>
        <PillButton
          isDisabled={isLoading}
          onClick={onCancel}
          variant="inverted"
          height="60px"
          px={8}
          border={0}
        >
          {formatMessage(messages.cancel)}
        </PillButton>
        <PillButton
          height="60px"
          px={8}
          isDisabled={isDisabled}
          onClick={commitImport}
        >
          {formatMessage(messages.continue)}
        </PillButton>
      </HStack>
    </Box>
  );
}
