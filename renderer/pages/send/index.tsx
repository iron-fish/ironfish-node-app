import { Heading, Text, Flex, Box } from "@chakra-ui/react";
import Image from "next/image";
import { defineMessages, useIntl } from "react-intl";

import { SendAssetsForm } from "@/components/SendAssetsForm/SendAssetsForm";
import treasureChest from "@/images/treasure-chest.svg";
import MainLayout from "@/layouts/MainLayout";
import { COLORS } from "@/ui/colors";

const messages = defineMessages({
  heading: {
    defaultMessage: "Send",
  },
  aboutFees: {
    defaultMessage: "About Fees",
  },
  feeAmount: {
    defaultMessage:
      "You can change the fee amount you'd like to pay. However, that will directly correlate with the speed with which your transaction is picked up by the blockchain.",
  },
});

export default function Send() {
  const { formatMessage } = useIntl();

  return (
    <MainLayout>
      <Heading mb={5}>{formatMessage(messages.heading)}</Heading>
      <Flex gap={16}>
        <Box maxW="592px" w="100%">
          <SendAssetsForm />
        </Box>
        <Box>
          <Heading fontSize="2xl" mb={4}>
            {formatMessage(messages.aboutFees)}
          </Heading>
          <Text fontSize="sm" maxW="340px" mb={8} color={COLORS.GRAY_MEDIUM}>
            {formatMessage(messages.feeAmount)}
          </Text>
          <Image src={treasureChest} alt="" />
        </Box>
      </Flex>
    </MainLayout>
  );
}
