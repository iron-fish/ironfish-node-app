import {
  Heading,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Tab,
} from "@chakra-ui/react";
import { defineMessages, useIntl } from "react-intl";

import { FeatureFlagsList } from "@/components/FeatureFlagsList/FeatureFlagsList";
import { LanguageSelector } from "@/components/LanguageSelector/LanguageSelector";
import { NetworkSelector } from "@/components/NetworkSelector/NetworkSelector";
import candyIronFish from "@/images/candy-iron-fish.svg";
import flagFish from "@/images/flag-fish.svg";
import languageBubble from "@/images/language-bubble.svg";
import sunMoon from "@/images/sun-moon.svg";
import MainLayout from "@/layouts/MainLayout";
import { WithExplanatorySidebar } from "@/layouts/WithExplanatorySidebar";
import { useFeatureFlags } from "@/providers/FeatureFlagsProvider";
import { DarkModeSettingsCard } from "@/ui/DarkModeSwitch/DarkModeSettingsCard";

const messages = defineMessages({
  heading: {
    defaultMessage: "Settings",
  },
  networkTab: {
    defaultMessage: "Network",
  },
  networkDescription: {
    defaultMessage:
      "You can choose between Mainnet, our live network where real transactions take place, and Testnet, a safe environment ideal for experimenting with new features and learning to use the node app without any risk.",
  },
  languageTab: {
    defaultMessage: "Language",
  },
  languageDescription: {
    defaultMessage:
      "The Iron Fish Node App supports multiple languages. If your preferred language isn't listed, please reach out and let us know!",
  },
  themeTab: {
    defaultMessage: "Theme",
  },
  themeDescription: {
    defaultMessage: "Switch between light and dark mode.",
  },
  featureFlagsTab: {
    defaultMessage: "Feature flags",
  },
  featureFlagsDescription: {
    defaultMessage:
      "Feature flags allow you to enable or disable experimental features. These features are not fully tested and may not work as expected.",
  },
});

export default function YourNode() {
  const { formatMessage } = useIntl();
  const { areFlagsEnabled } = useFeatureFlags();

  return (
    <MainLayout>
      <Heading fontSize={28} lineHeight="160%">
        {formatMessage(messages.heading)}
      </Heading>
      <Tabs isLazy>
        <TabList mt={3} mb={8}>
          <Tab>{formatMessage(messages.networkTab)}</Tab>
          <Tab>{formatMessage(messages.languageTab)}</Tab>
          <Tab>{formatMessage(messages.themeTab)}</Tab>
          {areFlagsEnabled && (
            <Tab>{formatMessage(messages.featureFlagsTab)}</Tab>
          )}
        </TabList>

        <TabPanels>
          <TabPanel p={0}>
            <WithExplanatorySidebar
              heading={formatMessage(messages.networkTab)}
              description={formatMessage(messages.networkDescription)}
              imgSrc={candyIronFish}
            >
              <NetworkSelector />
            </WithExplanatorySidebar>
          </TabPanel>
          <TabPanel p={0}>
            <WithExplanatorySidebar
              heading={formatMessage(messages.languageTab)}
              description={formatMessage(messages.languageDescription)}
              imgSrc={languageBubble}
            >
              <LanguageSelector />
            </WithExplanatorySidebar>
          </TabPanel>
          <TabPanel p={0}>
            <WithExplanatorySidebar
              heading={formatMessage(messages.themeTab)}
              description={formatMessage(messages.themeDescription)}
              imgSrc={sunMoon}
            >
              <DarkModeSettingsCard />
            </WithExplanatorySidebar>
          </TabPanel>
          {areFlagsEnabled && (
            <TabPanel p={0}>
              <WithExplanatorySidebar
                heading={formatMessage(messages.featureFlagsTab)}
                description={formatMessage(messages.featureFlagsDescription)}
                imgSrc={flagFish}
              >
                <FeatureFlagsList />
              </WithExplanatorySidebar>
            </TabPanel>
          )}
        </TabPanels>
      </Tabs>
    </MainLayout>
  );
}
