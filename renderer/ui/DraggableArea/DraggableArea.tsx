import { Box } from "@chakra-ui/react";
import { useEffect, useState } from "react";

export function DraggableArea() {
  const [height, setHeight] = useState(
    () => navigator.windowControlsOverlay.getTitlebarAreaRect().height,
  );

  useEffect(() => {
    const listener = () => {
      const { height: newHeight } =
        navigator.windowControlsOverlay.getTitlebarAreaRect();
      if (height !== newHeight) {
        setHeight(newHeight);
      }
    };

    navigator.windowControlsOverlay.addEventListener(
      "geometrychange",
      listener,
    );

    return () =>
      navigator.windowControlsOverlay.removeEventListener(
        "geometrychange",
        listener,
      );
  }, [height]);

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      w="100%"
      h={`${height}px`}
      zIndex={9999}
      sx={{
        WebkitUserSelect: "none",
        WebkitAppRegion: "drag",
      }}
    />
  );
}
