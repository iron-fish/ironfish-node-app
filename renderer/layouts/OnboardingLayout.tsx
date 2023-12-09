import { Box, LightMode } from "@chakra-ui/react";
import Image from "next/image";
import { ReactNode } from "react";

import bigOnboardingFish from "@/images/big-onboarding-fish.svg";

import { WithDraggableArea } from "./WithDraggableArea";

export function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <LightMode>
      <WithDraggableArea>
        <Box height="100%" width="100%" overflow="hidden" position="relative">
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
          <Box
            maxW="900px"
            minH="100vh"
            py="95px"
            px="150px"
            bg="white"
            position="relative"
            zIndex={1}
          >
            {children}
          </Box>
        </Box>
      </WithDraggableArea>
    </LightMode>
  );
}
