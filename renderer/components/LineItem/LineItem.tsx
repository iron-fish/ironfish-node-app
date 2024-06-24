import {
  Box,
  Text,
  HStack,
  Image as ChakraImage,
  Tooltip,
  chakra,
} from "@chakra-ui/react";
import NextImage, { StaticImageData } from "next/image";
import { ReactNode, useMemo } from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { RxExternalLink } from "react-icons/rx";

import { COLORS } from "@/ui/colors";

type LineItemProps = {
  label: string;
  content: ReactNode;
  tooltip?: string;
  icon?: StaticImageData | string;
  href?: string;
};

export function LineItem({
  label,
  tooltip,
  content,
  icon,
  href,
}: LineItemProps) {
  const maybeLinkProps = href
    ? ({
        as: "a",
        cursor: "pointer",
        rel: "noreferrer",
        target: "_blank",
        href,
      } as const)
    : undefined;

  const iconImage = useMemo(() => {
    if (!icon) return null;
    if (typeof icon === "string") {
      return <ChakraImage src={icon} alt="" boxSize="24px" />;
    }
    return <NextImage src={icon} alt="" height={24} width={24} />;
  }, [icon]);

  return (
    <Box py={2}>
      <HStack alignItems="center">
        <Text
          color={COLORS.GRAY_MEDIUM}
          _dark={{
            color: COLORS.DARK_MODE.GRAY_LIGHT,
          }}
        >
          {label}
        </Text>
        {tooltip ? (
          <Tooltip label={tooltip} placement="top">
            <chakra.div mb="2px">
              <IoMdInformationCircleOutline />
            </chakra.div>
          </Tooltip>
        ) : null}
      </HStack>
      <HStack gap={1.5} mt={1} {...maybeLinkProps}>
        {iconImage}
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
  return (
    <Box
      borderBottom="1.5px dashed #DEDFE2"
      my={2}
      _dark={{
        borderColor: COLORS.DARK_MODE.GRAY_MEDIUM,
      }}
    />
  );
}
