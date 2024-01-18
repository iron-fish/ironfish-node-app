import { Box, Heading, Text } from "@chakra-ui/react";
import { useState, useMemo } from "react";
import { defineMessages, useIntl } from "react-intl";

import { BackButton } from "@/components/BackButton/BackButton";
import { COLORS } from "@/ui/colors";
import {
  EMPTY_PHRASE_ARRAY,
  MnemonicPhrase,
} from "@/ui/Forms/MnemonicPhrase/MnemonicPhrase";
import { PillButton } from "@/ui/PillButton/PillButton";
import { validateMnemonic } from "@/utils/mnemonic";

const messages = defineMessages({
  createAccount: {
    defaultMessage: "Create Account",
  },
  confirmRecoveryPhrase: {
    defaultMessage: "Confirm Your Recovery Phrase",
  },
  recoveryPhraseDescription: {
    defaultMessage: "Please keep this phrase stored somewhere safe.",
  },
  continueButton: {
    defaultMessage: "Continue",
  },
});

export function ConfirmAccountStep({
  mnemonicPhrase,
  onNextStep,
  onBack,
  isLoading,
}: {
  accountName: string;
  mnemonicPhrase: string;
  onNextStep: () => void;
  onBack: () => void;
  isLoading?: boolean;
}) {
  const { formatMessage } = useIntl();
  const [confirmValues, setConfirmValues] =
    useState<Array<string>>(EMPTY_PHRASE_ARRAY);

  const errorMessage = useMemo(() => {
    return validateMnemonic(confirmValues);
  }, [confirmValues]);

  const isValid = mnemonicPhrase === confirmValues.join(" ");

  return (
    <Box pointerEvents={isLoading ? "none" : undefined}>
      <BackButton onClick={onBack} />
      <Heading mt={4} mb={8}>
        {formatMessage(messages.createAccount)}
      </Heading>

      <Text fontSize="2xl" mb={1}>
        {formatMessage(messages.confirmRecoveryPhrase)}
      </Text>
      <Text color={COLORS.GRAY_MEDIUM} mb={4}>
        {formatMessage(messages.recoveryPhraseDescription)}
      </Text>
      <MnemonicPhrase
        defaultVisible
        phrase={confirmValues}
        error={errorMessage}
        onChange={(value) => {
          setConfirmValues(value);
        }}
        mb={8}
      />
      <PillButton isDisabled={isLoading || !isValid} onClick={onNextStep}>
        {formatMessage(messages.continueButton)}
      </PillButton>
    </Box>
  );
}
