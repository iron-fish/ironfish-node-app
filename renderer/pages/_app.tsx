import { ChakraProvider } from "@chakra-ui/react";
import { AppProps } from "next/app";
import Head from "next/head";
import { useIsClient } from "usehooks-ts";

import { TRPCProvider } from "@/providers/TRPCProvider";
import { DraggableArea } from "@/ui/DraggableArea/DraggableArea";
import { LoadFonts } from "@/ui/LoadFonts/LoadFonts";
import theme from "@/ui/theme";

// Fixes an issue where it's not possible to always use the system value for color mode.
// Chakra sets chakra-ui-color-mode in localStorage to either light or dark depending
// on the system theme, then on subsequent loads will prefer the value set in
// localStorage over the system theme, but replacing the colorModeManager prevents it.
class SystemColorModeManager implements StorageManager {
  persist(): Promise<boolean> {
    return Promise.resolve(true);
  }

  persisted(): Promise<boolean> {
    return Promise.resolve(true);
  }

  estimate(): Promise<StorageEstimate> {
    return Promise.resolve({
      usage: 0,
      quota: 0,
    });
  }

  getDirectory(): Promise<FileSystemDirectoryHandle> {
    return Promise.resolve({} as FileSystemDirectoryHandle);
  }

  get(): "light" | "dark" | undefined {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  type: "localStorage" | "cookie" = "localStorage";

  set() {
    return;
  }
}

const systemColorModeManager = new SystemColorModeManager();

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
      <TRPCProvider>
        <ChakraProvider theme={theme} colorModeManager={systemColorModeManager}>
          <DraggableArea />
          <Component {...pageProps} />
        </ChakraProvider>
      </TRPCProvider>
    </>
  );
}
