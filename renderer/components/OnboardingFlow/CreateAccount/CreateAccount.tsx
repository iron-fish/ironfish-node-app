import { Box, Heading, Text } from "@chakra-ui/react";
import Link from "next/link";
import { useEffect } from "react";

import { trpcReact } from "@/providers/TRPCProvider";
import { MnemonicPhrase } from "@/ui/Forms/MnemonicPhrase/MnemonicPhrase";
import { TextInput } from "@/ui/Forms/TextInput/TextInput";

function splitMnemonicPhrase(phrase: string) {
  return phrase.split(/\s+/).map((part) => part.trim());
}

export function CreateAccount() {
  const { data: accountsData, refetch: refetchGetAccounts } =
    trpcReact.getAccounts.useQuery();

  const accountName = accountsData?.[0]?.name;

  const { mutate: createAccount, isIdle: isCreateIdle } =
    trpcReact.createAccount.useMutation();

  const { data: exportData } = trpcReact.exportAccount.useQuery(
    {
      name: accountName ?? "",
      format: "Mnemonic",
    },
    {
      enabled: !!accountName,
    },
  );

  useEffect(() => {
    if (!isCreateIdle || accountsData === undefined) return;

    if (accountsData.length === 0) {
      createAccount(
        {
          name: "default",
        },
        {
          onSuccess: () => {
            refetchGetAccounts();
          },
        },
      );
    }
  }, [accountsData, createAccount, isCreateIdle, refetchGetAccounts]);

  const mnemonicPhrase = exportData?.account;

  if (!accountName || typeof mnemonicPhrase !== "string") {
    return null;
  }

  return (
    <Box>
      <Link href="/onboarding">Back</Link>
      <Heading mt={24} mb={8}>
        Create Account
      </Heading>
      <TextInput label="Account Name" value={accountName} />
      <Heading mt={8} mb={4}>
        Recovery Phrase
      </Heading>
      <Text mb={4}>
        Please keep this phrase stored somewhere safe. We will ask you to
        re-enter this.
      </Text>
      <MnemonicPhrase readOnly phrase={splitMnemonicPhrase(mnemonicPhrase)} />
    </Box>
  );
}
