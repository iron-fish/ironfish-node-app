import { Text, Progress, Box, HStack, Heading } from "@chakra-ui/react";
import { formatDuration } from "date-fns";
import { useRouter } from "next/router";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useCountdown } from "usehooks-ts";

import { trpcReact } from "@/providers/TRPCProvider";
import { PillButton } from "@/ui/PillButton/PillButton";
import { LogoLg } from "@/ui/SVGs/LogoLg";
import { NodeAppLogo } from "@/ui/SVGs/NodeAppLogo";

import { SnapshotUpdate } from "../../../../shared/types";

type ProgressSteps = "prompt" | "download" | "complete";

function percent(num: number, total: number) {
  return Math.floor((num / total) * 100);
}

function bytesToMb(bytes: number) {
  return (bytes / 1024 / 1024).toFixed(2);
}

function useBackoff() {
  const [nextInterval, setNextInterval] = useState(5);

  const [count, { startCountdown, resetCountdown }] = useCountdown({
    countStart: nextInterval,
    intervalMs: 1000,
  });

  const increment = useCallback(() => {
    resetCountdown();
    setNextInterval((iv) => iv * 2);
    startCountdown();
  }, [resetCountdown, startCountdown]);

  const reset = useCallback(() => {
    setNextInterval(5);
    resetCountdown();
  }, [resetCountdown]);

  return useMemo(
    () => ({ count, increment, reset }),
    [count, increment, reset],
  );
}

function DownloadProgress({ onSuccess }: { onSuccess: () => void }) {
  const [snapshotState, setSnapshotState] = useState<SnapshotUpdate>();
  const { mutate: downloadSnapshot } = trpcReact.downloadSnapshot.useMutation();
  const [error, setError] = useState<string>();

  // used to restart the subscription -- replace if there's another way to trigger the
  // subscription to reconnect
  const [subscriptionId, setSubscriptionId] = useState(0);
  const { count, increment, reset } = useBackoff();

  trpcReact.snapshotProgress.useSubscription(
    { id: subscriptionId },
    {
      onData: (data) => {
        setSnapshotState(data);
        setError("");
        reset();
      },
      onError: (err) => {
        console.log(err);
        setError(err.message);
        increment();
      },
    },
  );

  const downloadAndResubscribe = useCallback(() => {
    setSubscriptionId((s) => ++s);
    downloadSnapshot();
  }, [downloadSnapshot]);

  useEffect(() => {
    if (count === 0) {
      downloadAndResubscribe();
    }
  }, [count, downloadAndResubscribe]);

  useEffect(() => {
    if (snapshotState?.step === "complete") {
      onSuccess();
    }
  }, [onSuccess, snapshotState?.step]);

  const retryDuration = formatDuration({ seconds: count });

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
      {error && (
        <Box mt={8}>
          <Text>An error occurred while downloading the snapshot:</Text>
          <Text>{error}</Text>
          {count > 0 && (
            <Box mt={4}>
              <Text mb={2}>Retrying in {retryDuration}...</Text>
              <PillButton onClick={downloadAndResubscribe}>
                Retry now
              </PillButton>
            </Box>
          )}
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
      <HStack alignItems="flex-start" mb={16}>
        <LogoLg />
        <NodeAppLogo />
      </HStack>
      <Heading mb={8}>Choose how to sync your chain</Heading>
      <Text mb={4}>
        Download Snapshot: Fast and centralized. Get a complete copy of the
        blockchain quickly from a central source.
      </Text>
      <Text mb={8}>
        Sync from peers: Slower but decentralized. Retrieve the blockchain from
        other users, contributing to network decentralization. While it may take
        longer, it strengthens the network&apos;s resilience.
      </Text>
      <HStack gap={8}>
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
