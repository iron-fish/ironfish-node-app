import { VStack, Flex, Spinner } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useCallback, useEffect } from "react";

import {
  SnapshotDownloadModal,
  useShouldPromptForSnapshotDownload,
} from "@/components/SnapshotDownloadModal/SnapshotDownloadModal";
import { LogoLg } from "@/ui/SVGs/LogoLg";

/**
 * This component handles initializing the SDK and determining
 * what state the user should be in.
 *
 * - If the user has not created an account, they should go to the account creation flow.
 * - If the user user is behind on syncing, they should be prompted to download a snapshot.
 * - If the user is up to date, they should be redirected to the accounts page.
 */
export default function Home() {
  const router = useRouter();
  const { isReady: isSnapshotQueryReady, shouldPrompt } =
    useShouldPromptForSnapshotDownload();

  useEffect(() => {
    if (!isSnapshotQueryReady || shouldPrompt) return;

    router.replace("/accounts");
  }, [router, isSnapshotQueryReady, shouldPrompt]);

  const handleSyncFromPeers = useCallback(() => {
    console.log("Syncing from peers");
  }, []);

  const handleSnapshotSuccess = useCallback(() => {
    router.replace("/accounts");
  }, [router]);

  if (!isSnapshotQueryReady) {
    return "Loading...";
  }

  return (
    <>
      <Flex h="100vh" justifyContent="center" alignItems="center">
        <VStack gap={10}>
          <LogoLg transform="scale(2)" />
          <Spinner size="lg" />
        </VStack>
      </Flex>
      {shouldPrompt && (
        <SnapshotDownloadModal
          onPeers={handleSyncFromPeers}
          onSuccess={handleSnapshotSuccess}
        />
      )}
    </>
  );
}
