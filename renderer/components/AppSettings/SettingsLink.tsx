import { Box, Flex, FlexProps, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { FaChevronRight } from "react-icons/fa";
import { MdOutlineLanguage } from "react-icons/md";
import { defineMessages, useIntl } from "react-intl";

import { COLORS } from "@/ui/colors";

const messages = defineMessages({
  title: {
    defaultMessage: "Settings",
  },
});

export function SettingsLink(props: FlexProps) {
  const router = useRouter();
  const { formatMessage } = useIntl();
  return (
    <Flex
      aria-label={formatMessage(messages.title)}
      as="button"
      borderRadius="5px"
      bg={COLORS.GRAY_LIGHT}
      color={COLORS.GRAY_MEDIUM}
      justifyContent={{
        base: "center",
        md: "space-between",
      }}
      alignItems="center"
      py="6px"
      px={{
        base: 0,
        md: "18px",
      }}
      _dark={{
        bg: COLORS.DARK_MODE.GRAY_MEDIUM,
        color: COLORS.DARK_MODE.GRAY_LIGHT,
      }}
      width={{
        base: "34px",
        md: "100%",
      }}
      height={{
        base: "34px",
        md: "100%",
      }}
      onClick={() => {
        router.push("/settings");
      }}
      {...props}
    >
      <Flex alignItems="center" justifyContent="center">
        <MdOutlineLanguage />
        <Text
          ml={18}
          mr={3}
          as="span"
          display={{
            base: "none",
            md: "block",
          }}
        >
          {formatMessage(messages.title)}
        </Text>
      </Flex>

      <Box
        display={{
          base: "none",
          md: "block",
        }}
      >
        <FaChevronRight fontSize="0.6em" />
      </Box>
    </Flex>
  );
}
