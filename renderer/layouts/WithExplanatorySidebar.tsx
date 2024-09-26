import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import Image from "next/image";
import { ReactNode } from "react";

import { COLORS } from "@/ui/colors";
import InfoDrawer from "@/ui/InfoDrawer/InfoDrawer";

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
    <Flex gap={{ base: 8, lg: 16 }}>
      <Box
        maxW={{
          base: "100%",
          lg: "592px",
        }}
        w="100%"
      >
        <>{children}</>
      </Box>
      <InfoDrawer>
        <Box>
          <Heading fontSize="2xl" mb={4}>
            {heading}
          </Heading>
          <Description>{description}</Description>
          <Box mt={8}>
            <Image src={imgSrc} alt="" />
          </Box>
        </Box>
      </InfoDrawer>
    </Flex>
  );
}

function DescriptionText({ children }: { children: ReactNode }) {
  return (
    <Text
      fontSize="sm"
      maxW="340px"
      mb={4}
      color={COLORS.GRAY_MEDIUM}
      _dark={{ color: COLORS.DARK_MODE.GRAY_LIGHT }}
    >
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
