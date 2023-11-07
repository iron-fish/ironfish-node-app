import { Box, Heading } from "@chakra-ui/react";
import Link from "next/link";

export function ImportAccount() {
  return (
    <Box>
      <Link href="/onboarding">Back</Link>
      <Heading mt={24} mb={8}>
        Import Account WIP
      </Heading>
    </Box>
  );
}
