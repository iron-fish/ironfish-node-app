import { Box, Heading, HStack, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { defineMessages, useIntl } from "react-intl";

import { trpcReact } from "@/providers/TRPCProvider";
import { COLORS } from "@/ui/colors";
import { PillButton } from "@/ui/PillButton/PillButton";
import { ShadowCard } from "@/ui/ShadowCard/ShadowCard";
import { LogoLg } from "@/ui/SVGs/LogoLg";
import { NodeAppLogo } from "@/ui/SVGs/NodeAppLogo";

const messages = defineMessages({
  createAccount: {
    defaultMessage: "Create Account",
  },
  createAccountDescription: {
    defaultMessage:
      "Choose this option if you don't have an existing Iron Fish account or if you'd like to create a new one.",
  },
  importAccount: {
    defaultMessage: "Import Account",
  },
  importAccountDescription: {
    defaultMessage:
      "Already have an account? Enter your recovery credentials and continue using your account as expected.",
  },
});

export function CreateImportAccount() {
  const router = useRouter();
  const { formatMessage } = useIntl();

  // Initiate query and cache the data for a subsequent call when creating the account
  trpcReact.getExternalChainHead.useQuery(undefined, {
    cacheTime: 1000 * 60 * 10,
    staleTime: 1000 * 60 * 10,
  });

  return (
    <Box>
      <HStack alignItems="flex-start" mb={16}>
        <LogoLg />
        <NodeAppLogo />
      </HStack>
      <ShadowCard contentContainerProps={{ p: 8 }} mb={8} cardOffset="10px">
        <Heading fontSize="2xl" mb={3}>
          {formatMessage(messages.createAccount)}
        </Heading>
        <Text color={COLORS.GRAY_MEDIUM} fontSize="sm" mb={4}>
          {formatMessage(messages.createAccountDescription)}
        </Text>
        <PillButton
          fontSize="sm"
          size="sm"
          onClick={() => {
            router.push(`/onboarding/create`);
          }}
        >
          {formatMessage(messages.createAccount)}
        </PillButton>
      </ShadowCard>
      <ShadowCard contentContainerProps={{ p: 8 }} cardOffset="10px">
        <Heading fontSize="2xl" mb={3}>
          {formatMessage(messages.importAccount)}
        </Heading>
        <Text color={COLORS.GRAY_MEDIUM} fontSize="sm" mb={4}>
          {formatMessage(messages.importAccountDescription)}
        </Text>
        <PillButton
          fontSize="sm"
          size="sm"
          onClick={() => {
            router.push("/onboarding/import");
          }}
        >
          {formatMessage(messages.importAccount)}
        </PillButton>
      </ShadowCard>
    </Box>
  );
}
