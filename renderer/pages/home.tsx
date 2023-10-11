import {
  Button,
  Link as ChakraLink,
  HStack,
  Heading,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useCallback, useEffect } from "react";

import { SnapshotDownloadModal, useShouldPromptForSnapshotDownload } from "@/components/SnapshotDownloadModal/SnapshotDownloadModal";

/**
 * When a user starts the app, they land on the Home page
 * 
 * - If the user does not have an account, they should be routed to the create account flow
 * - If the user's node is in an error state, they should be routed to the error page where they can restart the node
 * - When the user lands on Home, we check if they're eligible for a snapshot download?
 */

export default function Home() {
  const router = useRouter();
  const { isReady: isSnapshotQueryReady, shouldPrompt } = useShouldPromptForSnapshotDownload();

  console.log({isSnapshotQueryReady, shouldPrompt})

  useEffect(() => {
    if (!isSnapshotQueryReady || shouldPrompt) return;

    router.replace("/accounts")
  }, [router, isSnapshotQueryReady, shouldPrompt])

  const handleSyncFromPeers = useCallback(() => {
    console.log('Syncing from peers')
  }, [])

  const handleSnapshotSuccess = useCallback(() => {
    router.replace("/accounts");
  }, [router])

  if (!isSnapshotQueryReady) {
    return "Loading..."
  }

  return (
    <React.Fragment>
      <VStack minH="100vh" justifyContent="center">
        <Heading>Home page</Heading>
        <HStack>
          <Button
            as={ChakraLink}
            href="/accounts"
            variant="solid"
            colorScheme="teal"
            rounded="button"
            width="full"
          >
            Go to accounts
          </Button>
          {shouldPrompt && <SnapshotDownloadModal onPeers={handleSyncFromPeers} onSuccess={handleSnapshotSuccess} />}
        </HStack>
      </VStack>
    </React.Fragment>
  );
}
