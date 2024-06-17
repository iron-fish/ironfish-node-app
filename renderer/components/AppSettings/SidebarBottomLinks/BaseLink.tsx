import { Box, Flex, FlexProps, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { ReactNode } from "react";
import { FaChevronRight } from "react-icons/fa";

import { COLORS } from "@/ui/colors";

type Props = {
  title: string;
  icon: ReactNode;
  href: string;
} & FlexProps;

export function BaseLink({ title, icon, href, ...rest }: Props) {
  const router = useRouter();
  return (
    <Flex
      aria-label={title}
      as="button"
      borderRadius="5px"
      bg={COLORS.GRAY_LIGHT}
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
      width={{
        base: "34px",
        md: "100%",
      }}
      height={{
        base: "34px",
        md: "100%",
      }}
      onClick={() => {
        router.push(href);
      }}
      color={COLORS.GRAY_MEDIUM}
      _hover={{
        color: COLORS.BLACK,
      }}
      _dark={{
        bg: COLORS.DARK_MODE.GRAY_MEDIUM,
        color: COLORS.DARK_MODE.GRAY_LIGHT,
        _hover: {
          color: COLORS.WHITE,
        },
      }}
      {...rest}
    >
      <Flex alignItems="center" justifyContent="center">
        <Box
          color={COLORS.GRAY_MEDIUM}
          _dark={{
            color: "#ADAEB4",
          }}
        >
          {icon}
        </Box>
        <Text
          ml={18}
          mr={3}
          as="span"
          display={{
            base: "none",
            md: "block",
          }}
          color="inherit"
          _dark={{
            color: "inherit",
          }}
        >
          {title}
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
