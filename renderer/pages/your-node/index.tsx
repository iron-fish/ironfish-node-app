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
import MainLayout from "@/layouts/MainLayout";

export default function YourNode() {
  return (
    <MainLayout>
      <Heading>
        <FormattedMessage defaultMessage="Your Node" />
      </Heading>
      <Tabs>
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
            <NodeSettings />
          </TabPanel>
          <TabPanel p={0}>
            <NodeResources />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </MainLayout>
  );
}
