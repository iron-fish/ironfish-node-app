import { FlexProps } from "@chakra-ui/react";
import { defineMessages, useIntl } from "react-intl";

import { BaseLink } from "./BaseLink";

const messages = defineMessages({
  title: {
    defaultMessage: "Release Notes",
  },
});

export function ReleaseNotesLink(props: FlexProps) {
  const { formatMessage } = useIntl();

  return (
    <BaseLink
      title={formatMessage(messages.title)}
      icon={
        <svg width="11" height="13" viewBox="0 0 11 13" fill="none">
          <path
            d="M2.92297 13V11.4617L7.67675 6.78167L9.23934 8.32L4.48556 13H2.92297ZM0 8.45V7.15H3.60248V8.45H0ZM10.1857 7.38833L8.62311 5.85L9.26135 5.22167C9.37873 5.10611 9.53278 5.04833 9.72352 5.04833C9.91426 5.04833 10.0683 5.10611 10.1857 5.22167L10.8239 5.85C10.9413 5.96556 11 6.11722 11 6.305C11 6.49278 10.9413 6.64444 10.8239 6.76L10.1857 7.38833ZM0 4.875V3.575H7.34388V4.875H0ZM0 1.3V0H10.3439V1.3H0Z"
            fill="currentColor"
          />
        </svg>
      }
      href="/release-notes"
      {...props}
    />
  );
}
