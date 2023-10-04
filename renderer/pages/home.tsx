import React from "react";
import Head from "next/head";
import {
  Button,
  Link as ChakraLink,
  HStack,
  Heading,
  VStack,
} from "@chakra-ui/react";
import { DarkModeSwitch } from "@/ui/DarkModeSwitch/DarkModeSwitch";
import { TRPCDemo } from "@/components/TRPCDemo/TRPCDemo";

export default function Home() {
  return (
    <React.Fragment>
      <Head>
        <title>Home - Nextron (with-typescript-chakra-ui)</title>
      </Head>
      <DarkModeSwitch />
      <VStack minH="100vh" justifyContent="center">
        <Heading>Home page</Heading>
        <TRPCDemo />
        <HStack>
          <Button
            as={ChakraLink}
            href="/accounts"
            variant="solid"
            colorScheme="teal"
            rounded="button"
            width="full"
          >
            Go to accounts
          </Button>
          <Button
            as={ChakraLink}
            href="/other"
            variant="solid"
            colorScheme="teal"
            rounded="button"
            width="full"
          >
            Go to other page
          </Button>
        </HStack>
      </VStack>
    </React.Fragment>
  );
}
