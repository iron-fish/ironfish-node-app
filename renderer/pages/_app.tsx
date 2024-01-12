import { ChakraProvider } from "@chakra-ui/react";
import { AppProps } from "next/app";
import Head from "next/head";
import { useEffect } from "react";
import { useIsClient } from "usehooks-ts";

import { ErrorBoundary } from "@/components/ErrorBoundary/ErrorBoundary";
import { IntlProvider } from "@/intl/IntlProvider";
import { TRPCProvider } from "@/providers/TRPCProvider";
import { LoadFonts } from "@/ui/LoadFonts/LoadFonts";
import theme from "@/ui/theme";

// Fixes an issue where it's not possible to always use the system value for color mode.
// Chakra sets chakra-ui-color-mode in localStorage to either light or dark depending
// on the system theme, then on subsequent loads will prefer the value set in
// localStorage over the system theme, but replacing the colorModeManager prevents it.
class SystemColorModeManager implements StorageManager {
  async persist(): Promise<boolean> {
    return true;
  }

  async persisted(): Promise<boolean> {
    return true;
  }

  async estimate(): Promise<StorageEstimate> {
    return {
      usage: 0,
      quota: 0,
    };
  }

  async getDirectory(): Promise<FileSystemDirectoryHandle> {
    return {} as FileSystemDirectoryHandle;
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

  useEffect(() => {
    // Prevent window from unloading (i.e. closing or being reloaded). This is due to dynamic routes not
    // being statically generated, which causes the app to 404 if the user reloads on a dynamic route.
    // Closing the window is handled by the main process, which listens for the "close" event and destroys
    // the window.
    window.addEventListener("beforeunload", (e) => {
      e.preventDefault();
      e.returnValue = true;
    });
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Iron Fish Node App</title>
      </Head>
      <LoadFonts />
      <TRPCProvider>
        <ChakraProvider theme={theme} colorModeManager={systemColorModeManager}>
          <IntlProvider>
            <ErrorBoundary>
              <Component {...pageProps} />
            </ErrorBoundary>
          </IntlProvider>
        </ChakraProvider>
      </TRPCProvider>
    </>
  );
}
