import { Box, HStack, Heading, Progress, Text } from "@chakra-ui/react";
import { formatDuration } from "date-fns";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { defineMessages, useIntl } from "react-intl";
import { useCountdown } from "usehooks-ts";

import { trpcReact } from "@/providers/TRPCProvider";
import { PillButton } from "@/ui/PillButton/PillButton";
import { LogoLg } from "@/ui/SVGs/LogoLg";
import { NodeAppLogo } from "@/ui/SVGs/NodeAppLogo";

import styles from "./snapshot-download-prompt.module.css";
import { SnapshotUpdate } from "../../../../shared/types";

type ProgressSteps = "prompt" | "download" | "complete";

const messages = defineMessages({
  downloadInProgress: {
    defaultMessage: "Download in progress...",
  },
  downloadDescription: {
    defaultMessage:
      "Downloading a snapshot is the fastest way to sync with the network.",
  },
  mbDownloaded: {
    defaultMessage: "{currMb} / {totalMb} mb",
  },
  unzipping: {
    defaultMessage: "Unzipping...",
  },
  redirectDescription: {
    defaultMessage:
      "You'll automatically be redirected to your accounts page once the snapshot is applied.",
  },
  unzipProgress: {
    defaultMessage: "Unzip progress: {progress}%",
  },
  errorOccurred: {
    defaultMessage: "An error occurred while downloading the snapshot:",
  },
  retryingIn: {
    defaultMessage: "Retrying in {duration}...",
  },
  retryNow: {
    defaultMessage: "Retry now",
  },
  chooseHowToSync: {
    defaultMessage: "Choose how to sync your chain",
  },
  downloadSnapshot: {
    defaultMessage: "Download Snapshot",
  },
  syncFromPeers: {
    defaultMessage: "Sync from Peers",
  },
  snapshotPrompt: {
    defaultMessage:
      "Download Snapshot: Fast and centralized. Get a complete copy of the blockchain quickly from a central source.",
  },
  peersPrompt: {
    defaultMessage:
      "Sync from peers: Slower but decentralized. Retrieve the blockchain from other users, contributing to network decentralization. While it may take longer, it strengthens the network's resilience.",
  },
});

function percent(num: number, total: number) {
  return Math.floor((num / total) * 100);
}

function bytesToMb(bytes: number) {
  return (bytes / 1024 / 1024).toFixed(1);
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
  const { formatMessage } = useIntl();
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
          <Heading mb={8}>{formatMessage(messages.downloadInProgress)}</Heading>
          <Text color="muted" mb={4}>
            {formatMessage(messages.downloadDescription)}
          </Text>
          <Progress
            className={styles.SnapshotDownloadProgress}
            value={percent(snapshotState.currBytes, snapshotState.totalBytes)}
          />
          <HStack mt={4}>
            <Text fontFamily={"monospace"} fontSize={"small"}>
              {formatMessage(messages.mbDownloaded, {
                currMb: bytesToMb(snapshotState.currBytes),
                totalMb: bytesToMb(snapshotState.totalBytes),
              })}
            </Text>
          </HStack>
        </Box>
      )}
      {snapshotState?.step === "unzip" && (
        <Box>
          <Heading mb={8}>{formatMessage(messages.unzipping)}</Heading>
          <Text color="muted" mb={4}>
            {formatMessage(messages.redirectDescription)}
          </Text>
          <Progress
            className={styles.SnapshotDownloadProgress}
            value={percent(
              snapshotState.currEntries,
              snapshotState.totalEntries,
            )}
          />
          <Text textAlign="right">
            {formatMessage(messages.unzipProgress, {
              progress: percent(
                snapshotState.currEntries,
                snapshotState.totalEntries,
              ),
            })}
          </Text>
        </Box>
      )}
      {error && (
        <Box mt={8}>
          <Text>{formatMessage(messages.errorOccurred)}</Text>
          <Text>{error}</Text>
          {count > 0 && (
            <Box mt={4}>
              <Text mb={2}>
                {formatMessage(messages.retryingIn, {
                  duration: retryDuration,
                })}
              </Text>
              <PillButton onClick={downloadAndResubscribe}>
                {formatMessage(messages.retryNow)}
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
  const { formatMessage } = useIntl();
  return (
    <Box>
      <HStack alignItems="flex-start" mb={16}>
        <LogoLg />
        <NodeAppLogo />
      </HStack>
      <Heading mb={8}>{formatMessage(messages.chooseHowToSync)}</Heading>
      <Text mb={4}>{formatMessage(messages.snapshotPrompt)}</Text>
      <Text mb={8}>{formatMessage(messages.peersPrompt)}</Text>
      <HStack gap={8}>
        <PillButton onClick={onSnapshot}>
          {formatMessage(messages.downloadSnapshot)}
        </PillButton>
        <PillButton onClick={onPeers}>
          {formatMessage(messages.syncFromPeers)}
        </PillButton>
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
