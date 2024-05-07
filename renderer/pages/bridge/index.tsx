import { Heading } from "@chakra-ui/react";
import { defineMessages, useIntl } from "react-intl";

import MainLayout from "@/layouts/MainLayout";

const messages = defineMessages({
  heading: {
    defaultMessage: "Bridge",
  },
});

export default function Bridge() {
  const { formatMessage } = useIntl();
  return (
    <MainLayout>
      <Heading fontSize={28} lineHeight="160%" mb={5}>
        {formatMessage(messages.heading)}
      </Heading>
    </MainLayout>
  );
}
