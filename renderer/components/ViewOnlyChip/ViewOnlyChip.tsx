import { defineMessages, useIntl } from "react-intl";

import { InfoChip } from "@/ui/InfoChip/InfoChip";

const messages = defineMessages({
  viewOnly: {
    defaultMessage: "View Only",
  },
  viewOnlyTooltip: {
    defaultMessage: "View only accounts cannot initiate transactions",
  },
});
export function ViewOnlyChip() {
  const { formatMessage } = useIntl();

  return (
    <InfoChip
      label={formatMessage(messages.viewOnly)}
      tooltipMessage={formatMessage(messages.viewOnlyTooltip)}
    />
  );
}
