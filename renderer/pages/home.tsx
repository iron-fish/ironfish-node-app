import React from "react";
import Head from "next/head";
import Image from "next/image";
import {
  Button,
  Link as ChakraLink,
  HStack,
  Heading,
  VStack,
} from "@chakra-ui/react";

import { DarkModeSwitch } from "../components/DarkModeSwitch";
import { TRPCDemo } from "../components/TRPCDemo/TRPCDemo";

const Home = () => (
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
          href="/next"
          variant="solid"
          colorScheme="teal"
          rounded="button"
          width="full"
        >
          Go to next page
        </Button>
      </HStack>
    </VStack>
  </React.Fragment>
);

export default Home;
