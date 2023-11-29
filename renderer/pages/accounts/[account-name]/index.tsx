import {
  Box,
  Heading,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  HStack,
} from "@chakra-ui/react";
import { useRouter } from "next/router";

import { AccountAssets } from "@/components/AccountAssets/AccountAssets";
import { CopyAddress } from "@/components/CopyAddress/CopyAddress";
import { NotesList } from "@/components/NotesList/NotesList";
import MainLayout from "@/layouts/MainLayout";
import { trpcReact } from "@/providers/TRPCProvider";
import { asQueryString } from "@/utils/parseRouteQuery";

function AccountOverviewContent({ accountName }: { accountName: string }) {
  const { data: accountData } = trpcReact.getAccount.useQuery({
    name: accountName,
  });

  const { data: transactionsData } = trpcReact.getTransactions.useQuery({
    accountName,
  });

  if (!accountData || !transactionsData) {
    // @todo: Error handling
    return null;
  }

  return (
    <MainLayout
      backLinkProps={{
        href: "/accounts",
        label: "Back to All Accounts",
      }}
    >
      <Box>
        <HStack mb={4} gap={4}>
          <Heading>{accountData.name}</Heading>
          <CopyAddress
            address={accountData.address}
            transform="translateY(0.4em)"
          />
        </HStack>
        <Tabs>
          <TabList mb={8}>
            <Tab py={2} px={4} mr={4}>
              Account Overview
            </Tab>
            <Tab py={2} px={4} mr={4}>
              Keys
            </Tab>
            <Tab py={2} px={4} mr={4}>
              Settings
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0}>
              <AccountAssets accountName={accountName} />
              <NotesList
                linkToTransaction
                notes={transactionsData}
                heading="Transaction Activity"
              />
            </TabPanel>
            <TabPanel p={0}>
              <p>two!</p>
            </TabPanel>
            <TabPanel p={0}>
              <p>three!</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </MainLayout>
  );
}

export default function AccountOverview() {
  const router = useRouter();
  const accountName = asQueryString(router.query["account-name"]);

  if (!accountName) {
    return null;
  }

  return <AccountOverviewContent accountName={accountName} />;
}
