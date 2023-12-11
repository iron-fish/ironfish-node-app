import { Box, Checkbox, Heading, Text } from "@chakra-ui/react";
import { useState } from "react";

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
  onBack,
}: {
  accountName: string;
  mnemonicPhrase: string;
  onNameChange: (name: string) => void;
  onNextStep: () => void;
  onBack: () => void;
}) {
  const [isSavedChecked, setIsSavedChecked] = useState(false);
  const hasValidName = accountName.length > 0;

  return (
    <Box>
      <Text as="button" onClick={onBack}>
        Back
      </Text>
      <Heading mt={24} mb={4}>
        Create Account
      </Heading>
      <Heading fontSize="2xl" mb={4}>
        Internal Account Name
      </Heading>
      <Text mb={4}>
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
      <Heading fontSize="2xl" mt={8} mb={4}>
        Recovery Phrase
      </Heading>
      <Text mb={4}>
        Please keep this phrase stored somewhere safe. We will ask you to
        re-enter this.
      </Text>
      <MnemonicPhrase readOnly phrase={splitMnemonicPhrase(mnemonicPhrase)} />
      <Checkbox
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
