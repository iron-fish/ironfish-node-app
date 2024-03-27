import {
  Box,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  Switch,
  Text,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { defineMessages, useIntl } from "react-intl";

import { trpcReact } from "@/providers/TRPCProvider";
import { PillButton } from "@/ui/PillButton/PillButton";
import { LogoLg } from "@/ui/SVGs/LogoLg";
import { NodeAppLogo } from "@/ui/SVGs/NodeAppLogo";

const messages = defineMessages({
  telemetry: {
    defaultMessage:
      "We'd like to collect anonymous telemetry data in order to continually improve your experience. This data includes node performance, block information, and other health metrics. You can enable or disable this at any time in the node settings page.",
  },
  telemetryHeading: {
    defaultMessage: "Set up your node",
  },
  telemetryEnabled: {
    defaultMessage: "Telemetry enabled",
  },
  telemetryDisabled: {
    defaultMessage: "Telemetry disabled",
  },
  continue: {
    defaultMessage: "Continue",
  },
});

export function TelemetryPrompt() {
  const router = useRouter();
  const { data: configData } = trpcReact.getConfig.useQuery({
    name: "enableTelemetry",
  });
  const { mutate: startNode } = trpcReact.startNode.useMutation();
  const { data: shouldDownloadSnapshotData, isLoading } =
    trpcReact.shouldDownloadSnapshot.useQuery();

  const { mutate: setConfig } = trpcReact.setConfig.useMutation();
  const { formatMessage } = useIntl();

  const isTelemetryEnabled = configData?.enableTelemetry ?? false;

  const handleChange = useCallback(
    (isEnabled: boolean) => {
      setConfig({
        configValues: [{ name: "enableTelemetry", value: isEnabled }],
        restartAfterSet: false,
      });
    },
    [setConfig],
  );

  return (
    <Box>
      <HStack alignItems="flex-start" mb={16}>
        <LogoLg />
        <NodeAppLogo />
      </HStack>
      <Heading mb={8}>{formatMessage(messages.telemetryHeading)}</Heading>

      <Text mb={4} fontSize="md">
        {formatMessage(messages.telemetry)}
      </Text>

      <FormControl display="flex" alignItems="center" mb={8}>
        <Switch
          mr={4}
          isChecked={!!isTelemetryEnabled}
          onChange={(e) => {
            handleChange(e.target.checked);
          }}
        />
        <FormLabel mb={0}>
          {isTelemetryEnabled
            ? formatMessage(messages.telemetryEnabled)
            : formatMessage(messages.telemetryDisabled)}
        </FormLabel>
      </FormControl>

      <HStack>
        <PillButton
          height="60px"
          px={8}
          isDisabled={isLoading}
          onClick={() => {
            if (shouldDownloadSnapshotData) {
              router.push("/onboarding/snapshot-download");
            } else {
              startNode();
              router.replace("/accounts");
            }
          }}
        >
          {formatMessage(messages.continue)}
        </PillButton>
      </HStack>
    </Box>
  );
}
