import {
  Box,
  Checkbox,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import Image from "next/image";
import { defineMessages, useIntl } from "react-intl";

import { COLORS } from "@/ui/colors";
import { ShadowCard } from "@/ui/ShadowCard/ShadowCard";

import tinyFish from "./assets/tiny-fish.svg";

const messages = defineMessages({
  connectAccount: {
    defaultMessage: "Connect account",
  },
  description: {
    defaultMessage:
      "One last step! Confirm the account you'd like to connect to the Node App.",
  },
  alreadyImported: {
    defaultMessage: "This Ledger account has already been imported",
  },
});

type Props = {
  deviceName: string;
  publicAddress: string;
  isConfirmed: boolean;
  onConfirmChange: (value: boolean) => void;
  isImported: boolean;
};

export function StepAddAccount({
  deviceName,
  publicAddress,
  isConfirmed,
  onConfirmChange,
  isImported,
}: Props) {
  const { formatMessage } = useIntl();

  return (
    <>
      <Heading mb={4}>{formatMessage(messages.connectAccount)}</Heading>
      <Text
        mb={6}
        fontSize="medium"
        color={COLORS.GRAY_MEDIUM}
        _dark={{
          color: COLORS.DARK_MODE.GRAY_LIGHT,
        }}
      >
        {formatMessage(messages.description)}
      </Text>
      <ShadowCard
        contentContainerProps={{
          p: 0,
        }}
      >
        <HStack py={5} px={4} justifyContent="space-between">
          <Text fontSize="medium">{deviceName}</Text>
          <Tooltip
            label={isImported ? formatMessage(messages.alreadyImported) : null}
            placement="top"
          >
            <Box>
              <Checkbox
                isChecked={isConfirmed}
                onChange={(e) => onConfirmChange(e.target.checked)}
                disabled={isImported}
              />
            </Box>
          </Tooltip>
        </HStack>

        <Box borderBottom="1px solid black" />

        <Grid templateColumns="auto 1fr" p={4} gap={3}>
          <GridItem>
            <Flex
              alignItems="center"
              justifyContent="center"
              minH="48px"
              minW="48px"
              border="1px solid black"
              borderRadius="50%"
              _dark={{
                filter: "invert(1)",
              }}
            >
              <Image src={tinyFish} alt="" />
            </Flex>
          </GridItem>
          <GridItem>
            <Box maxW="auto">
              <Text mt={2} mb={1} fontSize="medium">
                Iron Fish
              </Text>
              <Text
                w="auto"
                wordBreak="break-all"
                color={COLORS.GRAY_MEDIUM}
                _dark={{
                  color: COLORS.DARK_MODE.GRAY_LIGHT,
                }}
              >
                {publicAddress}
              </Text>
            </Box>
          </GridItem>
        </Grid>
      </ShadowCard>
    </>
  );
}
