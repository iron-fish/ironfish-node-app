import {
  Heading,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Tab,
} from "@chakra-ui/react";
import { FormattedMessage } from "react-intl";

import { NodeOverview } from "@/components/NodeOverview/NodeOverview";
import { NodeResources } from "@/components/NodeResources/NodeResources";
import { NodeSettings } from "@/components/NodeSettings/NodeSettings";
import computerMonitor from "@/images/computer-monitor.svg";
import MainLayout from "@/layouts/MainLayout";
import { WithExplanatorySidebar } from "@/layouts/WithExplanatorySidebar";

export default function YourNode() {
  return (
    <MainLayout>
      <Heading>
        <FormattedMessage defaultMessage="Your Node" />
      </Heading>
      <Tabs isLazy>
        <TabList mb={8}>
          <Tab py={2} px={4} mr={4}>
            <FormattedMessage defaultMessage="Overview" />
          </Tab>
          <Tab py={2} px={4} mr={4}>
            <FormattedMessage defaultMessage="Settings" />
          </Tab>
          <Tab py={2} px={4} mr={4}>
            <FormattedMessage defaultMessage="Resources" />
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={0}>
            <NodeOverview />
          </TabPanel>
          <TabPanel p={0}>
            <WithExplanatorySidebar
              heading={<FormattedMessage defaultMessage="Node Settings" />}
              description={
                <WithExplanatorySidebar.Description>
                  <FormattedMessage defaultMessage="Changing node settings can optimize performance, improve connectivity, enhance security, and manage resources effectively." />
                </WithExplanatorySidebar.Description>
              }
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
