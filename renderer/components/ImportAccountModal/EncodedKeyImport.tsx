import { Box, HStack } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { defineMessages, useIntl } from "react-intl";

import { TextareaInput } from "@/ui/Forms/TextareaInput/TextareaInput";
import { PillButton } from "@/ui/PillButton/PillButton";

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
  const [encodedKey, setEncodedKey] = useState("");
  const { formatMessage } = useIntl();

  const commitImport = useCallback(() => {
    onImport({
      account: encodedKey,
    });
  }, [encodedKey, onImport]);

  const isDisabled = isLoading || !encodedKey;

  return (
    <Box>
      <TextareaInput
        label={formatMessage(messages.enterEncodedKey)}
        value={encodedKey}
        error={error}
        onChange={(e) => {
          setEncodedKey(e.target.value);
        }}
      />
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
