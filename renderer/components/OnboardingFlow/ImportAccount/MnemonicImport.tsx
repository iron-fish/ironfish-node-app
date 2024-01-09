import { Box, Text } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { defineMessages, useIntl } from "react-intl";

import { COLORS } from "@/ui/colors";
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
  importAccountButton: {
    defaultMessage: "Import Account",
  },
});

type Props = {
  handleImport: (args: { name: string; account: string }) => void;
  isLoading: boolean;
  error?: string | null;
};

export function MnemonicImport({ handleImport, isLoading, error }: Props) {
  const { formatMessage } = useIntl();

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
      <Text
        mt={8}
        mb={4}
        color={COLORS.GRAY_MEDIUM}
        _dark={{ color: COLORS.DARK_MODE.GRAY_LIGHT }}
      >
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
        {formatMessage(messages.importAccountButton)}
      </PillButton>
    </Box>
  );
}
