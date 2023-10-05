import {
  Button,
  Link as ChakraLink,
  HStack,
  Heading,
  VStack,
} from "@chakra-ui/react";
import React from "react";

import { TRPCDemo } from "@/components/TRPCDemo/TRPCDemo";

export default function Home() {
  return (
    <React.Fragment>
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
