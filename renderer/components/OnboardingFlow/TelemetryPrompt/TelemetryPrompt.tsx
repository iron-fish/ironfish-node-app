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
import { FormattedMessage } from "react-intl";

import { trpcReact } from "@/providers/TRPCProvider";
import { PillButton } from "@/ui/PillButton/PillButton";

export function TelemetryPrompt() {
  const router = useRouter();
  const { data: configData } = trpcReact.getConfig.useQuery({
    name: "enableTelemetry",
  });
  const { mutate: setConfig } = trpcReact.setConfig.useMutation();

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
        <FormattedMessage defaultMessage="Telemetry" />
      </Heading>

      <Text mb={4} fontSize="md">
        <FormattedMessage defaultMessage=" We'd like to collect anonymous telemetry data in order to continually improve your experience. This data includes node performance, block information, and other health metrics. You can enable or disable this at any time in the node settings page." />
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
          {isTelemetryEnabled ? (
            <FormattedMessage defaultMessage="Telemetry enabled" />
          ) : (
            <FormattedMessage defaultMessage="Telemetry disabled" />
          )}
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
          Continue
        </PillButton>
      </HStack>
    </Box>
  );
}
