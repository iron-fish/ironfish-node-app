import {
  FormControl,
  FormLabel,
  Switch,
  Heading,
  Text,
  Box,
} from "@chakra-ui/react";
import { defineMessages, useIntl } from "react-intl";

import { useFeatureFlags } from "@/providers/FeatureFlagsProvider";

const messages = defineMessages({
  featureFlags: {
    defaultMessage: "Feature flags",
  },
  featureFlagsDescription: {
    defaultMessage:
      "Feature flags allow you to enable or disable experimental features. These features are not fully tested and may not work as expected.",
  },
});

export function FeatureFlagsList() {
  const { flags, toggleFlag } = useFeatureFlags();
  const { formatMessage } = useIntl();
  console.log({ flags });
  return (
    <Box alignItems="stretch">
      <Heading fontSize="xl" mb={4}>
        Feature flags
      </Heading>
      <Text maxW="50ch">{formatMessage(messages.featureFlagsDescription)}</Text>
      {Object.entries(flags).map(([key, value]) => {
        return (
          <FormControl key={key} mt={8} display="flex" alignItems="center">
            <Switch
              mr={4}
              onChange={() => toggleFlag(key as keyof typeof flags)}
              checked={value}
            />
            <FormLabel mb={0}>{key}</FormLabel>
          </FormControl>
        );
      })}
    </Box>
  );
}
