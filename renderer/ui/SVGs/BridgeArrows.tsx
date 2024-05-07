import { chakra } from "@chakra-ui/react";
import { ComponentProps } from "react";

export function BridgeArrows(props: ComponentProps<typeof chakra.svg>) {
  return (
    <chakra.svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="19"
      fill="none"
      {...props}
    >
      <path
        stroke="currentColor"
        stroke-width="2"
        d="M15.444.444C15.6 2.629 17.036 7 21.532 7m0 0H0m21.532 0H22M6.556 18.22C6.4 16.033 4.964 11.662.468 11.662m0 0H22m-21.532 0H0"
      />
    </chakra.svg>
  );
}
