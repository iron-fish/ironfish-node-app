import { HStack, Text } from "@chakra-ui/react";

import { SettingsCard } from "@/components/AppSettings/SettingsCard";

import { DarkModeSwitch } from "./DarkModeSwitch";
import { COLORS } from "../colors";

export function DarkModeSettingsCard() {
  return (
    <SettingsCard>
      <HStack>
        <HStack flexGrow={1}>
          <Text
            fontSize="md"
            color={COLORS.GRAY_MEDIUM}
            _dark={{
              color: COLORS.DARK_MODE.GRAY_LIGHT,
            }}
          >
            Theme:
          </Text>
          <Text
            fontSize="md"
            _dark={{
              color: COLORS.WHITE,
            }}
          >
            Light
          </Text>
        </HStack>
        <DarkModeSwitch />
      </HStack>
    </SettingsCard>
  );
}
