import { defineMessages, useIntl } from "react-intl";

import { InfoChip } from "@/ui/InfoChip/InfoChip";

const messages = defineMessages({
  customNameLabel: {
    defaultMessage: "Custom account name?",
  },
  customNameTooltip: {
    defaultMessage:
      "Turn this on if you want to specify a custom name for this account. Otherwise, the account name will be inferred from your exported account data.",
  },
});

export function CustomNameChip() {
  const { formatMessage } = useIntl();

  return (
    <InfoChip
      label={formatMessage(messages.customNameLabel)}
      tooltipMessage={formatMessage(messages.customNameTooltip)}
    />
  );
}
