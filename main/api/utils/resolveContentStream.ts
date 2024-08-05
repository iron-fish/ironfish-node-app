export async function resolveContentStream<T>(iterable: AsyncIterable<T>) {
  const results = [];
  for await (const result of iterable) {
    results.push(result);
  }
  return results;
}
