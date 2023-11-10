import {
  Box,
  Heading,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";

import { trpcReact } from "@/providers/TRPCProvider";

import { EncodedKeyImport } from "./EncodedKeyImport";
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
      <Link href="/onboarding">Back</Link>
      <Heading mt={24} mb={8}>
        Import Account
      </Heading>

      <Heading fontSize="2xl" mb={4}>
        Import Using
      </Heading>

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
                      router.push("/onboarding/snapshot-download");
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
              handleImport={({ name, account }) => {
                importAccount(
                  {
                    name,
                    account,
                  },
                  {
                    onSuccess: () => {
                      router.push("/onboarding/snapshot-download");
                    },
                  },
                );
              }}
            />
          </TabPanel>
          <TabPanel p={0}>
            <p>Todo: File import</p>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
