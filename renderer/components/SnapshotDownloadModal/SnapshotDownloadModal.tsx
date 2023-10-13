import {
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  Progress,
  Box,
  HStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

import { trpcReact } from "@/providers/TRPCProvider";

import { SnapshotUpdate } from "../../../shared/types";

type ModalSteps = "prompt" | "download" | "complete";

function PromptUser({
  onPeers,
  onSnapshot,
}: {
  onPeers: () => void;
  onSnapshot: () => void;
}) {
  return (
    <ModalContent>
      <ModalHeader>Sync Node</ModalHeader>
      <ModalBody>
        <Text>How would you like to sync your node</Text>
      </ModalBody>

      <ModalFooter>
        <Button colorScheme="blue" mr={3} onClick={onPeers}>
          Download From Peers
        </Button>
        <Button variant="ghost" onClick={onSnapshot}>
          Download Snapshot
        </Button>
      </ModalFooter>
    </ModalContent>
  );
}

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
      // @todo: Handle error with error boundary
      console.log(err);
    },
  });

  useEffect(() => {
    if (snapshotState?.step === "complete") {
      onSuccess();
    }
  }, [onSuccess, snapshotState?.step]);

  return (
    <ModalContent>
      <ModalHeader>Sync Node</ModalHeader>
      <ModalBody>
        {snapshotState?.step === "download" && (
          <Box>
            <Text>Download in progress...</Text>
            <Progress
              value={percent(snapshotState.currBytes, snapshotState.totalBytes)}
            />
            <HStack>
              <Text>
                {bytesToMb(snapshotState.currBytes)} /{" "}
                {bytesToMb(snapshotState.totalBytes)} mb downloaded
              </Text>
            </HStack>
          </Box>
        )}
        {snapshotState?.step === "unzip" && (
          <Box>
            <Text>Unzipping...</Text>
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
      </ModalBody>
    </ModalContent>
  );
}

export function SnapshotDownloadModal({
  onPeers,
  onSuccess,
}: {
  onPeers: () => void;
  onSuccess: () => void;
}) {
  const [currentStep, setCurrentStep] = useState<ModalSteps>("prompt");
  const mutation = trpcReact.downloadSnapshot.useMutation();

  return (
    <Modal isOpen={true} onClose={() => null}>
      <ModalOverlay />
      {currentStep === "prompt" && (
        <PromptUser
          onPeers={onPeers}
          onSnapshot={() => {
            mutation.mutate();
            setCurrentStep("download");
          }}
        />
      )}
      {currentStep === "download" && <DownloadProgress onSuccess={onSuccess} />}
    </Modal>
  );
}
