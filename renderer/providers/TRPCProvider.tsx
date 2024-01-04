import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  CreateTRPCProxyClient,
  createTRPCProxyClient,
  loggerLink,
} from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { ipcLink } from "electron-trpc/renderer";
import { useState, ReactNode } from "react";

import type { AppRouter } from "../../main/api";

export const trpcReact = createTRPCReact<AppRouter>({
  overrides: {
    useMutation: {
      async onSuccess(opts) {
        await opts.originalFn();
        await opts.queryClient.invalidateQueries();
      },
    },
  },
});

export function TRPCProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchInterval: 1000 * 30,
            networkMode: "always",
          },
          mutations: {
            networkMode: "always",
          },
        },
      }),
  );
  const [trpcClient] = useState(() =>
    trpcReact.createClient({
      links: [
        loggerLink({
          enabled: (opts) =>
            opts.direction === "down" && opts.result instanceof Error,
        }),
        ipcLink(),
      ],
    }),
  );

  return (
    <trpcReact.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpcReact.Provider>
  );
}

let vanillaClient: CreateTRPCProxyClient<AppRouter>;

export function getTrpcVanillaClient() {
  if (!vanillaClient) {
    vanillaClient = createTRPCProxyClient<AppRouter>({
      links: [
        loggerLink({
          enabled: (opts) =>
            opts.direction === "down" && opts.result instanceof Error,
        }),
        ipcLink(),
      ],
    });
  }
  return vanillaClient;
}

export type TRPCRouterInputs = inferRouterInputs<AppRouter>;
export type TRPCRouterOutputs = inferRouterOutputs<AppRouter>;
