export function asQueryString(maybeQueryString: string | string[] | undefined) {
  if (typeof maybeQueryString !== "string") {
    return null;
  }

  return maybeQueryString;
}
