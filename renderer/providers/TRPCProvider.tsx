import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CreateTRPCProxyClient, createTRPCProxyClient } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { ipcLink } from "electron-trpc/renderer";
import { useState, ReactNode, useEffect } from "react";

import type { AppRouter } from "../../main/api";

export const trpcReact = createTRPCReact<AppRouter>();

let cachedQueryClient: QueryClient;
export function invalidteQueries() {
  if (!cachedQueryClient) {
    throw new Error("QueryClient not initialized");
  }
  cachedQueryClient.invalidateQueries();
}

export function TRPCProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchInterval: 1000 * 30,
          },
        },
      }),
  );
  const [trpcClient] = useState(() =>
    trpcReact.createClient({
      links: [ipcLink()],
    }),
  );

  useEffect(() => {
    cachedQueryClient = queryClient;
  }, [queryClient]);

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
      links: [ipcLink()],
    });
  }
  return vanillaClient;
}

export type TRPCRouterInputs = inferRouterInputs<AppRouter>;
export type TRPCRouterOutputs = inferRouterOutputs<AppRouter>;
