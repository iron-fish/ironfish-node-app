import { Box, Text, HStack } from "@chakra-ui/react";
import Image, { StaticImageData } from "next/image";
import { RxExternalLink } from "react-icons/rx";

import { COLORS } from "@/ui/colors";

type LineItemProps = {
  label: string;
  content: string;
  icon?: StaticImageData;
  href?: string;
};

export function LineItem({ label, content, icon, href }: LineItemProps) {
  const maybeLinkProps = href
    ? ({
        as: "a",
        cursor: "pointer",
        rel: "noreferrer",
        href,
      } as const)
    : undefined;
  return (
    <Box py={2}>
      <Text color={COLORS.GRAY_MEDIUM}>{label}</Text>
      <HStack gap={1.5} mt={1} {...maybeLinkProps}>
        {icon && <Image src={icon} alt="" />}
        <Text
          data-type="content"
          as="span"
          fontSize="md"
          textDecoration={href ? "underline" : "none"}
        >
          {content}
        </Text>
        {href && (
          <Box mt="1px" color={COLORS.GRAY_MEDIUM}>
            <RxExternalLink />
          </Box>
        )}
      </HStack>
    </Box>
  );
}

export function Divider() {
  return <Box borderBottom="1.5px dashed #DEDFE2" my={2} />;
}
