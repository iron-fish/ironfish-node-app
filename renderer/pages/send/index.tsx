import { Heading } from "@chakra-ui/react";
import { defineMessages, useIntl } from "react-intl";

import { SendAssetsForm } from "@/components/SendAssetsForm/SendAssetsForm";
import treasureChest from "@/images/treasure-chest.svg";
import MainLayout from "@/layouts/MainLayout";
import { WithExplanatorySidebar } from "@/layouts/WithExplanatorySidebar";
const messages = defineMessages({
  heading: {
    defaultMessage: "Send",
  },
  aboutFees: {
    defaultMessage: "About Fees",
  },
  feeAmount: {
    defaultMessage:
      "You can change the fee amount you'd like to pay. However, that will directly correlate with the speed with which your transaction is picked up by the blockchain.",
  },
});

export default function Send() {
  const { formatMessage } = useIntl();

  return (
    <MainLayout>
      <Heading fontSize={28} lineHeight="160%" mb={5}>
        {formatMessage(messages.heading)}
      </Heading>
      <WithExplanatorySidebar
        heading={formatMessage(messages.aboutFees)}
        description={formatMessage(messages.feeAmount)}
        imgSrc={treasureChest}
      >
        <SendAssetsForm />
      </WithExplanatorySidebar>
    </MainLayout>
  );
}
