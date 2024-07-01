import { defineMessages, useIntl } from "react-intl";

import { EmptyStateMessage } from "../EmptyStateMessage";

const messages = defineMessages({
  heading: {
    defaultMessage: "No accounts with send permissions",
  },
  description: {
    defaultMessage:
      "You don't have any accounts that can send transactions. You must create a new account or import an account with send permissions before you can send assets.",
  },
});

export function NoSpendingAccountsMessage() {
  const { formatMessage } = useIntl();
  return (
    <EmptyStateMessage
      py={8}
      heading={formatMessage(messages.heading)}
      description={formatMessage(messages.description)}
    />
  );
}
