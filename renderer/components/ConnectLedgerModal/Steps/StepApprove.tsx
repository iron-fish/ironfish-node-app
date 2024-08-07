import { Heading, Text, Box } from "@chakra-ui/react";
import Image from "next/image";
import { defineMessages, useIntl } from "react-intl";

import approveImage from "./assets/approve.svg";

const messages = defineMessages({
  heading: {
    defaultMessage: "Approve on your Ledger",
  },
  body: {
    defaultMessage:
      "To proceed with connecting your account to the Iron Fish Node app, please approve the request on your Ledger device.",
  },
});

export function StepApprove() {
  const { formatMessage } = useIntl();
  return (
    <>
      <Heading mb={4}>{formatMessage(messages.heading)}</Heading>
      <Image src={approveImage} alt="" />
      <Box mt={6}>
        <Text color="muted" fontSize="md">
          {formatMessage(messages.body)}
        </Text>
      </Box>
    </>
  );
}
