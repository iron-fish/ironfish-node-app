import { ChevronLeftIcon } from "@chakra-ui/icons";
import { Box, HStack, Text } from "@chakra-ui/react";

import { ChakraLink } from "@/ui/ChakraLink/ChakraLink";
import { COLORS } from "@/ui/colors";

type Props = {
  href: string;
  label: string;
};

export function OnboardingBackButton({ href, label }: Props) {
  return (
    <ChakraLink href={href} display="inline-block" mb={4}>
      <HStack gap={3}>
        <Box
          h="24px"
          w="24px"
          border="1px solid"
          borderRadius="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderColor={COLORS.GRAY_MEDIUM}
          _dark={{
            borderColor: COLORS.DARK_MODE.GRAY_LIGHT,
          }}
        >
          <ChevronLeftIcon boxSize={4} />
        </Box>
        <Text
          as="span"
          color={COLORS.GRAY_MEDIUM}
          _dark={{ color: COLORS.DARK_MODE.GRAY_LIGHT }}
        >
          {label}
        </Text>
      </HStack>
    </ChakraLink>
  );
}
