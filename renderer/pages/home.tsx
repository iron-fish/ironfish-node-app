import { VStack, Flex, Spinner } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useCallback, useEffect } from "react";

import { SnapshotDownloadModal } from "@/components/SnapshotDownloadModal/SnapshotDownloadModal";
import { trpcReact } from "@/providers/TRPCProvider";
import { LogoLg } from "@/ui/SVGs/LogoLg";

/**
 * This component handles initializing the SDK and determining
 * what state the user should be in.
 *
 * - @todo: Handle creating an account
 * - If the user has not created an account, they should go to the account creation flow.
 * - If the user user is behind on syncing, they should be prompted to download a snapshot.
 * - If the user is up to date, they should be redirected to the accounts page.
 */
export default function Home() {
  const router = useRouter();

  const { data: initialStateData, isLoading: isInitialStateLoading } =
    trpcReact.getInitialState.useQuery();

  const { mutate: startNode } = trpcReact.startNode.useMutation();

  useEffect(() => {
    if (isInitialStateLoading || initialStateData !== "start-node") return;

    startNode();
    router.replace("/accounts");
  }, [router, startNode, initialStateData, isInitialStateLoading]);

  const handleSyncFromPeers = useCallback(() => {
    // @todo: Handle syncing from peers
    console.log("Syncing from peers");
  }, []);

  const handleSnapshotSuccess = useCallback(() => {
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
          onPeers={handleSyncFromPeers}
          onSuccess={handleSnapshotSuccess}
        />
      )}
    </>
  );
}
