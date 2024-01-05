import {
  Box,
  Heading,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Text,
} from "@chakra-ui/react";
import { useRouter } from "next/router";

import { BackButton } from "@/components/BackButton/BackButton";
import { trpcReact } from "@/providers/TRPCProvider";

import { EncodedKeyImport } from "./EncodedKeyImport";
import { FileImport } from "./FileImport";
import { MnemonicImport } from "./MnemonicImport";

export function ImportAccount() {
  const router = useRouter();

  const {
    mutate: importAccount,
    isLoading,
    error,
  } = trpcReact.importAccount.useMutation();

  return (
    <Box>
      <BackButton />
      <Heading mt={4} mb={8}>
        Import Account
      </Heading>

      <Text fontSize="2xl" mb={2}>
        Import With
      </Text>

      <Tabs>
        <TabList mb={8}>
          <Tab py={2} px={4} mr={4}>
            Mnemonic Phrase
          </Tab>
          <Tab py={2} px={4} mr={4}>
            Encoded Key
          </Tab>
          <Tab py={2} px={4} mr={4}>
            File
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
