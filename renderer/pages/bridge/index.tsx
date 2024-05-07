import { Heading, Text, Flex, Box } from "@chakra-ui/react";
import Image from "next/image";
import { defineMessages, useIntl } from "react-intl";

import { BridgeAssetsForm } from "@/components/BridgeAssetsForm/BridgeAssetsForm";
import rainbowFish from "@/images/rainbow-fish.svg";
import MainLayout from "@/layouts/MainLayout";
import { COLORS } from "@/ui/colors";

const messages = defineMessages({
  heading: {
    defaultMessage: "Bridge",
  },
  aboutHeading: {
    defaultMessage: "About Bridging",
  },
  aboutContent: {
    defaultMessage:
      "Bridging enables seamless transfers of assets across any EVM network. Simply choose your account, a bridge provider, select the asset and its amount, pick the destination network, and provide the destination address to execute your transfer.",
  },
});

export default function Bridge() {
  const { formatMessage } = useIntl();

  return (
    <MainLayout>
      <Heading fontSize={28} lineHeight="160%" mb={5}>
        {formatMessage(messages.heading)}
      </Heading>

      <Flex gap={16}>
        <Box maxW="592px" w="100%">
          <BridgeAssetsForm />
        </Box>
        <Box>
          <Heading fontSize="2xl" mb={4}>
            {formatMessage(messages.aboutHeading)}
          </Heading>
          <Text
            fontSize="sm"
            maxW="340px"
            mb={8}
            color={COLORS.GRAY_MEDIUM}
            _dark={{ color: COLORS.DARK_MODE.GRAY_LIGHT }}
          >
            {formatMessage(messages.aboutContent)}
          </Text>
          <Image src={rainbowFish} alt="" />
        </Box>
      </Flex>
    </MainLayout>
  );
}
