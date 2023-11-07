import { Text, Progress, Box, HStack, Heading } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";

import { trpcReact } from "@/providers/TRPCProvider";
import { PillButton } from "@/ui/PillButton/PillButton";

import { SnapshotUpdate } from "../../../../shared/types";

type ProgressSteps = "prompt" | "download" | "complete";

function percent(num: number, total: number) {
  return Math.floor((num / total) * 100);
}

function bytesToMb(bytes: number) {
  return (bytes / 1024 / 1024).toFixed(2);
}

function DownloadProgress({ onSuccess }: { onSuccess: () => void }) {
  const [snapshotState, setSnapshotState] = useState<SnapshotUpdate>();
  trpcReact.snapshotProgress.useSubscription(undefined, {
    onData: (data) => {
      setSnapshotState(data);
    },
    onError: (err) => {
      // @todo: Handle error
      console.log(err);
    },
  });

  useEffect(() => {
    if (snapshotState?.step === "complete") {
      onSuccess();
    }
  }, [onSuccess, snapshotState?.step]);

  return (
    <Box>
      {snapshotState?.step === "download" && (
        <Box>
          <Heading mb={8}>Download in progress...</Heading>
          <Text mb={8}>
            Downloading a snapshot is the fastest way to sync with the network.
          </Text>
          <Progress
            value={percent(snapshotState.currBytes, snapshotState.totalBytes)}
          />
          <HStack mt={4}>
            <Text>
              {bytesToMb(snapshotState.currBytes)} /{" "}
              {bytesToMb(snapshotState.totalBytes)} mb downloaded
            </Text>
          </HStack>
        </Box>
      )}
      {snapshotState?.step === "unzip" && (
        <Box>
          <Heading mb={8}>Unzipping...</Heading>
          <Text mb={8}>
            You&apos;ll automatically be redirected to your accounts page once
            the snapshot is applied.
          </Text>
          <Progress
            value={percent(
              snapshotState.currEntries,
              snapshotState.totalEntries,
            )}
          />
          <Text textAlign="right">
            Unzip progress:{" "}
            {percent(snapshotState.currEntries, snapshotState.totalEntries)}%
          </Text>
        </Box>
      )}
    </Box>
  );
}

function Prompt({
  onPeers,
  onSnapshot,
}: {
  onPeers: () => void;
  onSnapshot: () => void;
}) {
  return (
    <Box>
      <Heading mt={24} mb={8}>
        Syncing your chain
      </Heading>
      <Heading mb={4} fontSize="2xl">
        Choose how to sync your node with the network
      </Heading>
      <Text mb={4}>
        Download Snapshot: Fast and centralized. Get a complete copy of the
        blockchain quickly from a central source.
      </Text>
      <Text mb={8}>
        Sync from peers: Slower but decentralized. Retrieve the blockchain from
        other users, contributing to network decentralization. While it may take
        longer, it strengthens the network&amp;s resilience.
      </Text>
      <HStack>
        <PillButton onClick={onSnapshot}>Download Snapshot</PillButton>
        <PillButton onClick={onPeers}>Sync from Peers</PillButton>
      </HStack>
    </Box>
  );
}

export function SnapshotDownloadPrompt() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<ProgressSteps>("prompt");

  const { mutate: startNode } = trpcReact.startNode.useMutation();
  const { mutate: downloadSnapshot } = trpcReact.downloadSnapshot.useMutation();

  const navigateToAccountsPage = useCallback(() => {
    const handleStart = async () => {
      await startNode();
      router.replace("/accounts");
    };
    handleStart();
  }, [router, startNode]);

  return (
    <Box>
      {currentStep === "prompt" && (
        <Prompt
          onPeers={navigateToAccountsPage}
          onSnapshot={() => {
            downloadSnapshot();
            setCurrentStep("download");
          }}
        />
      )}
      {currentStep === "download" && (
        <DownloadProgress onSuccess={navigateToAccountsPage} />
      )}
    </Box>
  );
}
