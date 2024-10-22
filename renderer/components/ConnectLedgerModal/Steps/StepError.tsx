import { Heading, Text, Box } from "@chakra-ui/react";
import Image from "next/image";
import { ReactNode } from "react";
import { defineMessages, useIntl } from "react-intl";

import errorImage from "./assets/error.svg";

const messages = defineMessages({
  heading: {
    defaultMessage: "An error occurred",
  },
});

type Props = {
  errorMessage: ReactNode;
};

export function StepError({ errorMessage }: Props) {
  const { formatMessage } = useIntl();
  return (
    <>
      <Heading mb={4}>{formatMessage(messages.heading)}</Heading>
      <Image src={errorImage} alt="" />
      <Box mt={6}>
        {typeof errorMessage === "string" ? (
          <Text color="muted" fontSize="md">
            {errorMessage}
          </Text>
        ) : (
          errorMessage
        )}
      </Box>
    </>
  );
}
