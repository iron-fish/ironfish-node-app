import { chakra } from "@chakra-ui/react";

export function BridgeIcon() {
  return (
    <chakra.svg width={26} height={26} fill="none">
      <rect width={26} height={26} fill="#D657D9" fillOpacity={0.2} rx={13} />
      <path
        stroke="#D657D9"
        strokeWidth={1.333}
        d="M16.486 6.962c.104 1.457 1.061 4.371 4.058 4.371m0 0H6.19m14.354 0h.313M10.56 18.813c-.103-1.457-1.06-4.371-4.058-4.371m0 0H20.857m-14.355 0H6.19"
      />
    </chakra.svg>
  );
}
