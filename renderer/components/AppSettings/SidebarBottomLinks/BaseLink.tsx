import { Box, Flex, FlexProps, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { ReactNode } from "react";

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
      color={"#989898"}
      role="group"
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
          color={"#989898"}
          _dark={{
            color: COLORS.DARK_MODE.GRAY_LIGHT,
          }}
        >
          {icon}
        </Box>
        <Text
          ml={15}
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
        color={COLORS.GRAY_MEDIUM}
        _groupHover={{
          color: COLORS.BLACK,
          _dark: {
            color: COLORS.WHITE,
          },
        }}
        _dark={{
          color: COLORS.DARK_MODE.GRAY_LIGHT,
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8.96877 7L5.46877 10.5L4.6521 9.68333L7.33543 7L4.6521 4.31667L5.46877 3.5L8.96877 7Z"
            fill="currentColor"
          />
        </svg>
      </Box>
    </Flex>
  );
}
