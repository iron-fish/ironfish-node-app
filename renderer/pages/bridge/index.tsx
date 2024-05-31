import { Heading } from "@chakra-ui/react";
import { defineMessages, useIntl } from "react-intl";

import { BridgeAssetsForm } from "@/components/BridgeAssetsForm/BridgeAssetsForm";
import { RetryBoundary } from "@/components/ErrorBoundary/RetryBoundary";
import rainbowFish from "@/images/rainbow-fish.svg";
import MainLayout from "@/layouts/MainLayout";
import { WithExplanatorySidebar } from "@/layouts/WithExplanatorySidebar";

const messages = defineMessages({
  heading: {
    defaultMessage: "Bridge",
  },
  aboutHeading: {
    defaultMessage: "About Bridging",
  },
  aboutContent: {
    defaultMessage:
      "Bridging enables seamless transfers of assets across any EVM network. Simply choose your account, a bridge provider, select the asset and its amount, pick the destination network, and provide the destination address to execute your transfer.",
  },
});

export default function Bridge() {
  const { formatMessage } = useIntl();

  return (
    <MainLayout>
      <Heading fontSize={28} lineHeight="160%" mb={5}>
        {formatMessage(messages.heading)}
      </Heading>

      <WithExplanatorySidebar
        heading={formatMessage(messages.aboutHeading)}
        description={formatMessage(messages.aboutContent)}
        imgSrc={rainbowFish}
      >
        <RetryBoundary>
          <BridgeAssetsForm />
        </RetryBoundary>
      </WithExplanatorySidebar>
    </MainLayout>
  );
}
