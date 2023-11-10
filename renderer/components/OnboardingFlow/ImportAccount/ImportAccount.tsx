import { Box, Heading } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";

import { trpcReact } from "@/providers/TRPCProvider";

import { MnemonicImport } from "./MnemonicImport";

export function ImportAccount() {
  const router = useRouter();

  const {
    mutate: importAccount,
    isLoading,
    error,
  } = trpcReact.importAccount.useMutation();

  return (
    <Box>
      <Link href="/onboarding">Back</Link>
      <Heading mt={24} mb={8}>
        Import Account
      </Heading>
      <MnemonicImport
        isLoading={isLoading}
        error={error?.shape?.message}
        handleImport={({ name, account }) => {
          importAccount(
            {
              name,
              account,
            },
            {
              onSuccess: () => {
                router.push("/onboarding/snapshot-download");
              },
            },
          );
        }}
      />
    </Box>
  );
}
