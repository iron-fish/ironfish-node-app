import { HStack, Text, useColorMode } from "@chakra-ui/react";
import { defineMessages, useIntl } from "react-intl";

import { SettingsCard } from "@/components/AppSettings/SettingsCard";

import { DarkModeSwitch } from "./DarkModeSwitch";
import { COLORS } from "../colors";

const messages = defineMessages({
  theme: {
    defaultMessage: "Theme",
  },
  light: {
    defaultMessage: "Light",
  },
  dark: {
    defaultMessage: "Dark",
  },
});

export function DarkModeSettingsCard() {
  const { colorMode } = useColorMode();
  const { formatMessage } = useIntl();
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
            {formatMessage(messages.theme)}:
          </Text>
          <Text
            fontSize="md"
            _dark={{
              color: COLORS.WHITE,
            }}
          >
            {colorMode === "light"
              ? formatMessage(messages.light)
              : formatMessage(messages.dark)}
          </Text>
        </HStack>
        <DarkModeSwitch />
      </HStack>
    </SettingsCard>
  );
}
