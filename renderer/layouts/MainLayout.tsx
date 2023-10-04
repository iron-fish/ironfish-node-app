import { Box } from "@chakra-ui/react";
import { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
  return <Box>{children}</Box>;
}
