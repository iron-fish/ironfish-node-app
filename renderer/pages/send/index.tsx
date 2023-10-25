import { Heading } from "@chakra-ui/react";

import { SendAssetsForm } from "@/components/SendAssetsForm/SendAssetsForm";
import MainLayout from "@/layouts/MainLayout";

export default function Send() {
  return (
    <MainLayout>
      <Heading mb={5}>Send</Heading>
      <SendAssetsForm />
    </MainLayout>
  );
}
