import { ChakraProvider } from "@chakra-ui/react";
import { AppProps } from "next/app";
import Head from "next/head";
import { useIsClient } from "usehooks-ts";

import { TRPCProvider } from "@/providers/TRPCProvider";
import { DraggableArea } from "@/ui/DraggableArea/DraggableArea";
import { LoadFonts } from "@/ui/LoadFonts/LoadFonts";
import theme from "@/ui/theme";

export default function MyApp({ Component, pageProps }: AppProps) {
  const isClient = useIsClient();

  if (!isClient) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Iron Fish</title>
      </Head>
      <LoadFonts />
      <DraggableArea />
      <TRPCProvider>
        <ChakraProvider theme={theme}>
          <Component {...pageProps} />
        </ChakraProvider>
      </TRPCProvider>
    </>
  );
}
