import { VStack, Flex, Spinner } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useCallback, useEffect } from "react";

import { SnapshotDownloadModal } from "@/components/SnapshotDownloadModal/SnapshotDownloadModal";
import { trpcReact } from "@/providers/TRPCProvider";
import { LogoLg } from "@/ui/SVGs/LogoLg";

/**
 * This component handles initializing the SDK, determining what state
 * the user should be in, and routing them to the appropriate page.
 *
 * - If the user does not have an account, they go to the create/import flow.
 * - If the user user is behind on syncing, they are prompted to download a snapshot.
 * - If the user is up to date, they are redirected to the accounts page.
 */
export default function Home() {
  const router = useRouter();

  const { data: initialStateData, isLoading: isInitialStateLoading } =
    trpcReact.getInitialState.useQuery();
  const { mutate: startNode } = trpcReact.startNode.useMutation();

  useEffect(() => {
    if (initialStateData === "onboarding") {
      router.replace("/onboarding");
    }
  }, [initialStateData, router]);

  useEffect(() => {
    if (initialStateData === "start-node") {
      startNode();
      router.replace("/accounts");
    }
  }, [router, startNode, initialStateData, isInitialStateLoading]);

  const handleSnapshotSuccess = useCallback(() => {
    startNode();
    router.replace("/accounts");
  }, [router, startNode]);

  const handleSyncFromPeers = useCallback(() => {
    startNode();
    router.replace("/accounts");
  }, [router, startNode]);

  return (
    <>
      <Flex h="100vh" justifyContent="center" alignItems="center">
        <VStack gap={10}>
          <LogoLg transform="scale(2)" />
          <Spinner size="lg" />
        </VStack>
      </Flex>
      {initialStateData === "snapshot-download-prompt" && (
        <SnapshotDownloadModal
          onSuccess={handleSnapshotSuccess}
          onPeers={handleSyncFromPeers}
        />
      )}
    </>
  );
}
