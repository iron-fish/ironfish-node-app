import { Heading } from "@chakra-ui/react";

import { NodeOverview } from "@/components/NodeOverview/NodeOverview";
import { NodeResources } from "@/components/NodeResources/NodeResources";
import { NodeSettings } from "@/components/NodeSettings/NodeSettings";
import MainLayout from "@/layouts/MainLayout";

export default function YourNode() {
  return (
    <MainLayout>
      <Heading>Your Node</Heading>
      <NodeOverview />
      <NodeSettings />
      <NodeResources />
    </MainLayout>
  );
}
