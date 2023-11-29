import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export function useRefetchQueries() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    queryClient.invalidateQueries();
  }, [queryClient]);
}
