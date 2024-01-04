import { chakra, useColorModeValue } from "@chakra-ui/react";

export function SentIcon() {
  const foregroundColor = useColorModeValue("#FF3D00", "#C84C1B");

  return (
    <chakra.svg
      width={26}
      height={26}
      fill="none"
      color="#FFE5DD"
      _dark={{
        color: "#453328",
      }}
    >
      <circle cx={13} cy={13} r={13} fill="currentColor" />
      <path d="M11.5 9H17V14.5" stroke={foregroundColor} stroke-width="1.5" />
      <path d="M17 9L9 17" stroke={foregroundColor} stroke-width="1.5" />
    </chakra.svg>
  );
}
