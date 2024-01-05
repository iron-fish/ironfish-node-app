import {
  Box,
  Heading,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { defineMessages, useIntl } from "react-intl";

import { BackButton } from "@/components/BackButton/BackButton";
import { trpcReact } from "@/providers/TRPCProvider";

import { EncodedKeyImport } from "./EncodedKeyImport";
import { FileImport } from "./FileImport";
import { MnemonicImport } from "./MnemonicImport";

const messages = defineMessages({
  importAccount: {
    defaultMessage: "Import Account",
  },
  importUsing: {
    defaultMessage: "Import Using",
  },
  mnemonicPhrase: {
    defaultMessage: "Mnemonic Phrase",
  },
  encodedKey: {
    defaultMessage: "Encoded Key",
  },
  file: {
    defaultMessage: "File",
  },
});

export function ImportAccount() {
  const router = useRouter();
  const { formatMessage } = useIntl();

  const {
    mutate: importAccount,
    isLoading,
    error,
  } = trpcReact.importAccount.useMutation();

  return (
    <Box>
      <BackButton />
      <Heading mt={16} mb={8}>
        {formatMessage(messages.importAccount)}
      </Heading>

      <Heading fontSize="2xl" mb={4}>
        {formatMessage(messages.importUsing)}
      </Heading>

      <Tabs>
        <TabList mb={8}>
          <Tab py={2} px={4} mr={4}>
            {formatMessage(messages.mnemonicPhrase)}
          </Tab>
          <Tab py={2} px={4} mr={4}>
            {formatMessage(messages.encodedKey)}
          </Tab>
          <Tab py={2} px={4} mr={4}>
            {formatMessage(messages.file)}
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={0}>
            <MnemonicImport
              isLoading={isLoading}
              error={error?.shape?.message}
              handleImport={({ name, account }) => {
                importAccount(
                  {
                    name,
                    account,
                  },
                  {
                    onSuccess: () => {
                      router.push(`/onboarding/telemetry`);
                    },
                  },
                );
              }}
            />
          </TabPanel>
          <TabPanel p={0}>
            <EncodedKeyImport
              isLoading={isLoading}
              error={error?.shape?.message}
              handleImport={({ account }) => {
                importAccount(
                  {
                    account,
                  },
                  {
                    onSuccess: () => {
                      router.push(`/onboarding/telemetry`);
                    },
                  },
                );
              }}
            />
          </TabPanel>
          <TabPanel p={0}>
            <FileImport
              isLoading={isLoading}
              error={error?.shape?.message}
              handleImport={({ account }) => {
                importAccount(
                  {
                    account,
                  },
                  {
                    onSuccess: () => {
                      router.push(`/onboarding/telemetry`);
                    },
                  },
                );
              }}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
