import { Flex } from "@chakra-ui/react";

import { PillButton } from "@/ui/PillButton/PillButton";

type SigningRole = "participant" | "coordinator";

export function SelectRole({
  onChange,
}: {
  onChange: (role: SigningRole) => void;
}) {
  return (
    <Flex>
      <PillButton
        type="submit"
        height="60px"
        px={8}
        marginRight={6}
        onClick={() => onChange("participant")}
      >
        {"Participant"}
      </PillButton>
      <PillButton
        type="submit"
        height="60px"
        px={8}
        onClick={() => onChange("coordinator")}
      >
        {"Coordinator"}
      </PillButton>
    </Flex>
  );
}
