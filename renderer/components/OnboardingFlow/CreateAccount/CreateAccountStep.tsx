import { Box, Checkbox, Heading, Text } from "@chakra-ui/react";
import { useState } from "react";

import { BackButton } from "@/components/BackButton/BackButton";
import { COLORS } from "@/ui/colors";
import {
  MnemonicPhrase,
  splitMnemonicPhrase,
} from "@/ui/Forms/MnemonicPhrase/MnemonicPhrase";
import { TextInput } from "@/ui/Forms/TextInput/TextInput";
import { PillButton } from "@/ui/PillButton/PillButton";

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

  return (
    <Box>
      <BackButton />
      <Heading mt={4} mb={8}>
        Create Account
      </Heading>
      <Text fontSize="2xl" mb={1}>
        Internal Account Name
      </Text>
      <Text color={COLORS.GRAY_MEDIUM} mb={4}>
        This name is how we will refer to your account internally. It is not
        visible to anyone else.
      </Text>
      <TextInput
        label="Account Name"
        value={accountName}
        error={
          hasValidName ? undefined : "Please enter a name for this account"
        }
        onChange={(e) => {
          onNameChange(e.target.value);
        }}
      />
      <Text fontSize="2xl" mt={8} mb={1}>
        Recovery Phrase
      </Text>
      <Text color={COLORS.GRAY_MEDIUM} mb={4}>
        Please keep this phrase stored somewhere safe. We will ask you to
        re-enter this.
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
        I saved my recovery phrase
      </Checkbox>
      <PillButton
        isDisabled={!isSavedChecked || !hasValidName}
        onClick={onNextStep}
      >
        Next
      </PillButton>
    </Box>
  );
}
