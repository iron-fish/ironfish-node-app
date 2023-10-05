import { ChakraProvider } from "@chakra-ui/react";
import { AppProps } from "next/app";
import { useIsClient } from "usehooks-ts";

import { TRPCProvider } from "@/providers/TRPCProvider";
import { LoadFonts } from "@/ui/LoadFonts/LoadFonts";
import theme from "@/ui/theme";

export default function MyApp({ Component, pageProps }: AppProps) {
  const isClient = useIsClient();

  if (!isClient) {
    return null;
  }

  return (
    <>
      <LoadFonts />
      <TRPCProvider>
        <ChakraProvider theme={theme}>
          <Component {...pageProps} />
        </ChakraProvider>
      </TRPCProvider>
    </>
  );
}
