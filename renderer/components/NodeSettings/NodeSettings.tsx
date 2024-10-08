import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  HStack,
  Spinner,
  Switch,
  useDisclosure,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { ComponentProps, useRef } from "react";
import { useForm } from "react-hook-form";
import { defineMessages, useIntl } from "react-intl";
import { z } from "zod";

import { trpcReact } from "@/providers/TRPCProvider";
import { TextInput } from "@/ui/Forms/TextInput/TextInput";
import { PillButton } from "@/ui/PillButton/PillButton";
import { useIFToast } from "@/ui/Toast/Toast";

const settingsSchema = z.object({
  nodeName: z.string(),
  blockGraffiti: z.string(),
  minPeers: z.number(),
  maxPeers: z.number(),
  nodeWorkers: z.number(),
  blocksPerMessage: z.number(),
  enableTelemetry: z.boolean(),
  transactionExpirationDelta: z.number(),
});

const messages = defineMessages({
  resetNode: {
    defaultMessage: "Reset Node",
  },
  settingsSaved: {
    defaultMessage: "Settings saved",
  },
  nodeNameLabel: {
    defaultMessage: "Node Name",
  },
  blockGraffitiLabel: {
    defaultMessage: "Block Graffiti",
  },
  minPeersLabel: {
    defaultMessage: "Min Peers",
  },
  maxPeersLabel: {
    defaultMessage: "Max Peers",
  },
  nodeWorkersLabel: {
    defaultMessage: "Node Workers",
  },
  blocksPerMessageLabel: {
    defaultMessage: "Blocks Per Message",
  },
  transactionExpirationDeltaLabel: {
    defaultMessage: "Transaction Expiration Delta",
  },
  enableTelemetryLabel: {
    defaultMessage: "Telemetry enabled",
  },
  cancel: {
    defaultMessage: "Cancel",
  },
  areYouSureResetNode: {
    defaultMessage:
      "Are you sure you want to reset the node to its initial state?",
  },
  saveSettings: {
    defaultMessage: "Save Settings",
  },
});

function NodeSettingsContent({
  initialNodeName,
  initialBlockGraffiti,
  initialMinPeers,
  initialMaxPeers,
  initialNodeWorkers,
  initialBlocksPerMessage,
  initialEnableTelemetry,
  initialTransactionExpirationDelta,
}: {
  initialNodeName?: string;
  initialBlockGraffiti?: string;
  initialMinPeers?: number;
  initialMaxPeers?: number;
  initialNodeWorkers?: number;
  initialBlocksPerMessage?: number;
  initialEnableTelemetry?: boolean;
  initialTransactionExpirationDelta?: number;
}) {
  const { formatMessage } = useIntl();
  const router = useRouter();
  const toast = useIFToast();

  const { mutate: setConfig, isLoading: isSetConfigLoading } =
    trpcReact.setConfig.useMutation({
      onSuccess: () => {
        toast({
          message: formatMessage(messages.settingsSaved),
        });
      },
    });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      nodeName: initialNodeName,
      blockGraffiti: initialBlockGraffiti,
      minPeers: initialMinPeers,
      maxPeers: initialMaxPeers,
      nodeWorkers: initialNodeWorkers,
      blocksPerMessage: initialBlocksPerMessage,
      enableTelemetry: initialEnableTelemetry,
      transactionExpirationDelta: initialTransactionExpirationDelta,
    },
  });

  return (
    <>
      <Grid templateColumns="repeat(2, 1fr)" gap={8}>
        <GridItem>
          <TextInput
            label={formatMessage(messages.nodeNameLabel)}
            {...register("nodeName")}
            error={errors.nodeName?.message}
          />
        </GridItem>
        <GridItem>
          <TextInput
            label={formatMessage(messages.blockGraffitiLabel)}
            {...register("blockGraffiti")}
            error={errors.blockGraffiti?.message}
          />
        </GridItem>
        <GridItem>
          <TextInput
            label={formatMessage(messages.minPeersLabel)}
            type="number"
            {...register("minPeers", {
              valueAsNumber: true,
            })}
            error={errors.minPeers?.message}
          />
        </GridItem>
        <GridItem>
          <TextInput
            label={formatMessage(messages.maxPeersLabel)}
            type="number"
            {...register("maxPeers", {
              valueAsNumber: true,
            })}
            error={errors.maxPeers?.message}
          />
        </GridItem>
        <GridItem>
          <TextInput
            label={formatMessage(messages.nodeWorkersLabel)}
            type="number"
            {...register("nodeWorkers", {
              valueAsNumber: true,
            })}
            error={errors.nodeWorkers?.message}
          />
        </GridItem>
        <GridItem>
          <TextInput
            label={formatMessage(messages.blocksPerMessageLabel)}
            type="number"
            {...register("blocksPerMessage", {
              valueAsNumber: true,
            })}
            error={errors.blocksPerMessage?.message}
          />
        </GridItem>
        <GridItem>
          <TextInput
            label={formatMessage(messages.transactionExpirationDeltaLabel)}
            type="number"
            {...register("transactionExpirationDelta", {
              valueAsNumber: true,
            })}
            error={errors.transactionExpirationDelta?.message}
          />
        </GridItem>
      </Grid>
      <FormControl mt={8} display="flex" alignItems="center">
        <Switch mr={4} {...register("enableTelemetry")} />
        <FormLabel mb={0}>
          {formatMessage(messages.enableTelemetryLabel)}
        </FormLabel>
      </FormControl>
      <HStack mt={8} justifyContent="flex-start">
        <PillButton
          isDisabled={false}
          height="60px"
          px={8}
          onClick={() => {
            handleSubmit((values) => {
              const configValues = Object.entries(values).map(
                ([name, value]) => {
                  return {
                    name,
                    value,
                  };
                },
              );
              setConfig({ configValues });
            })();
          }}
        >
          {formatMessage(messages.saveSettings)}
        </PillButton>
        <ResetNodeButton
          forceIsLoading={isSetConfigLoading}
          onSuccess={() => router.push("/home")}
        />
      </HStack>
    </>
  );
}

