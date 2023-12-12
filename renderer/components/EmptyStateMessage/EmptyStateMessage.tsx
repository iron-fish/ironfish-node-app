import { Box, BoxProps, Heading, Text } from "@chakra-ui/react";
import Image from "next/image";
import { ReactNode } from "react";

import emptyFish from "@/images/empty-fish.svg";

type Props = {
  heading: string | ReactNode;
  description: string | ReactNode;
} & BoxProps;

export function EmptyStateMessage({ heading, description, ...rest }: Props) {
  return (
    <Box textAlign="center" {...rest}>
      <Heading fontSize="2xl" mb={4}>
        {heading}
      </Heading>
      <Text maxW="50ch" mx="auto" mb={8}>
        {description}
      </Text>
      <Image src={emptyFish} alt="" />
    </Box>
  );
}
