import { Grid, GridItem, Box, VStack, Text, HStack } from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

import { DarkModeSwitch } from "@/ui/DarkModeSwitch/DarkModeSwitch";

import logoLg from "./assets/logo-lg.svg";

const LINKS = [
  {
    label: "Accounts",
    href: "/accounts",
    icon: "",
  },
  {
    label: "Send $IRON",
    href: "/accounts",
    icon: "",
  },
  {
    label: "Receive $IRON",
    href: "/accounts",
    icon: "",
  },
  {
    label: "Address Book",
    href: "/accounts",
    icon: "",
  },
  {
    label: "Your Node",
    href: "/accounts",
    icon: "",
  },
  {
    label: "Release Notes",
    href: "/accounts",
    icon: "",
  },
];

function Sidebar() {
  return (
    <>
      <Box pl={4} mb={10}>
        <Image alt="" src={logoLg} />
      </Box>
      <VStack alignItems="flex-start">
        {LINKS.map(({ label, href, icon }) => (
          <HStack key={href}>
            {icon}
            <Text as={Link} href={href}>
              {label}
            </Text>
          </HStack>
        ))}
      </VStack>
      <Box mt={10}>
        <DarkModeSwitch />
      </Box>
    </>
  );
}

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <Grid templateColumns="auto 1fr" h="100vh">
      <GridItem w="265px" p={4} pt="50px">
        <Sidebar />
      </GridItem>
      <GridItem bg="pink">
        <Box p={4}>{children}</Box>
      </GridItem>
    </Grid>
  );
}
