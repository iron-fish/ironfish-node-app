import {
  Box,
  Flex,
  GlobalStyle,
  HStack,
  LightMode,
  Text,
  VStack,
} from "@chakra-ui/react";
import Image from "next/image";
import { ReactNode } from "react";
import { defineMessages, useIntl } from "react-intl";

import { LanguageSelectorButton } from "@/components/LanguageSelector/LanguageSelectorButton";
import { NetworkSelectorButton } from "@/components/NetworkSelector/NetworkSelectorButton";
import bigOnboardingFish from "@/images/big-onboarding-fish.svg";
import discord from "@/images/discord.png";

import { WithDraggableArea, draggableAreaHeight } from "./WithDraggableArea";

const messages = defineMessages({
  needHelp: {
    defaultMessage: "Need Help? Find us on Discord",
  },
});

export function OnboardingLayout({ children }: { children: ReactNode }) {
  const { formatMessage } = useIntl();

  return (
    <LightMode>
      <GlobalStyle />
      <WithDraggableArea>
        <Box position="fixed" inset={0} pointerEvents="none" overflow="hidden">
          <Box
            height="150vh"
            width="100%"
            position="absolute"
            top="50%"
            right={0}
            transform="translateY(-50%)"
          >
            <Image
              src={bigOnboardingFish}
              alt=""
              layout="fill"
              objectFit="cover"
              objectPosition="right center"
            />
          </Box>
        </Box>
        <VStack
          alignItems="stretch"
          gap={0}
          bg="white"
          h="100%"
          maxW={{
            base: "100%",
            md: "724px",
            "2xl": "1024px",
          }}
          position="relative"
          w="100%"
          zIndex={1}
        >
          <Box
            height={draggableAreaHeight}
            bg="inherit"
            position="absolute"
            top={0}
            left={0}
            w="100%"
            transform="translateY(-100%)"
          />
          <Flex
            flex={1}
            overflow="auto"
            px={{
              base: "64px",
              "2xl": "152px",
            }}
            py={16}
          >
            <Box flex={1}>{children}</Box>
          </Flex>
          <Flex
            borderTop="1px solid #DEDFE2"
            py={3}
            alignSelf="stretch"
            justifyContent="space-between"
            px={{
              base: "64px",
              "2xl": "152px",
            }}
          >
            <Box>
              <LanguageSelectorButton
                buttonContainerProps={{
                  px: {
                    base: 0,
                    md: 4,
                  },
                  bg: "white",
                }}
              />
            </Box>
            <Box>
              <NetworkSelectorButton
                buttonContainerProps={{
                  px: {
                    base: 0,
                    md: 4,
                  },
                  bg: "white",
                }}
              />
            </Box>
            <Box
              as="a"
              target="_blank"
              display="inline"
              href="https://discord.ironfish.network/"
              _hover={{ textDecor: "underline" }}
            >
              <HStack py={1} px={1}>
                <Text fontSize="xs" lineHeight="160%">
                  {formatMessage(messages.needHelp)}
                </Text>
                <Image src={discord} alt="Discord" width={18} height={18} />
              </HStack>
            </Box>
          </Flex>
        </VStack>
      </WithDraggableArea>
    </LightMode>
  );
}
