import {
  Grid,
  GridItem,
  Box,
  VStack,
  Text,
  HStack,
  Flex,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { createContext, ReactNode, useContext, useState } from "react";
import { defineMessages, useIntl } from "react-intl";

import { BackButton } from "@/components/BackButton/BackButton";
import { LanguageSelector } from "@/components/LanguageSelector/LanguageSelector";
import { StatusIndicator } from "@/components/StatusIndicator/StatusIndicator";
import { ChakraLink } from "@/ui/ChakraLink/ChakraLink";
import { COLORS } from "@/ui/colors";
import { DarkModeSwitch } from "@/ui/DarkModeSwitch/DarkModeSwitch";
import { AddressBook } from "@/ui/SVGs/AddressBook";
import { ArrowReceive } from "@/ui/SVGs/ArrowReceive";
import { ArrowSend } from "@/ui/SVGs/ArrowSend";
import { House } from "@/ui/SVGs/House";
import { LogoLg } from "@/ui/SVGs/LogoLg";
import { LogoSm } from "@/ui/SVGs/LogoSm";
import { ReleaseNotes } from "@/ui/SVGs/ReleaseNotes";
import { YourNode } from "@/ui/SVGs/YourNode";

import { WithDraggableArea } from "./WithDraggableArea";

const messages = defineMessages({
  accounts: {
    defaultMessage: "Accounts",
  },
  send: {
    defaultMessage: "Send",
  },
  receive: {
    defaultMessage: "Receive",
  },
  addressBook: {
    defaultMessage: "Address Book",
  },
  yourNode: {
    defaultMessage: "Your Node",
  },
  releaseNotes: {
    defaultMessage: "Release Notes",
  },
});

const LINKS = [
  {
    label: messages.accounts,
    href: "/accounts",
    icon: <House />,
  },
  {
    label: messages.send,
    href: "/send",
    icon: <ArrowSend />,
  },
  {
    label: messages.receive,
    href: "/receive",
    icon: <ArrowReceive />,
  },
  {
    label: messages.addressBook,
    href: "/address-book",
    icon: <AddressBook />,
  },
  {
    label: messages.yourNode,
    href: "/your-node",
    icon: <YourNode />,
  },
  {
    label: messages.releaseNotes,
    href: "/release-notes",
    icon: <ReleaseNotes />,
  },
];

function ResponsiveLogo() {
  return (
    <Box>
      <Box
        display={{
          base: "none",
          md: "block",
        }}
      >
        <LogoLg />
      </Box>
      <Box
        display={{
          base: "block",
          md: "none",
        }}
      >
        <LogoSm />
      </Box>
    </Box>
  );
}

function Sidebar() {
  const router = useRouter();
  const { formatMessage } = useIntl();

  return (
    <Flex flexDirection="column" alignItems="stretch" w="100%">
      <Box pl={4} mb={10}>
        <ResponsiveLogo />
      </Box>
      <VStack alignItems="flex-start" flexGrow={1}>
        {LINKS.map(({ label, href, icon }) => {
          const isActive = router.pathname.startsWith(href);
          return (
            <ChakraLink
              key={href}
              href={href}
              w="100%"
              py={3}
              px={2}
              borderRadius={4}
              bg={isActive ? COLORS.GRAY_LIGHT : "transparent"}
              _dark={{
                bg: isActive ? COLORS.DARK_MODE.GRAY_MEDIUM : "transparent",
              }}
              _hover={{
                bg: COLORS.GRAY_LIGHT,
                _dark: {
                  bg: COLORS.DARK_MODE.GRAY_MEDIUM,
                },
              }}
            >
              <HStack>
                <Box w="30px" display="flex" justifyContent="center">
                  {icon}
                </Box>
                <Text
                  display={{
                    base: "none",
                    md: "block",
                  }}
                >
                  {formatMessage(label)}
                </Text>
              </HStack>
            </ChakraLink>
          );
        })}
      </VStack>
      <VStack alignItems="stretch" gap={3}>
        <StatusIndicator />
        <LanguageSelector />
        <DarkModeSwitch />
      </VStack>
    </Flex>
  );
}

type Props = {
  children: ReactNode;
  backLinkProps?: {
    label: string;
    href: string;
  };
};

const ScrollElementContext = createContext<HTMLDivElement | null>(null);

export function useScrollElementContext() {
  return useContext(ScrollElementContext);
}

export default function MainLayout({ children, backLinkProps }: Props) {
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(
    null,
  );

  return (
    <WithDraggableArea
      bg="white"
      _dark={{
        bg: COLORS.DARK_MODE.BG,
      }}
    >
      <Grid height="100%" templateColumns="auto 1fr">
        <GridItem
          h="100%"
          overflow="auto"
          w={{
            base: "auto",
            md: "265px",
          }}
          p={4}
          pt="50px"
          display="flex"
          alignItems="stretch"
        >
          <Sidebar />
        </GridItem>
        <GridItem
          px={6}
          pt={10}
          pb={8}
          h="100%"
          overflow="auto"
          ref={(r) => setScrollElement(r)}
        >
          <ScrollElementContext.Provider value={scrollElement}>
            <Box
              mx="auto"
              maxWidth={{
                base: "100%",
                xl: "1048px",
                "2xl": "1280px",
              }}
            >
              {backLinkProps && (
                <BackButton
                  href={backLinkProps.href}
                  label={backLinkProps.label}
                />
              )}
              {children}
            </Box>
          </ScrollElementContext.Provider>
        </GridItem>
      </Grid>
    </WithDraggableArea>
  );
}
