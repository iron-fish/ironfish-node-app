import { defineMessages, useIntl } from "react-intl";

export const CARET_WIDTH = "55px";

export const messages = defineMessages({
  action: {
    defaultMessage: "Action",
  },
  amount: {
    defaultMessage: "Amount",
  },
  fromTo: {
    defaultMessage: "From/To",
  },
  date: {
    defaultMessage: "Date",
  },
  memo: {
    defaultMessage: "Memo",
  },
  sent: {
    defaultMessage: "Sent",
  },
  received: {
    defaultMessage: "Received",
  },
  pending: {
    defaultMessage: "Pending",
  },
  expired: {
    defaultMessage: "Expired",
  },
  multipleRecipients: {
    defaultMessage: "Multiple recipients",
  },
  multipleMemos: {
    defaultMessage: "Multiple memos",
  },
  change: {
    defaultMessage: "Change",
    description:
      "Change as in the money that is returned to the sender after a transaction",
  },
});

export function useHeadingsText() {
  const { formatMessage } = useIntl();
  return [
    formatMessage(messages.action),
    formatMessage(messages.amount),
    formatMessage(messages.fromTo),
    formatMessage(messages.date),
    formatMessage(messages.memo),
  ];
}
