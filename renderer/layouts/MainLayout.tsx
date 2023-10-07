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
import { ReactNode } from "react";

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

const LINKS = [
  {
    label: "Accounts",
    href: "/accounts",
    icon: <House />,
  },
  {
    label: "Send $IRON",
    href: "/send",
    icon: <ArrowSend />,
  },
  {
    label: "Receive $IRON",
    href: "/receive",
    icon: <ArrowReceive />,
  },
  {
    label: "Address Book",
    href: "/address-book",
    icon: <AddressBook />,
  },
  {
    label: "Your Node",
    href: "/your-node",
    icon: <YourNode />,
  },
  {
    label: "Release Notes",
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
          sm: "block",
        }}
      >
        <LogoLg />
      </Box>
      <Box
        display={{
          base: "block",
          sm: "none",
        }}
      >
        <LogoSm />
      </Box>
    </Box>
  );
}

function Sidebar() {
  const router = useRouter();

  return (
    <Flex flexDirection="column" alignItems="stretch" w="100%">
      <Box pl={4} mb={10}>
        <ResponsiveLogo />
      </Box>
      <VStack alignItems="flex-start" flexGrow={1}>
        {LINKS.map(({ label, href, icon }) => {
          const isActive = router.pathname === href;
          return (
            <ChakraLink
              key={href}
              href={href}
              w="100%"
              py={3}
              px="18px"
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
                <Box w="30px">{icon}</Box>
                <Text
                  display={{
                    base: "none",
                    sm: "block",
                  }}
                >
                  {label}
                </Text>
              </HStack>
            </ChakraLink>
          );
        })}
      </VStack>
      <DarkModeSwitch />
    </Flex>
  );
}

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <Grid
      templateColumns="auto 1fr"
      h="100vh"
      bg="white"
      _dark={{
        bg: COLORS.DARK_MODE.BG,
      }}
    >
      <GridItem w="265px" p={4} pt="50px" display="flex" alignItems="stretch">
        <Sidebar />
      </GridItem>
      <GridItem px={6} pt={10} pb={8} overflow="auto">
        <Box
          mx="auto"
          maxWidth={{
            base: "100%",
            sm: "597px",
            lg: "825px",
            xl: "1048px",
            "2xl": "1280px",
          }}
        >
          {children}
        </Box>
      </GridItem>
    </Grid>
  );
}
