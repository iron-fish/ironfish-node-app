import { chakra, useColorModeValue } from "@chakra-ui/react";

export function ExpiredIcon() {
  const fill = useColorModeValue("#FF3D00", "#C84C1B");

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
      <path
        d="M9.8 17L9 16.2L12.2 13L9 9.8L9.8 9L13 12.2L16.2 9L17 9.8L13.8 13L17 16.2L16.2 17L13 13.8L9.8 17Z"
        fill={fill}
      />
    </chakra.svg>
  );
}
