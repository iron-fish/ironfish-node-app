import { Box, Text } from "@chakra-ui/react";
import { useMemo, useState } from "react";

import {
  EMPTY_PHRASE_ARRAY,
  MnemonicPhrase,
} from "@/ui/Forms/MnemonicPhrase/MnemonicPhrase";
import { TextInput } from "@/ui/Forms/TextInput/TextInput";
import { PillButton } from "@/ui/PillButton/PillButton";
import { validateMnemonic } from "@/utils/mnemonic";

type Props = {
  handleImport: (args: { name: string; account: string }) => void;
  isLoading: boolean;
  error?: string | null;
};

export function MnemonicImport({ handleImport, isLoading, error }: Props) {
  const [accountName, setAccountName] = useState("");
  const [isAccountNameDirty, setIsAccountNameDirty] = useState(false);
  const [phraseValues, setPhraseValues] =
    useState<Array<string>>(EMPTY_PHRASE_ARRAY);

  const errorMessage = useMemo(() => {
    return validateMnemonic(phraseValues);
  }, [phraseValues]);

  const hasValidName = accountName.length > 0;
  const hasNameError = isAccountNameDirty && !hasValidName;

  return (
    <Box>
      <TextInput
        label="Account Name"
        value={accountName}
        error={
          isAccountNameDirty && !hasValidName
            ? "Please enter a name for this account"
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
        Please enter your mnemonic phrase. If you&apos;ve copied the full phrase
        to your clipboard, you can paste it in any input and it will
        automatically be split into the correct number of words.
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
      <PillButton
        height="60px"
        px={8}
        isDisabled={isLoading || !!errorMessage || hasNameError}
        onClick={() => {
          if (!hasValidName) {
            setIsAccountNameDirty(true);
            return;
          }

          handleImport({
            name: accountName,
            account: phraseValues.join(" "),
          });
        }}
      >
        Continue
      </PillButton>
    </Box>
  );
}
