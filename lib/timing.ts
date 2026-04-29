export type Timed<T> = { data: T; ms: number; label: string };

export async function measure<T>(
  label: string,
  fn: () => Promise<T>,
): Promise<Timed<T>> {
  const start = performance.now();
  const data = await fn();
  const ms = +(performance.now() - start).toFixed(2);
  return { data, ms, label };
}
