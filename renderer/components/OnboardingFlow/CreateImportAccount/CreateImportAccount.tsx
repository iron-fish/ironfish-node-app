import { Box, Heading, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";

import { PillButton } from "@/ui/PillButton/PillButton";
import { ShadowCard } from "@/ui/ShadowCard/ShadowCard";
import { LogoLg } from "@/ui/SVGs/LogoLg";

export function CreateImportAccount() {
  const router = useRouter();

  return (
    <Box>
      <LogoLg />
      <Heading mt={24} mb={8}>
        Iron Fish Wallet
      </Heading>
      <ShadowCard contentContainerProps={{ p: 8 }} mb={8}>
        <Heading fontSize="2xl" mb={3}>
          Create Account
        </Heading>
        <Text fontSize="md" mb={4}>
          Choose this option if you don&apos;t have an existing Iron Fish
          account or if you&apos;d like to create a new one.
        </Text>
        <PillButton
          onClick={() => {
            router.push(`/onboarding/create`);
          }}
        >
          Create Account
        </PillButton>
      </ShadowCard>
      <ShadowCard contentContainerProps={{ p: 8 }}>
        <Heading fontSize="2xl" mb={3}>
          Import Account
        </Heading>
        <Text fontSize="md" mb={4}>
          Already have an account? Enter your recovery credentials and continue
          using your account as expected.
        </Text>
        <PillButton
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
