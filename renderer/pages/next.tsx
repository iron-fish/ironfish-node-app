import React from "react";
import Head from "next/head";
import {
  Button,
  Link as ChakraLink,
  VStack,
  Heading,
  HStack,
} from "@chakra-ui/react";
import { DarkModeSwitch } from "@/ui/DarkModeSwitch/DarkModeSwitch";

const Next = () => {
  return (
    <>
      <Head>
        <title>Next - Nextron (with-typescript-chakra-ui)</title>
      </Head>
      <DarkModeSwitch />
      <VStack minH="100vh" justifyContent="center">
        <Heading>Other page</Heading>
        <HStack>
          <Button
            as={ChakraLink}
            href="/home"
            variant="solid"
            colorScheme="teal"
            rounded="button"
            width="full"
          >
            Go to home page
          </Button>
        </HStack>
      </VStack>
    </>
  );
};

export default Next;
