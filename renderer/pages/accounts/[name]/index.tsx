import { Box, Heading } from "@chakra-ui/react";
import { useRouter } from "next/router";

import MainLayout from "@/layouts/MainLayout";
import { trpcReact } from "@/providers/TRPCProvider";
import { asQueryString } from "@/utils/parseRouteQuery";

function AccountOverviewContent({ accountName }: { accountName: string }) {
  const { data } = trpcReact.getAccount.useQuery({
    name: accountName,
  });

  if (!data) {
    // @todo: Error handling
    return null;
  }

  return (
    <MainLayout>
      <Box>
        <Heading>{data.name}</Heading>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </Box>
    </MainLayout>
  );
}

export default function AccountOverview() {
  const router = useRouter();
  const accountName = asQueryString(router.query.name);

  if (!accountName) {
    return null;
  }

  return <AccountOverviewContent accountName={accountName} />;
}
