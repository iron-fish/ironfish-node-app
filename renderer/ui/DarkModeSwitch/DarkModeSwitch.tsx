import { useColorMode, Flex, HStack } from "@chakra-ui/react";
import { useCallback } from "react";

import { trpcReact } from "@/providers/TRPCProvider";

const moon = (
  <svg width={11} height={11} fill="none">
    <path
      fill="#fff"
      d="M5.25 0a5.25 5.25 0 1 0 5.192 4.457A3.152 3.152 0 1 1 6.044.059 5.904 5.904 0 0 0 5.25 0Z"
    />
  </svg>
);

const sun = (
  <svg width={14} height={14} fill="none">
    <path
      fill="#fff"
      d="M7 4.083a2.918 2.918 0 0 0 0 5.833 2.918 2.918 0 0 0 0-5.833Zm-5.834 3.5h1.167c.32 0 .583-.262.583-.583a.585.585 0 0 0-.583-.584H1.166A.585.585 0 0 0 .583 7c0 .32.263.583.583.583Zm10.5 0h1.167c.32 0 .583-.262.583-.583a.585.585 0 0 0-.583-.584h-1.167a.585.585 0 0 0-.583.584c0 .32.262.583.583.583Zm-5.25-6.417v1.167c0 .32.263.583.584.583.32 0 .583-.262.583-.583V1.166A.585.585 0 0 0 7 .583a.585.585 0 0 0-.584.583Zm0 10.5v1.167c0 .32.263.583.584.583.32 0 .583-.262.583-.583v-1.167A.585.585 0 0 0 7 11.083a.585.585 0 0 0-.584.583ZM3.494 2.671a.58.58 0 1 0-.823.823l.619.618a.58.58 0 1 0 .822-.822l-.618-.619Zm7.216 7.216a.58.58 0 1 0-.823.823l.618.618a.58.58 0 1 0 .823-.822l-.618-.619Zm.618-6.393a.58.58 0 1 0-.822-.823l-.619.619a.58.58 0 1 0 .823.822l.618-.618ZM4.112 10.71a.58.58 0 1 0-.822-.823l-.619.618a.58.58 0 1 0 .823.823l.618-.618Z"
    />
  </svg>
);

export const DarkModeSwitch = () => {
  const { colorMode } = useColorMode();
  const { mutate: setUserSettings } = trpcReact.setUserSettings.useMutation();
  const isDark = colorMode === "dark";

  const toggleColorMode = useCallback(() => {
    colorMode === "dark"
      ? setUserSettings({ theme: "light" })
      : setUserSettings({ theme: "dark" });
  }, [setUserSettings, colorMode]);

  return (
    <HStack
      as="button"
      aria-label="Toggle dark mode"
      onClick={toggleColorMode}
      w="64px"
      h="36px"
      borderRadius="full"
      p={1}
      bg={isDark ? "#344F84" : "#F7EAB7"}
      justifyContent={isDark ? "flex-start" : "flex-end"}
    >
      <Flex
        h="28px"
        w="28px"
        borderRadius="full"
        justifyContent="center"
        alignItems="center"
        bg={isDark ? "#2C72FF" : "#EBC354"}
      >
        {isDark ? moon : sun}
      </Flex>
    </HStack>
  );
};
