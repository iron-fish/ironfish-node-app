import { Box, Heading, Text } from "@chakra-ui/react";
import Link from "next/link";

import { MnemonicPhrase } from "@/ui/Forms/MnemonicPhrase/MnemonicPhrase";
import { TextInput } from "@/ui/Forms/TextInput/TextInput";

const TEST_PHRASE =
  "vapor domain left fuel fix enrich tool must virus region acquire sell elder warm space mad cinnamon disorder mother civil travel dream jump few".split(
    " ",
  );

export function ImportAccount() {
  return (
    <Box>
      <Link href="/onboarding">Back</Link>
      <Heading mt={24} mb={8}>
        Import Account
      </Heading>
      <TextInput label="Account Name" value="DO THIS" isReadOnly />
      <Heading mt={24} mb={8}>
        Recovery Phrase
      </Heading>
      <Text>
        Please enter your recovery phrase. This is the 24 word phrase you were
        given when you created your account.
      </Text>
      <MnemonicPhrase readOnly phrase={TEST_PHRASE} />
    </Box>
  );
}
