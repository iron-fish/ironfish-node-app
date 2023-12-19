import { chakra } from "@chakra-ui/react";

export function SentIcon() {
  return (
    <chakra.svg
      width={26}
      height={26}
      fill="none"
      color="#FFE5DD"
      _dark={{
        color: "#503428",
      }}
    >
      <circle cx={13} cy={13} r={13} fill="currentColor" />
      <path stroke="#FF3D00" strokeWidth={1.5} d="M11.5 9H17v5.5M17 9l-8 8" />
    </chakra.svg>
  );
}
