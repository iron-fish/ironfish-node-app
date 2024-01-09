import { Box, Checkbox, Heading, Text } from "@chakra-ui/react";
import { useState } from "react";
import { defineMessages, useIntl } from "react-intl";

import { BackButton } from "@/components/BackButton/BackButton";
import { COLORS } from "@/ui/colors";
import {
  MnemonicPhrase,
  splitMnemonicPhrase,
} from "@/ui/Forms/MnemonicPhrase/MnemonicPhrase";
import { TextInput } from "@/ui/Forms/TextInput/TextInput";
import { PillButton } from "@/ui/PillButton/PillButton";

const messages = defineMessages({
  createAccount: {
    defaultMessage: "Create Account",
  },
  internalAccountName: {
    defaultMessage: "Internal Account Name",
  },
  accountNameLabel: {
    defaultMessage: "Account Name",
  },
  accountNameError: {
    defaultMessage: "Please enter a name for this account",
  },
  recoveryPhrase: {
    defaultMessage: "Recovery Phrase",
  },
  recoveryPhraseDescription: {
    defaultMessage:
      "Please keep this phrase stored somewhere safe. We will ask you to re-enter this.",
  },
  savedRecoveryPhrase: {
    defaultMessage: "I saved my recovery phrase",
  },
  nextButton: {
    defaultMessage: "Next",
  },
  accountNameDescription: {
    defaultMessage:
      "This name is how we will refer to your account internally. It is not visible to anyone else.",
  },
});

export function CreateAccountStep({
  accountName,
  mnemonicPhrase,
  onNameChange,
  onNextStep,
}: {
  accountName: string;
  mnemonicPhrase: string;
  onNameChange: (name: string) => void;
  onNextStep: () => void;
}) {
  const [isSavedChecked, setIsSavedChecked] = useState(false);
  const hasValidName = accountName.length > 0;
  const { formatMessage } = useIntl();

  return (
    <Box>
      <BackButton />
      <Heading mt={4} mb={8}>
        {formatMessage(messages.createAccount)}
      </Heading>
      <Text fontSize="2xl" mb={1}>
        {formatMessage(messages.internalAccountName)}
      </Text>
      <Text color={COLORS.GRAY_MEDIUM} mb={4}>
        {formatMessage(messages.accountNameDescription)}
      </Text>
      <TextInput
        label={formatMessage(messages.accountNameLabel)}
        value={accountName}
        error={
          hasValidName ? undefined : formatMessage(messages.accountNameError)
        }
        onChange={(e) => {
          onNameChange(e.target.value);
        }}
      />
      <Text fontSize="2xl" mt={8} mb={1}>
        {formatMessage(messages.recoveryPhrase)}
      </Text>
      <Text color={COLORS.GRAY_MEDIUM} mb={4}>
        {formatMessage(messages.recoveryPhraseDescription)}
      </Text>
      <MnemonicPhrase readOnly phrase={splitMnemonicPhrase(mnemonicPhrase)} />
      <Checkbox
        mt={4}
        mb={8}
        checked={isSavedChecked}
        onChange={(e) => {
          setIsSavedChecked(e.target.checked);
        }}
      >
        {formatMessage(messages.savedRecoveryPhrase)}
      </Checkbox>
      <PillButton
        isDisabled={!isSavedChecked || !hasValidName}
        onClick={onNextStep}
      >
        {formatMessage(messages.nextButton)}
      </PillButton>
    </Box>
  );
}
