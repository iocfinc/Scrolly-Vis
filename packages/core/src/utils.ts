export function deepMerge<T extends Record<string, unknown>>(base: T, patch: Record<string, unknown>): T {
  const out = { ...base } as Record<string, unknown>;
  for (const [k, v] of Object.entries(patch)) {
    if (isObject(v) && isObject(out[k])) {
      out[k] = deepMerge(out[k] as Record<string, unknown>, v as Record<string, unknown>);
      continue;
    }
    out[k] = v;
  }
  return out as T;
}

export function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
