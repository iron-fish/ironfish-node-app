import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import Image from "next/image";
import { ReactNode } from "react";

import { COLORS } from "@/ui/colors";

type Props = {
  heading: ReactNode;
  description: string | string[];
  imgSrc: string;
  children: ReactNode;
};

export function WithExplanatorySidebar({
  heading,
  description,
  imgSrc,
  children,
}: Props) {
  return (
    <Flex gap={16}>
      <Box
        maxW={{
          base: "100%",
          lg: "592px",
        }}
        w="100%"
      >
        {children}
      </Box>
      <Box
        display={{
          base: "none",
          lg: "block",
        }}
      >
        <Heading fontSize="2xl" mb={4}>
          {heading}
        </Heading>
        <Description>{description}</Description>
        <Box mt={8}>
          <Image src={imgSrc} alt="" />
        </Box>
      </Box>
    </Flex>
  );
}

function DescriptionText({ children }: { children: ReactNode }) {
  return (
    <Text fontSize="sm" maxW="340px" mb={4} color={COLORS.GRAY_MEDIUM}>
      {children}
    </Text>
  );
}

function Description({ children }: { children: ReactNode }) {
  if (Array.isArray(children)) {
    return children.map((child, i) => (
      <DescriptionText key={i}>{child}</DescriptionText>
    ));
  }

  return <DescriptionText>{children}</DescriptionText>;
}
