import { SunIcon, MoonIcon } from "@chakra-ui/icons";
import { useColorMode, HStack, Text, Box } from "@chakra-ui/react";
import { motion } from "framer-motion";

import { COLORS } from "../colors";

export const DarkModeSwitch = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === "dark";

  return (
    <HStack
      as="button"
      aria-label="Toggle Color Mode"
      onClick={toggleColorMode}
      bg={COLORS.GRAY_LIGHT}
      w="100%"
      p={1}
      position="relative"
      borderRadius="5px"
      _dark={{
        bg: COLORS.DARK_MODE.GRAY_MEDIUM,
      }}
    >
      <motion.div
        style={{
          zIndex: 1,
          width: "50%",
        }}
        animate={{
          translateX: isDark ? "100%" : "0%",
        }}
        transition={{ type: "linear", duration: 0.2 }}
      >
        <HStack
          bg="white"
          w="100%"
          borderRadius="2px"
          boxShadow="0px 4px 11px rgba(0, 0, 0, 0.04)"
          justifyContent="center"
          py="2px"
          gap={1}
          _dark={{
            bg: "#252525",
          }}
        >
          <Box transform="translateY(-1px) scale(0.85)">
            {isDark ? <MoonIcon /> : <SunIcon />}
          </Box>
          <Text>{isDark ? "Dark" : "Light"}</Text>
        </HStack>
      </motion.div>
      <HStack position="absolute" inset={0} w="100%" aria-hidden>
        <HStack w="50%" justifyContent="center" gap={1} opacity={0.6}>
          <Box transform="translateY(-1px) scale(0.85)">
            <SunIcon />
          </Box>
          <Text>Light</Text>
        </HStack>
        <HStack w="50%" justifyContent="center" gap={1} opacity={0.6}>
          <Box transform="translateY(-1px) scale(0.85)">
            <MoonIcon />
          </Box>
          <Text>Dark</Text>
        </HStack>
      </HStack>
    </HStack>
  );
};
