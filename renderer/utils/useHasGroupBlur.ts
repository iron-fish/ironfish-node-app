import { useCallback, useMemo, useState } from "react";

export function useHasGroupBlur({ delay = 100 }: { delay: number }) {
  const [blurTimeout, setBlurTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [hasBlur, setHasBlur] = useState(false);

  const onFocus = useCallback(() => {
    if (!blurTimeout) return;
    clearTimeout(blurTimeout);
  }, [blurTimeout]);

  const onBlur = useCallback(() => {
    const timeout = setTimeout(() => {
      setHasBlur(true);
    }, delay);
    setBlurTimeout(timeout);
  }, [delay]);

  return useMemo(
    () => ({
      hasBlur,
      onFocus,
      onBlur,
    }),
    [hasBlur, onBlur, onFocus],
  );
}
