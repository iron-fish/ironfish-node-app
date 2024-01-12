import { Box, HStack, Switch, VStack } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { defineMessages, useIntl } from "react-intl";

import { TextareaInput } from "@/ui/Forms/TextareaInput/TextareaInput";
import { TextInput } from "@/ui/Forms/TextInput/TextInput";
import { PillButton } from "@/ui/PillButton/PillButton";

import { CustomNameChip } from "../CustomNameChip/CustomNameChip";

const messages = defineMessages({
  cancel: {
    defaultMessage: "Cancel",
  },
  continue: {
    defaultMessage: "Continue",
  },
  enterEncodedKey: {
    defaultMessage: "Enter Encoded Key",
  },
  accountName: {
    defaultMessage: "Account Name",
  },
});

type Props = {
  onImport: (args: { name?: string; account: string }) => void;
  onCancel: () => void;
  isLoading: boolean;
  error?: string | null;
};

export function EncodedKeyImport({
  onImport,
  onCancel,
  isLoading,
  error,
}: Props) {
  const { formatMessage } = useIntl();
  const [encodedKey, setEncodedKey] = useState("");
  const [isCustomNameEnabled, setIsCustomNameEnabled] = useState(false);
  const [customName, setCustomName] = useState("");

  const commitImport = useCallback(() => {
    onImport({
      account: encodedKey,
      name: isCustomNameEnabled ? customName : undefined,
    });
  }, [customName, encodedKey, isCustomNameEnabled, onImport]);

  const isDisabled = isLoading || !encodedKey;

  return (
    <Box>
      <VStack alignItems="stretch" gap={3}>
        <HStack>
          <CustomNameChip />
          <Switch
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
        <TextareaInput
          label={formatMessage(messages.enterEncodedKey)}
          value={encodedKey}
          error={error}
          onChange={(e) => {
            setEncodedKey(e.target.value);
          }}
        />
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
