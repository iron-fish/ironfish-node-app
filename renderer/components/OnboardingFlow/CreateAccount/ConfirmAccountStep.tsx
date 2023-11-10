import { Box, Heading, Text } from "@chakra-ui/react";
import { useState, useMemo } from "react";

import {
  EMPTY_PHRASE_ARRAY,
  MnemonicPhrase,
} from "@/ui/Forms/MnemonicPhrase/MnemonicPhrase";
import { PillButton } from "@/ui/PillButton/PillButton";
import { validateMnemonic } from "@/utils/mnemonic";

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
  const [confirmValues, setConfirmValues] =
    useState<Array<string>>(EMPTY_PHRASE_ARRAY);

  const errorMessage = useMemo(() => {
    return validateMnemonic(confirmValues);
  }, [confirmValues]);

  const isValid = mnemonicPhrase === confirmValues.join(" ");

  return (
    <Box pointerEvents={isLoading ? "none" : undefined}>
      <Text as="button" onClick={onBack} disabled={isLoading}>
        Back
      </Text>
      <Heading mt={24} mb={8}>
        Create Account
      </Heading>

      <Heading mt={8} mb={4}>
        Confirm Your Recovery Phrase
      </Heading>
      <Text mb={4}>Please keep this phrase stored somewhere safe.</Text>
      <MnemonicPhrase
        defaultVisible
        phrase={confirmValues}
        error={errorMessage}
        onChange={(value) => {
          setConfirmValues(value);
        }}
      />
      <PillButton isDisabled={isLoading || !isValid} onClick={onNextStep}>
        Continue
      </PillButton>
    </Box>
  );
}
