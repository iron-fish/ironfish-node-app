import { ChevronLeftIcon } from "@chakra-ui/icons";
import { Box, HStack, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { ReactNode } from "react";
import { defineMessages, useIntl } from "react-intl";

import { MaybeLink } from "@/ui/ChakraLink/ChakraLink";
import { COLORS } from "@/ui/colors";

type Props = {
  href?: string;
  label?: ReactNode;
  onClick?: () => void;
};

const messages = defineMessages({
  goBack: {
    defaultMessage: "Go Back",
  },
});

export function BackButton({ href, label = null, onClick }: Props) {
  const router = useRouter();
  const { formatMessage } = useIntl();

  return (
    <MaybeLink
      href={href}
      display="inline-block"
      mb={4}
      onClick={() => {
        onClick?.();

        if (!href && !onClick) {
          router.back();
        }
      }}
      cursor="pointer"
    >
      <HStack gap={3}>
        <Box
          h="24px"
          w="24px"
          border="1px solid"
          borderRadius="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderColor="#DEDFE2"
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
          {label || formatMessage(messages.goBack)}
        </Text>
      </HStack>
    </MaybeLink>
  );
}
