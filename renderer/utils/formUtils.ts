import { useCallback, useMemo, useState } from "react";

export function useHasGroupBlur({ delay = 50 }: { delay?: number } = {}) {
  const [blurTimeout, setBlurTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [hasBlur, setHasBlur] = useState(false);

  const handleGroupFocus = useCallback(() => {
    if (!blurTimeout) return;
    clearTimeout(blurTimeout);
  }, [blurTimeout]);

  const handleGroupBlur = useCallback(() => {
    const timeout = setTimeout(() => {
      setHasBlur(true);
    }, delay);
    setBlurTimeout(timeout);
  }, [delay]);

  return useMemo(
    () => ({
      hasBlur,
      handleGroupFocus,
      handleGroupBlur,
    }),
    [hasBlur, handleGroupFocus, handleGroupBlur],
  );
}
