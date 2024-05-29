import { chakra } from "@chakra-ui/react";

export function BridgeIcon() {
  return (
    <chakra.svg width={26} height={26} fill="none">
      <rect width={28} height={28} fill="#D657D9" fillOpacity={0.2} rx={14} />
      <path
        stroke="#D657D9"
        strokeWidth={1.333}
        d="M16.962 7.475c.105 1.457 1.062 4.371 4.06 4.371m0 0H6.666m14.354 0h.312M11.037 19.326c-.104-1.457-1.061-4.371-4.058-4.371m0 0h14.354m-14.354 0h-.312"
      />
    </chakra.svg>
  );
}
