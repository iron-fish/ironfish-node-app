import { chakra } from "@chakra-ui/react";
import { ComponentProps } from "react";

type Props = ComponentProps<typeof chakra.svg> & {
  bg: string;
};

const size = 46;

export function FishIcon({ bg, ...rest }: Props) {
  return (
    <chakra.svg
      width={size}
      height={size}
      minWidth={size}
      minHeight={size}
      fill="none"
      borderRadius="full"
      bg={bg}
      {...rest}
    >
      <chakra.circle
        cx={23}
        cy={23}
        r={22.5}
        stroke="#000"
        _dark={{
          stroke: "#fff",
        }}
      />
      <path
        d="M38.422 22.666l-4.811-8.334a.664.664 0 00-.575-.332h-9.627a.664.664 0 00-.575.332l-4.135 7.163a.299.299 0 01-.332.137.297.297 0 01-.22-.286v-2.771a4.579 4.579 0 00-4.572-4.573h-3.91a.666.666 0 00-.665.665v3.91a4.486 4.486 0 002.768 4.154.294.294 0 010 .544A4.47 4.47 0 009 27.423v3.91c0 .366.297.665.665.665h3.91a4.579 4.579 0 004.573-4.573v-2.771c0-.133.09-.25.219-.286a.301.301 0 01.332.137l4.135 7.163c.12.205.338.332.575.332h9.625a.664.664 0 00.575-.332l4.811-8.334a.659.659 0 00.088-.331.648.648 0 00-.086-.337zm-10.127 3.828c-1.878 0-3.405-1.568-3.405-3.495 0-1.926 1.527-3.495 3.405-3.495 1.877 0 3.405 1.569 3.405 3.495 0 1.927-1.528 3.495-3.405 3.495z"
        fill="#0D0C22"
      />
    </chakra.svg>
  );
}
