import { useState, ReactNode } from "react";
import { ipcLink } from "electron-trpc/renderer";
import { createTRPCReact } from "@trpc/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppRouter } from "../../main/api";

export const trpcReact = createTRPCReact<AppRouter>();

export function TRPCProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpcReact.createClient({
      links: [ipcLink()],
    }),
  );

  return (
    <trpcReact.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpcReact.Provider>
  );
}
