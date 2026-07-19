type RateEntry = { count: number; resetsAt: number };

const entries = new Map<string, RateEntry>();

export function takeRateLimit(
  key: string,
  options: { limit: number; windowMs: number },
): { allowed: boolean; retryAfter: number; remaining: number } {
  const now = Date.now();
  const current = entries.get(key);
  const entry =
    !current || current.resetsAt <= now
      ? { count: 0, resetsAt: now + options.windowMs }
      : current;

  entry.count += 1;
  entries.set(key, entry);

  if (entries.size > 5_000) {
    for (const [entryKey, value] of entries) {
      if (value.resetsAt <= now) entries.delete(entryKey);
    }
  }

  return {
    allowed: entry.count <= options.limit,
    retryAfter: Math.max(1, Math.ceil((entry.resetsAt - now) / 1_000)),
    remaining: Math.max(0, options.limit - entry.count),
  };
}
