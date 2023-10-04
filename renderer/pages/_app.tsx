import { ChakraProvider } from "@chakra-ui/react";
import { AppProps } from "next/app";
import { useIsClient } from "usehooks-ts";
import theme from "../lib/theme";
import { TRPCProvider } from "../providers/TRPCProvider";

export default function MyApp({ Component, pageProps }: AppProps) {
  const isClient = useIsClient();

  if (!isClient) {
    return null;
  }

  return (
    <TRPCProvider>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </TRPCProvider>
  );
}
