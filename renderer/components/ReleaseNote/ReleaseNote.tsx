import { Box, Heading, Text } from "@chakra-ui/react";
import { compareVersions } from "compare-versions";
import { useMemo } from "react";
import Markdown from "react-markdown";

import { COLORS } from "@/ui/colors";

import { PartialGithubRelease } from "../../../shared/types";

const stripLeadingV = (str: string) => str.replace(/^v/, "");

function New() {
  return (
    <Box
      background={COLORS.GREEN_LIGHT}
      display="inline-flex"
      mb={4}
      borderRadius={4}
      px={3}
      py="2px"
      _dark={{ background: COLORS.DARK_MODE.GREEN_LIGHT }}
    >
      <Text
        color={COLORS.GREEN_DARK}
        _dark={{ color: COLORS.DARK_MODE.GREEN_DARK }}
      >
        New
      </Text>
    </Box>
  );
}

export function ReleaseNote({
  currentVersion,
  release,
}: {
  currentVersion: string | undefined;
  release: PartialGithubRelease;
}) {
  const shouldShowNew =
    currentVersion &&
    compareVersions(
      stripLeadingV(release.tag_name),
      stripLeadingV(currentVersion),
    ) === 1;

  const formattedPublishDate = useMemo(() => {
    return Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(
      new Date(release.published_at),
    );
  }, [release.published_at]);

  return (
    <Box width="100%" listStylePosition="inside">
      {shouldShowNew && <New />}
      <Text color={COLORS.GRAY_MEDIUM} mb={1}>
        {formattedPublishDate}
      </Text>
      <Heading as="h3" fontSize="2xl" mb={4} lineHeight="160%">
        {release.name}
      </Heading>
      <Box fontSize="sm">
        <Markdown>{release.body}</Markdown>
      </Box>
    </Box>
  );
}
