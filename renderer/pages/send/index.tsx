import { Heading, Text, Flex, Box } from "@chakra-ui/react";
import Image from "next/image";

import { SendAssetsForm } from "@/components/SendAssetsForm/SendAssetsForm";
import treasureChest from "@/images/treasure-chest.svg";
import MainLayout from "@/layouts/MainLayout";
import { COLORS } from "@/ui/colors";

export default function Send() {
  return (
    <MainLayout>
      <Heading mb={5}>Send</Heading>
      <Flex gap={16}>
        <Box maxW="592px" w="100%">
          <SendAssetsForm />
        </Box>
        <Box>
          <Heading fontSize="2xl" mb={4}>
            About Fees
          </Heading>
          <Text fontSize="sm" maxW="340px" mb={16} color={COLORS.GRAY_MEDIUM}>
            You can change the fee amount you&apos;d like to pay. However, that
            will directly correlate with the speed with which your transaction
            is picked up by the blockchain.
          </Text>
          <Image src={treasureChest} alt="" />
        </Box>
      </Flex>
    </MainLayout>
  );
}
