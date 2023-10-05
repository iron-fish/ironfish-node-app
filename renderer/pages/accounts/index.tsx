import { Heading } from "@chakra-ui/react";

import { TRPCDemo } from "@/components/TRPCDemo/TRPCDemo";
import MainLayout from "@/layouts/MainLayout";

export default function Accounts() {
  return (
    <MainLayout>
      <Heading>Accounts</Heading>
      <TRPCDemo />
    </MainLayout>
  );
}
