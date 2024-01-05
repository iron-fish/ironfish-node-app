import {
  Box,
  Heading,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  HStack,
  Flex,
  Text,
} from "@chakra-ui/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { defineMessages, useIntl } from "react-intl";

import { CopyAddress } from "@/components/CopyAddress/CopyAddress";
import { EditContactForm } from "@/components/EditContactForm/EditContactForm";
import { FishIcon } from "@/components/FishIcon/FishIcon";
import { NotesList } from "@/components/NotesList/NotesList";
import contactSettingsFish from "@/images/contact-settings-fish.svg";
import MainLayout from "@/layouts/MainLayout";
import { trpcReact } from "@/providers/TRPCProvider";
import { COLORS, getGradientByOrder } from "@/ui/colors";
import { PillButton } from "@/ui/PillButton/PillButton";
import { ArrowSend } from "@/ui/SVGs/ArrowSend";
import { asQueryString } from "@/utils/parseRouteQuery";

const messages = defineMessages({
  backToAddressBook: {
    defaultMessage: "Back to Address Book",
  },
  send: {
    defaultMessage: "Send",
  },
  transactions: {
    defaultMessage: "Transactions",
  },
  contactSettings: {
    defaultMessage: "Contact Settings",
  },
  contactSettingsHeading: {
    defaultMessage: "Contact Settings",
  },
  contactSettingsDescription: {
    defaultMessage:
      "With contact names being associated with public addresses, you have the freedom to customize how you identify your contacts without affecting their underlying address.",
  },
});

function SingleContactContent({ address }: { address: string }) {
  const router = useRouter();
  const { formatMessage } = useIntl();
  const { data: transactionsData } =
    trpcReact.getTransactionsForContact.useQuery({
      contactAddress: address,
    });

  const { data: contactData } = trpcReact.getContactByAddress.useQuery({
    address: address,
  });

  if (!transactionsData || !contactData) {
    // @todo: Error handling
    return null;
  }

  return (
    <MainLayout
      backLinkProps={{
        href: "/address-book",
        label: formatMessage(messages.backToAddressBook),
      }}
    >
      <Box>
        <HStack mb={4} gap={4} alignItems="center">
          <FishIcon bg={getGradientByOrder(contactData.order ?? 0)} mr={2} />
          <Heading>{contactData.name}</Heading>
          <CopyAddress
            address={contactData.address}
            transform="translateY(0.4em)"
          />
          <PillButton
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              router.push(`/send?to=${address}`);
            }}
          >
            <ArrowSend transform="scale(0.8)" />
            {formatMessage(messages.send)}
          </PillButton>
        </HStack>
        <Tabs isLazy>
          <TabList mb={8}>
            <Tab py={2} px={4} mr={4}>
              {formatMessage(messages.transactions)}
            </Tab>
            <Tab py={2} px={4} mr={4}>
              {formatMessage(messages.contactSettings)}
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0}>
              <NotesList
                asTransactions
                notes={transactionsData}
                heading={formatMessage(messages.transactions)}
              />
            </TabPanel>
            <TabPanel p={0}>
              <Flex gap={16}>
                <Box
                  maxW={{
                    base: "100%",
                    lg: "592px",
                  }}
                  w="100%"
                >
                  <EditContactForm
                    id={contactData.id}
                    name={contactData.name}
                    address={contactData.address}
                  />
                </Box>
                <Box
                  display={{
                    base: "none",
                    lg: "block",
                  }}
                >
                  <Heading fontSize="2xl" mb={4}>
                    {formatMessage(messages.contactSettingsHeading)}
                  </Heading>
                  <Text
                    fontSize="sm"
                    maxW="340px"
                    mb={8}
                    color={COLORS.GRAY_MEDIUM}
                  >
                    {formatMessage(messages.contactSettingsDescription)}
                  </Text>
                  <Image src={contactSettingsFish} alt="" />
                </Box>
              </Flex>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </MainLayout>
  );
}

export default function SingleContact() {
  const router = useRouter();
  const address = asQueryString(router.query["address"]);

  if (!address) {
    return null;
  }

  return <SingleContactContent address={address} />;
}
