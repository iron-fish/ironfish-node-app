import {
  Heading,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Tab,
  Flex,
  Box,
  Text,
} from "@chakra-ui/react";
import Image from "next/image";
import { FormattedMessage } from "react-intl";

import { NodeOverview } from "@/components/NodeOverview/NodeOverview";
import { NodeResources } from "@/components/NodeResources/NodeResources";
import { NodeSettings } from "@/components/NodeSettings/NodeSettings";
import computerMonitor from "@/images/computer-monitor.svg";
import MainLayout from "@/layouts/MainLayout";
import { COLORS } from "@/ui/colors";

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
            <Flex gap={16}>
              <Box
                maxW={{
                  base: "100%",
                  lg: "592px",
                }}
                w="100%"
              >
                <NodeSettings />
              </Box>
              <Box
                display={{
                  base: "none",
                  lg: "block",
                }}
              >
                <Heading fontSize="2xl" mb={4}>
                  <FormattedMessage defaultMessage="Node Settings" />
                </Heading>
                <Text
                  fontSize="sm"
                  maxW="340px"
                  mb={16}
                  color={COLORS.GRAY_MEDIUM}
                >
                  <FormattedMessage defaultMessage="Changing node settings can optimize performance, improve connectivity, enhance security, and manage resources effectively." />
                </Text>
                <Image src={computerMonitor} alt="" />
              </Box>
            </Flex>
          </TabPanel>
          <TabPanel p={0}>
            <NodeResources />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </MainLayout>
  );
}
