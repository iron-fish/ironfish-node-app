import { ChakraProvider } from "@chakra-ui/react";

import theme from "../lib/theme";
import { AppProps } from "next/app";
import { TRPCProvider } from "../providers/TRPCProvider";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <TRPCProvider>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </TRPCProvider>
  );
}

export default MyApp;
