import { Box, HStack, Text } from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";
import { FormattedMessage } from "react-intl";

import {
  EMPTY_PHRASE_ARRAY,
  MnemonicPhrase,
} from "@/ui/Forms/MnemonicPhrase/MnemonicPhrase";
import { TextInput } from "@/ui/Forms/TextInput/TextInput";
import { PillButton } from "@/ui/PillButton/PillButton";
import { validateMnemonic } from "@/utils/mnemonic";

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
        label={<FormattedMessage defaultMessage="Account Name" />}
        value={accountName}
        error={
          isAccountNameDirty && !hasValidName ? (
            <FormattedMessage defaultMessage="Please enter a name for this account" />
          ) : null
        }
        onChange={(e) => {
          setAccountName(e.target.value);
        }}
        onBlur={() => {
          setIsAccountNameDirty(true);
        }}
      />
      <Text mt={8} mb={4}>
        <FormattedMessage defaultMessage="Please enter your mnemonic phrase. If you've copied the full phrase to your clipboard, you can paste it in any input and it will automatically be split into the correct number of words." />
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
          <FormattedMessage defaultMessage="Cancel" />
        </PillButton>
        <PillButton
          height="60px"
          px={8}
          isDisabled={isDisabled}
          onClick={commitImport}
        >
          <FormattedMessage defaultMessage="Continue" />
        </PillButton>
      </HStack>
    </Box>
  );
}
