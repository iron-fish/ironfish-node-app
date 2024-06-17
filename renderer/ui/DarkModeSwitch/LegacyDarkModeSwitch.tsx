import { SunIcon, MoonIcon } from "@chakra-ui/icons";
import { useColorMode, HStack, Text, Box, Stack } from "@chakra-ui/react";
import { useCallback } from "react";

import { trpcReact } from "@/providers/TRPCProvider";

import { COLORS } from "../colors";

export const LegacyDarkModeSwitch = () => {
  const { colorMode } = useColorMode();
  const { mutate: setUserSettings } = trpcReact.setUserSettings.useMutation();
  const isDark = colorMode === "dark";

  const toggleColorMode = useCallback(() => {
    colorMode === "dark"
      ? setUserSettings({ theme: "light" })
      : setUserSettings({ theme: "dark" });
  }, [setUserSettings, colorMode]);

  return (
    <Stack
      as="button"
      aria-label="Toggle Color Mode"
      onClick={toggleColorMode}
      bg={COLORS.GRAY_LIGHT}
      w={{
        base: "34px",
        md: "100%",
      }}
      h={{
        base: "60px",
        md: "auto",
      }}
      p={1}
      position="relative"
      borderRadius="5px"
      _dark={{
        bg: COLORS.DARK_MODE.GRAY_MEDIUM,
      }}
    >
      <HStack
        data-mode={isDark ? "dark" : "light"}
        bg="white"
        w={{
          base: "100%",
          md: "50%",
        }}
        h={{
          base: "50%",
          md: "auto",
        }}
        borderRadius="2px"
        boxShadow="0px 4px 11px rgba(0, 0, 0, 0.04)"
        justifyContent="center"
        py="2px"
        gap={1}
        px={1}
        _dark={{
          bg: "#252525",
        }}
        transform={{
          base: isDark ? "translateY(100%)" : "translateY(0%)",
          md: isDark ? "translateX(100%)" : "translateX(0%)",
        }}
        zIndex={1}
      >
        <Box transform="translateY(-1px) scale(0.85)">
          {isDark ? <MoonIcon /> : <SunIcon />}
        </Box>
        <Text
          display={{
            base: "none",
            md: "block",
          }}
        >
          {isDark ? "Dark" : "Light"}
        </Text>
      </HStack>
      <Stack
        p={1}
        flexDirection={{
          base: "column",
          md: "row",
        }}
        position="absolute"
        inset={0}
        w="100%"
        px={1}
        aria-hidden
      >
        <HStack
          w={{
            base: "100%",
            md: "50%",
          }}
          h={{
            base: "50%",
            md: "auto",
          }}
          justifyContent="center"
          gap={1}
        >
          <Box transform="translateY(-1px) scale(0.85)">
            <SunIcon />
          </Box>
          <Text
            display={{
              base: "none",
              md: "block",
            }}
          >
            Light
          </Text>
        </HStack>
        <HStack
          w={{
            base: "100%",
            md: "50%",
          }}
          h={{
            base: "50%",
            md: "auto",
          }}
          justifyContent="center"
          gap={1}
          opacity={0.6}
        >
          <Box transform="translateY(-1px) scale(0.85)">
            <MoonIcon />
          </Box>
          <Text
            display={{
              base: "none",
              md: "block",
            }}
          >
            Dark
          </Text>
        </HStack>
      </Stack>
    </Stack>
  );
};
