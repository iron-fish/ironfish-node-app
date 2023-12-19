import { Box, HStack, Text } from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";
import { defineMessages, useIntl } from "react-intl";

import {
  EMPTY_PHRASE_ARRAY,
  MnemonicPhrase,
} from "@/ui/Forms/MnemonicPhrase/MnemonicPhrase";
import { TextInput } from "@/ui/Forms/TextInput/TextInput";
import { PillButton } from "@/ui/PillButton/PillButton";
import { validateMnemonic } from "@/utils/mnemonic";

const messages = defineMessages({
  accountNameLabel: {
    defaultMessage: "Account Name",
  },
  accountNameError: {
    defaultMessage: "Please enter a name for this account",
  },
  mnemonicPhraseLabel: {
    defaultMessage:
      "Please enter your mnemonic phrase. If you've copied the full phrase to your clipboard, you can paste it in any input and it will automatically be split into the correct number of words.",
  },
  cancelButton: {
    defaultMessage: "Cancel",
  },
  continueButton: {
    defaultMessage: "Continue",
  },
});

type Props = {
  onImport: (args: { name?: string; account: string }) => void;
  onCancel: () => void;
  isLoading: boolean;
  error?: string | null;
};

export function MnemonicImport({
  onImport,
  onCancel,
  isLoading,
  error,
}: Props) {
  const [accountName, setAccountName] = useState("");
  const [isAccountNameDirty, setIsAccountNameDirty] = useState(false);
  const [phraseValues, setPhraseValues] =
    useState<Array<string>>(EMPTY_PHRASE_ARRAY);

  const { formatMessage } = useIntl();

  const errorMessage = useMemo(() => {
    return validateMnemonic(phraseValues);
  }, [phraseValues]);

  const hasValidName = accountName.length > 0;
  const hasNameError = isAccountNameDirty && !hasValidName;

  const commitImport = useCallback(() => {
    if (!hasValidName) {
      setIsAccountNameDirty(true);
      return;
    }

    onImport({
      name: accountName,
      account: phraseValues.join(" "),
    });
  }, [accountName, onImport, hasValidName, phraseValues]);

  const isDisabled = isLoading || !!errorMessage || hasNameError;

  return (
    <Box>
      <TextInput
        label={formatMessage(messages.accountNameLabel)}
        value={accountName}
        error={
          isAccountNameDirty && !hasValidName
            ? formatMessage(messages.accountNameError)
            : null
        }
        onChange={(e) => {
          setAccountName(e.target.value);
        }}
        onBlur={() => {
          setIsAccountNameDirty(true);
        }}
      />
      <Text mt={8} mb={4}>
        {formatMessage(messages.mnemonicPhraseLabel)}
      </Text>
      <MnemonicPhrase
        defaultVisible
        phrase={phraseValues}
        error={errorMessage || error}
        onChange={(value) => {
          setPhraseValues(value);
        }}
        mb={8}
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
          {formatMessage(messages.cancelButton)}
        </PillButton>
        <PillButton
          height="60px"
          px={8}
          isDisabled={isDisabled}
          onClick={commitImport}
        >
          {formatMessage(messages.continueButton)}
        </PillButton>
      </HStack>
    </Box>
  );
}
