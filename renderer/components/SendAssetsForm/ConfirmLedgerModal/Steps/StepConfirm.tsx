import { Heading } from "@chakra-ui/react";
import Image from "next/image";
import { useIntl, defineMessages } from "react-intl";

import connectImage from "./assets/connect.svg";

const messages = defineMessages({
  heading: {
    defaultMessage: "Please approve the transaction on your device.",
  },
});

export function StepConfirm() {
  const { formatMessage } = useIntl();
  return (
    <>
      <Heading mb={4}>{formatMessage(messages.heading)}</Heading>
      <Image src={connectImage} alt="" />
    </>
  );
}
