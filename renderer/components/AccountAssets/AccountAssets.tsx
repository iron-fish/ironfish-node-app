import { Heading, LightMode } from "@chakra-ui/react";

import { COLORS } from "@/ui/colors";
import { ShadowCard } from "@/ui/ShadowCard/ShadowCard";

export function AccountAssets() {
  return (
    <LightMode>
      <ShadowCard
        contentContainerProps={{
          bg: COLORS.VIOLET,
          p: 8,
        }}
      >
        <Heading color={COLORS.BLACK} fontSize={24}>
          Your Assets
        </Heading>
      </ShadowCard>
    </LightMode>
  );
}
