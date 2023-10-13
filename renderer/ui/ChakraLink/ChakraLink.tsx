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

export function MaybeLink({ href, ...rest }: Partial<Props>) {
  if (href) {
    return <ChakraLink href={href} {...rest} />;
  }
  return <Box {...rest} />;
}
