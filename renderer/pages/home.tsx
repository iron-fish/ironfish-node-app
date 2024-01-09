import { VStack, Flex, Spinner } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

import { trpcReact } from "@/providers/TRPCProvider";
import { LogoLg } from "@/ui/SVGs/LogoLg";

/**
 * This component handles initializing the SDK, determining what state
 * the user should be in, and routing them to the appropriate page.
 */
export default function Home() {
  const router = useRouter();
  const { data: initialStateData, isLoading: isInitialStateLoading } =
    trpcReact.getInitialState.useQuery(undefined, {
      retry: false,
      useErrorBoundary: true,
    });

  const { mutate: startNode } = trpcReact.startNode.useMutation();

  // If user has no accounts, go to onboarding
  useEffect(() => {
    if (initialStateData === "onboarding") {
      router.replace("/onboarding");
    }
  }, [initialStateData, router]);

  // If user is behind on syncing, go to snapshot download
  useEffect(() => {
    if (initialStateData === "snapshot-download-prompt") {
      router.replace("/onboarding/snapshot-download");
    }
  }, [initialStateData, router]);

  // Otherwise, start node and go to accounts page
  useEffect(() => {
    if (initialStateData === "start-node") {
      startNode();
      router.replace("/accounts");
    }
  }, [router, startNode, initialStateData, isInitialStateLoading]);

  return (
    <Flex h="100vh" justifyContent="center" alignItems="center">
      <VStack gap={10}>
        <LogoLg transform="scale(2)" />
        <Spinner size="lg" />
      </VStack>
    </Flex>
  );
}
