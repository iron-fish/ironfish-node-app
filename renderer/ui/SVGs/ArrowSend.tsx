import { chakra } from "@chakra-ui/react";
import { ComponentProps } from "react";

export function ArrowSend(props: ComponentProps<typeof chakra.svg>) {
  return (
    <chakra.svg
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      fill="none"
      {...props}
    >
      <path
        stroke="currentColor"
        strokeWidth={2}
        d="M3.888 1c2.341 2.03 8.148 4.964 12.644.468m0 0-.012.012m.012-.012L17 1m0 13.112c-2.027-2.34-4.959-8.138-.48-12.632m0 0L1 17"
      />
    </chakra.svg>
  );
}
