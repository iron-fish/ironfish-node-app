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
        <svg
          width="17"
          height="14"
          viewBox="0 0 17 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8.41816 14V12.3433L13.4691 7.30333L15.1293 8.96L10.0784 14H8.41816ZM0 9.1V7.7H7.01513V9.1H0ZM16.1348 7.95667L14.4746 6.3L15.1527 5.62333C15.2774 5.49889 15.4411 5.43667 15.6437 5.43667C15.8464 5.43667 16.0101 5.49889 16.1348 5.62333L16.8129 6.3C16.9376 6.42444 17 6.58778 17 6.79C17 6.99222 16.9376 7.15556 16.8129 7.28L16.1348 7.95667ZM0 5.25V3.85H10.9904V5.25H0ZM0 1.4V0H10.9904V1.4H0Z"
            fill="currentColor"
          />
        </svg>
      }
      href="/release-notes"
      {...props}
    />
  );
}
