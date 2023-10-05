import { Box, BoxProps } from "@chakra-ui/react";
import Link from "next/link";

type Props = {
  href: string;
} & Omit<BoxProps, "a">;

export function ChakraLink({ href, ...rest }: Props) {
  return (
    <Link href={href} passHref>
      <Box as="a" {...rest} />
    </Link>
  );
}
