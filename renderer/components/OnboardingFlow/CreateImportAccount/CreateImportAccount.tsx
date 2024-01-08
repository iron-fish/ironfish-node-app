import { Box, Heading, HStack, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";

import { COLORS } from "@/ui/colors";
import { PillButton } from "@/ui/PillButton/PillButton";
import { ShadowCard } from "@/ui/ShadowCard/ShadowCard";
import { LogoLg } from "@/ui/SVGs/LogoLg";
import { NodeAppLogo } from "@/ui/SVGs/NodeAppLogo";

export function CreateImportAccount() {
  const router = useRouter();

  return (
    <Box>
      <HStack alignItems="flex-start" mb={16}>
        <LogoLg />
        <NodeAppLogo />
      </HStack>
      <ShadowCard contentContainerProps={{ p: 8 }} mb={8} cardOffset="10px">
        <Heading fontSize="2xl" mb={3}>
          Create Account
        </Heading>
        <Text color={COLORS.GRAY_MEDIUM} fontSize="sm" mb={4}>
          Choose this option if you don&apos;t have an existing Iron Fish
          account or if you&apos;d like to create a new one.
        </Text>
        <PillButton
          fontSize="sm"
          size="sm"
          onClick={() => {
            router.push(`/onboarding/create`);
          }}
        >
          Create Account
        </PillButton>
      </ShadowCard>
      <ShadowCard contentContainerProps={{ p: 8 }} cardOffset="10px">
        <Heading fontSize="2xl" mb={3}>
          Import Account
        </Heading>
        <Text color={COLORS.GRAY_MEDIUM} fontSize="sm" mb={4}>
          Already have an account? Enter your recovery credentials and continue
          using your account as expected.
        </Text>
        <PillButton
          fontSize="sm"
          size="sm"
          onClick={() => {
            router.push("/onboarding/import");
          }}
        >
          Import Account
        </PillButton>
      </ShadowCard>
    </Box>
  );
}
