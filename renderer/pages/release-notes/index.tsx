import { VStack, Heading, HStack, Box, Text } from "@chakra-ui/react";
import { defineMessages, useIntl } from "react-intl";

import { ReleaseNote } from "@/components/ReleaseNote/ReleaseNote";
import MainLayout from "@/layouts/MainLayout";
import { trpcReact } from "@/providers/TRPCProvider";
import { COLORS } from "@/ui/colors";

import { PartialGithubRelease } from "../../../shared/types";

const messages = defineMessages({
  releaseNotes: {
    defaultMessage: "Release Notes",
  },
  version: {
    defaultMessage: "Version {currentVersion}",
  },
  loading: {
    defaultMessage: "Loading...",
  },
  downloadError: {
    defaultMessage: "We're not able to download release notes right now.",
  },
});

function ReleaseNotesList({
  currentVersion,
  releases,
}: {
  currentVersion: string | undefined;
  releases: PartialGithubRelease[];
}) {
  return (
    <VStack gap={16}>
      {releases.map((release) => {
        return (
          <ReleaseNote
            key={release.id}
            release={release}
            currentVersion={currentVersion}
          />
        );
      })}
    </VStack>
  );
}

export default function ReleaseNotes() {
  const { formatMessage } = useIntl();
  const { data: currentVersion } = trpcReact.getCurrentVersion.useQuery();

  const { isLoading, isError, isSuccess, data } =
    trpcReact.getUpdateNotes.useQuery(undefined, { retry: false });

  return (
    <MainLayout>
      <HStack alignItems="center" mb={10} gap={6}>
        <Heading>{formatMessage(messages.releaseNotes)}</Heading>
        <Box
          background={COLORS.GRAY_LIGHT}
          borderRadius="5px"
          px={4}
          py={1.5}
          _dark={{ background: COLORS.DARK_MODE.GRAY_LIGHT }}
        >
          <Text
            color={COLORS.GRAY_MEDIUM}
            _dark={{ color: COLORS.DARK_MODE.GRAY_MEDIUM }}
          >
            {formatMessage(messages.version, {
              currentVersion: currentVersion || 0,
            })}
          </Text>
        </Box>
      </HStack>
      {isLoading && <div>{formatMessage(messages.loading)}</div>}
      {isError && <div>{formatMessage(messages.downloadError)}</div>}
      {isSuccess && (
        <ReleaseNotesList currentVersion={currentVersion} releases={data} />
      )}
    </MainLayout>
  );
}
