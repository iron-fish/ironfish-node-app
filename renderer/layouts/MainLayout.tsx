import {
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { createContext, ReactNode, useContext, useState } from "react";
import { defineMessages, useIntl } from "react-intl";

import { ReleaseNotesLink } from "@/components/AppSettings/SidebarBottomLinks/ReleaseNotesLink";
import { SettingsLink } from "@/components/AppSettings/SidebarBottomLinks/SettingsLink";
import { BackButton } from "@/components/BackButton/BackButton";
import { StatusIndicator } from "@/components/StatusIndicator/StatusIndicator";
import { TestnetBanner } from "@/components/TestnetBanner/TestnetBanner";
import { useFeatureFlags } from "@/providers/FeatureFlagsProvider";
import { trpcReact } from "@/providers/TRPCProvider";
import { ChakraLink } from "@/ui/ChakraLink/ChakraLink";
import { COLORS } from "@/ui/colors";
import { AddressBook } from "@/ui/SVGs/AddressBook";
import { ArrowReceive } from "@/ui/SVGs/ArrowReceive";
import { ArrowSend } from "@/ui/SVGs/ArrowSend";
import { BridgeArrows } from "@/ui/SVGs/BridgeArrows";
import { House } from "@/ui/SVGs/House";
import { LogoLg } from "@/ui/SVGs/LogoLg";
import { LogoSm } from "@/ui/SVGs/LogoSm";
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
  bridge: {
    defaultMessage: "Bridge",
  },
  addressBook: {
    defaultMessage: "Address Book",
  },
  yourNode: {
    defaultMessage: "Your Node",
  },
  multisigLedger: {
    defaultMessage: "Multisig Ledger",
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
    id: "bridge",
    label: messages.bridge,
    href: "/bridge",
    icon: <BridgeArrows />,
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
    id: "multisigLedger",
    label: messages.multisigLedger,
    href: "/multisig-ledger",
    icon: <ArrowSend />,
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
  const { colorMode } = useColorMode();
  const { flags } = useFeatureFlags();
  const { mutate: setUserSettings } = trpcReact.setUserSettings.useMutation();

  return (
    <Flex flexDirection="column" alignItems="stretch" w="100%">
      <Box
        onDoubleClick={() => {
          if (flags.themeToggle.enabled) {
            colorMode === "dark"
              ? setUserSettings({ theme: "light" })
              : setUserSettings({ theme: "dark" });
          }
        }}
        pl={4}
        mb={10}
        color={flags.demoFlag.enabled ? "#2C72FF" : undefined}
      >
        <ResponsiveLogo />
      </Box>
      <VStack alignItems="flex-start" flexGrow={1}>
        {LINKS.map(({ label, href, icon, id }) => {
          // Multisig Ledger is only visible if the flag is enabled
          if (id === "multisigLedger" && !flags.multisigLedger.enabled) {
            return null;
          }
          // The bridge tab is only visible if the flag is enabled and we're not on mainnet
          if (id === "bridge" && !flags.chainportBridge.enabled) {
            return null;
          }

          const isActive = router.pathname.startsWith(href);
          return (
            <ChakraLink
              key={href}
              href={href}
              w="100%"
              height="40px"
              px={4}
              borderRadius={4}
              bg={isActive ? COLORS.GRAY_LIGHT : "transparent"}
              color={isActive ? COLORS.BLACK : COLORS.GRAY_MEDIUM}
              _dark={{
                bg: isActive ? COLORS.DARK_MODE.GRAY_MEDIUM : "transparent",
                color: isActive ? COLORS.WHITE : COLORS.DARK_MODE.GRAY_LIGHT,
              }}
              _hover={{
                bg: COLORS.GRAY_LIGHT,
                color: COLORS.BLACK,
                _dark: {
                  bg: COLORS.DARK_MODE.GRAY_MEDIUM,
                  color: COLORS.WHITE,
                },
              }}
              role="group"
            >
              <HStack gap={4} h="100%">
                <Box
                  display="flex"
                  justifyContent="center"
                  width="24px"
                  color={COLORS.BLACK}
                  _dark={{ color: COLORS.WHITE }}
                >
                  {icon}
                </Box>
                <Heading
                  fontSize="sm"
                  display={{
                    base: "none",
                    md: "block",
                  }}
                >
                  {formatMessage(label)}
                </Heading>
              </HStack>
            </ChakraLink>
          );
        })}
      </VStack>
      <VStack alignItems="center" gap={4}>
        <StatusIndicator />
        <ReleaseNotesLink />
        <SettingsLink />
      </VStack>
    </Flex>
  );
}

type Props = {
  children: ReactNode;
  backLinkProps?: {
    label: string | null;
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
      <VStack alignItems="stretch" h="100%">
        <TestnetBanner />
        <Grid flexGrow={1} templateColumns="auto 1fr" overflow="auto">
          <GridItem
            h="100%"
            overflow="auto"
            w={{
              base: "auto",
              md: "265px",
            }}
            px={4}
            pt="50px"
            pb={{
              base: 8,
              md: 6,
            }}
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
      </VStack>
    </WithDraggableArea>
  );
}
