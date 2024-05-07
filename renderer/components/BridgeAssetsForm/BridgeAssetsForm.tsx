import { VStack } from "@chakra-ui/react";
import { useForm } from "react-hook-form";

import { Select } from "@/ui/Forms/Select/Select";

export function BridgeAssetsForm() {
  const { register } = useForm();
  return (
    <VStack gap={4} alignItems="stretch">
      <Select
        {...register("fromAccount")}
        value={"0x123"}
        label="From Account"
        options={[]}
        error={null}
      />
    </VStack>
  );
}
