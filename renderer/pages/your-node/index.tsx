import {
  Heading,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Tab,
} from "@chakra-ui/react";
import { defineMessages, useIntl } from "react-intl";

import { NodeOverview } from "@/components/NodeOverview/NodeOverview";
import { NodeResources } from "@/components/NodeResources/NodeResources";
import { NodeSettings } from "@/components/NodeSettings/NodeSettings";
import computerMonitor from "@/images/computer-monitor.svg";
import MainLayout from "@/layouts/MainLayout";
import { WithExplanatorySidebar } from "@/layouts/WithExplanatorySidebar";

const messages = defineMessages({
  yourNode: {
    defaultMessage: "Your Node",
  },
  overview: {
    defaultMessage: "Overview",
  },
  settings: {
    defaultMessage: "Settings",
  },
  resources: {
    defaultMessage: "Resources",
  },
  nodeSettings: {
    defaultMessage: "Node Settings",
  },
  nodeSettingsDescription: {
    defaultMessage:
      "Changing node settings can optimize performance, improve connectivity, enhance security, and manage resources effectively.",
  },
});

export default function YourNode() {
  const { formatMessage } = useIntl();

  return (
    <MainLayout>
      <Heading fontSize={28} lineHeight="160%">
        {formatMessage(messages.yourNode)}
      </Heading>
      <Tabs isLazy>
        <TabList mt={3} mb={8}>
          <Tab>{formatMessage(messages.overview)}</Tab>
          <Tab>{formatMessage(messages.settings)}</Tab>
          <Tab>{formatMessage(messages.resources)}</Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={0}>
            <NodeOverview />
          </TabPanel>
          <TabPanel p={0}>
            <WithExplanatorySidebar
              heading={formatMessage(messages.nodeSettings)}
              description={formatMessage(messages.nodeSettingsDescription)}
              imgSrc={computerMonitor}
            >
              <NodeSettings />
            </WithExplanatorySidebar>
          </TabPanel>
          <TabPanel p={0}>
            <NodeResources />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </MainLayout>
  );
}
