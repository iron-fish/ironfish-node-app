import { Box, LightMode, useColorMode } from "@chakra-ui/react";
import Image from "next/image";
import { ReactNode, useEffect } from "react";

import bigOnboardingFish from "@/images/big-onboarding-fish.svg";

import { WithDraggableArea, draggableAreaHeight } from "./WithDraggableArea";

export function OnboardingLayout({ children }: { children: ReactNode }) {
  const { colorMode, toggleColorMode } = useColorMode();

  useEffect(() => {
    if (colorMode === "dark") {
      toggleColorMode();
    }
  }, [colorMode, toggleColorMode]);

  return (
    <LightMode>
      <WithDraggableArea>
        <Box position="fixed" inset={0} pointerEvents="none" overflow="hidden">
          <Box
            height="150vh"
            width="100%"
            position="absolute"
            top="50%"
            right={0}
            transform="translateY(-50%)"
          >
            <Image
              src={bigOnboardingFish}
              alt=""
              layout="fill"
              objectFit="cover"
              objectPosition="right center"
            />
          </Box>
        </Box>
        <Box
          bg="white"
          h="100%"
          maxW={{
            base: "100%",
            md: "724px",
            "2xl": "900px",
          }}
          position="relative"
          w="100%"
          zIndex={1}
        >
          <Box
            height={draggableAreaHeight}
            bg="inherit"
            position="absolute"
            top={0}
            left={0}
            w="100%"
            transform="translateY(-100%)"
          />
          <Box
            h="100%"
            overflow="auto"
            px={{
              base: "32px",
              sm: "64px",
              "2xl": "152px",
            }}
            py="95px"
          >
            {children}
          </Box>
        </Box>
      </WithDraggableArea>
    </LightMode>
  );
}