export function ResetNodeButton({
  forceIsLoading,
  buttonProps,
  onSuccess,
}: {
  forceIsLoading?: boolean;
  buttonProps?: ComponentProps<typeof PillButton>;
  onSuccess?: () => void;
}) {
  const { formatMessage } = useIntl();

  const { mutateAsync: resetNode, isLoading: isResetLoading } =
    trpcReact.resetNode.useMutation();

  const {
    isOpen: isResetNodeModalOpen,
    onOpen: onResetNodeModalOpen,
    onClose: onResetNodeModalClose,
  } = useDisclosure();

  const cancelResetRef = useRef(null);

  const isLoading = isResetLoading || forceIsLoading;

  return (
    <>
      <PillButton
        isDisabled={isLoading}
        onClick={onResetNodeModalOpen}
        variant="inverted"
        height="60px"
        px={8}
        border={0}
        {...buttonProps}
      >
        {formatMessage(messages.resetNode)}
      </PillButton>
      <AlertDialog
        isOpen={isResetNodeModalOpen}
        leastDestructiveRef={cancelResetRef}
        onClose={onResetNodeModalClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {formatMessage(messages.resetNode)}
            </AlertDialogHeader>

            <AlertDialogBody>
              {isLoading ? (
                <HStack justifyContent="center" my={4}>
                  <Spinner opacity="0.5" size="lg" />
                </HStack>
              ) : (
                formatMessage(messages.areYouSureResetNode)
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelResetRef}
                onClick={onResetNodeModalClose}
                isDisabled={isLoading}
              >
                {formatMessage(messages.cancel)}
              </Button>
              <Button
                colorScheme="red"
                onClick={async () => {
                  await resetNode();
                  onSuccess?.();
                }}
                isDisabled={isLoading}
                ml={3}
              >
                {formatMessage(messages.resetNode)}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}

export function NodeSettings() {
  const { data } = trpcReact.getConfig.useQuery();

  if (!data) {
    return null;
  }

  return (
    <NodeSettingsContent
      initialNodeName={data?.nodeName}
      initialBlockGraffiti={data?.blockGraffiti}
      initialMinPeers={data?.minPeers}
      initialMaxPeers={data?.maxPeers}
      initialNodeWorkers={data?.nodeWorkers}
      initialBlocksPerMessage={data?.blocksPerMessage}
      initialEnableTelemetry={data?.enableTelemetry}
      initialTransactionExpirationDelta={data?.transactionExpirationDelta}
    />
  );
}
