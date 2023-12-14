import {
  Box,
  Grid,
  GridItem,
  LightMode,
  Text,
  Heading,
} from "@chakra-ui/react";
import { filesize } from "filesize";
import { ReactNode } from "react";
import { useIntl, defineMessages } from "react-intl";

import { trpcReact } from "@/providers/TRPCProvider";
import { COLORS } from "@/ui/colors";
import { ShadowCard } from "@/ui/ShadowCard/ShadowCard";

const messages = defineMessages({
  cores: {
    defaultMessage: "Cores",
  },
  current: {
    defaultMessage: "Current",
  },
  rss: {
    defaultMessage: "RSS",
  },
  free: {
    defaultMessage: "Free",
  },
  heapUsed: {
    defaultMessage: "Heap Used",
  },
  heapTotal: {
    defaultMessage: "Heap Total",
  },
  heapMax: {
    defaultMessage: "Heap Max",
  },
});

function Stat({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <Box>
      <Text color="#9B7641" fontSize="sm" mb={2} whiteSpace="nowrap">
        {label}
      </Text>
      <Heading color={COLORS.BLACK} fontSize={24} mb={4} whiteSpace="nowrap">
        {value}
      </Heading>
    </Box>
  );
}

export function NodeResources() {
  const { data } = trpcReact.getStatus.useQuery(undefined, {
    refetchInterval: 1000,
  });
  const { formatMessage } = useIntl();

  if (!data) {
    return null;
  }

  return (
    <LightMode>
      <ShadowCard
        contentContainerProps={{
          bg: "#FFCD85",
          p: 8,
          overflow: "hidden",
          position: "relative",
        }}
        mb={10}
      >
        <Grid
          position="relative"
          templateColumns={{
            base: "repeat(1, 1fr)",
            md: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          }}
          gap={8}
          zIndex={1}
        >
          <GridItem>
            <Stat
              label={formatMessage(messages.cores)}
              value={data.cpu.cores}
            />
          </GridItem>
          <GridItem>
            <Stat
              label={formatMessage(messages.current)}
              value={`${data.cpu.percentCurrent.toFixed(1)}%`}
            />
          </GridItem>
          <GridItem>
            <Stat
              label={formatMessage(messages.rss)}
              value={`${filesize(data.memory.rss)} (${(
                (data.memory.rss / data.memory.memTotal) *
                100
              ).toFixed(1)}%)`}
            />
          </GridItem>
          <GridItem>
            <Stat
              label={formatMessage(messages.free)}
              value={`${filesize(data.memory.memFree)} (${(
                (1 - data.memory.memFree / data.memory.memTotal) *
                100
              ).toFixed(1)}%)`}
            />
          </GridItem>
          <GridItem>
            <Stat
              label={formatMessage(messages.heapUsed)}
              value={filesize(data.memory.heapUsed)}
            />
          </GridItem>
          <GridItem>
            <Stat
              label={formatMessage(messages.heapTotal)}
              value={filesize(data.memory.heapTotal)}
            />
          </GridItem>
          <GridItem>
            <Stat
              label={formatMessage(messages.heapMax)}
              value={`${filesize(data.memory.heapMax)} (${(
                (data.memory.heapUsed / data.memory.heapMax) *
                100
              ).toFixed(1)}%)`}
            />
          </GridItem>
        </Grid>
      </ShadowCard>
    </LightMode>
  );
}
