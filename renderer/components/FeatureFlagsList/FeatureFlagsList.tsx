import {
  FormControl,
  FormLabel,
  Switch,
  HStack,
  VStack,
  Text,
} from "@chakra-ui/react";
import { defineMessages, useIntl } from "react-intl";

import { useFeatureFlags } from "@/providers/FeatureFlagsProvider";
import { COLORS } from "@/ui/colors";

import { SettingsCard } from "../AppSettings/SettingsCard";

const messages = defineMessages({
  turnOnFeatureFlags: {
    defaultMessage: "Turn on feature flags",
  },
  turnOffFeatureFlags: {
    defaultMessage: "Turn off feature flags",
  },
});

export function FeatureFlags() {
  const { areFlagsEnabled, toggleFeatureFlags } = useFeatureFlags();
  const { formatMessage } = useIntl();
  return (
    <>
      <Text>Toggle Feature Flags</Text>
      <SettingsCard mb={4}>
        <Switch
          flexDirection="row-reverse"
          isChecked={areFlagsEnabled}
          onChange={toggleFeatureFlags}
        >
          {areFlagsEnabled
            ? formatMessage(messages.turnOffFeatureFlags)
            : formatMessage(messages.turnOnFeatureFlags)}
        </Switch>
      </SettingsCard>
      {areFlagsEnabled && <FeatureFlagsList />}
    </>
  );
}

function FeatureFlagsList() {
  const { flags, toggleFlag } = useFeatureFlags();

  return (
    <VStack alignItems="stretch" gap={4}>
      {Object.entries(flags).map(([key, flag]) => {
        return (
          <FormControl key={key}>
            <SettingsCard>
              <HStack justifyContent="space-between" gap={4}>
                <VStack>
                  <FormLabel mb={0}>
                    <Text
                      display="block"
                      as="span"
                      fontSize="md"
                      _dark={{
                        color: COLORS.WHITE,
                      }}
                    >
                      {flag.name}
                    </Text>
                    <Text
                      as="span"
                      color={COLORS.GRAY_MEDIUM}
                      _dark={{
                        color: COLORS.DARK_MODE.GRAY_LIGHT,
                      }}
                    >
                      {flag.description}
                    </Text>
                  </FormLabel>
                </VStack>
                <Switch
                  mr={4}
                  onChange={() => toggleFlag(key as keyof typeof flags)}
                  isChecked={flag.enabled}
                />
              </HStack>
            </SettingsCard>
          </FormControl>
        );
      })}
    </VStack>
  );
}
