import { Box } from "@chakra-ui/react";
import { ReactNode } from "react";

import { COLORS } from "@/ui/colors";

type Props = {
  children: ReactNode;
};

export function SettingsCard({ children }: Props) {
  return (
    <Box
      bg={COLORS.GRAY_LIGHT}
      border="1px solid #DEDFE2"
      px={6}
      py={4}
      borderRadius={4}
      _dark={{
        bg: "#252525",
        borderColor: "#3B3B3B",
      }}
    >
      {children}
    </Box>
  );
}
