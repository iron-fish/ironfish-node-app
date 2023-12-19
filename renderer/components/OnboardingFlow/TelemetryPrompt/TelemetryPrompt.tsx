import {
  Text,
  Box,
  Heading,
  FormControl,
  Switch,
  FormLabel,
  HStack,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { defineMessages, useIntl } from "react-intl";

import { trpcReact } from "@/providers/TRPCProvider";
import { PillButton } from "@/ui/PillButton/PillButton";

const messages = defineMessages({
  telemetry: {
    defaultMessage:
      "We'd like to collect anonymous telemetry data in order to continually improve your experience. This data includes node performance, block information, and other health metrics. You can enable or disable this at any time in the node settings page.",
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
      <Heading mt={24} mb={8}>
        {formatMessage(messages.telemetry)}
      </Heading>

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
          onClick={() => {
            router.push("/onboarding/snapshot-download");
          }}
        >
          {formatMessage(messages.continue)}
        </PillButton>
      </HStack>
    </Box>
  );
}
