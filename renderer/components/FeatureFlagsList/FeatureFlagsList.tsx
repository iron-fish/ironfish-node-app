import {
  FormControl,
  FormLabel,
  Switch,
  HStack,
  VStack,
  Text,
} from "@chakra-ui/react";

import { useFeatureFlags } from "@/providers/FeatureFlagsProvider";
import { COLORS } from "@/ui/colors";

import { SettingsCard } from "../AppSettings/SettingsCard";

export function FeatureFlagsList() {
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
