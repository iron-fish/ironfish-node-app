import { defineMessages, useIntl } from "react-intl";

import { EmptyStateMessage } from "../EmptyStateMessage";

const messages = defineMessages({
  heading: {
    defaultMessage: "You don't have any accounts",
  },
  description: {
    defaultMessage:
      "All your accounts will be displayed in this section. To create or import an account, simply click one of the buttons above.",
  },
});

export function NoAccountsMessage() {
  const { formatMessage } = useIntl();
  return (
    <EmptyStateMessage
      py={8}
      heading={formatMessage(messages.heading)}
      description={formatMessage(messages.description)}
    />
  );
}
