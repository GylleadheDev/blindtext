import "server-only"

const WINDOW_MS = 60_000
const MAX_REQUESTS = 10

type Bucket = { count: number; resetAt: number }

/**
 * Guarda de custo, nao guarda de seguranca: mora na memoria do processo, some no
 * cold start e nao atravessa instancias. Serve pra dev/demo nao virar carteira
 * aberta pra OpenAI. Antes de expor em producao, trocar por Upstash/Redis.
 */
const buckets = new Map<string, Bucket>()

export type RateLimitVerdict = { allowed: true } | { allowed: false; retryInSeconds: number }

export function checkRateLimit(key: string, now = Date.now()): RateLimitVerdict {
  const bucket = buckets.get(key)

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS })
    if (buckets.size > 5_000) evictExpired(now)
    return { allowed: true }
  }

  if (bucket.count >= MAX_REQUESTS) {
    return { allowed: false, retryInSeconds: Math.ceil((bucket.resetAt - now) / 1000) }
  }

  bucket.count += 1
  return { allowed: true }
}

function evictExpired(now: number) {
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) buckets.delete(key)
  }
}

export function clientKeyFrom(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim()
    if (first) return first
  }
  return headers.get("x-real-ip")?.trim() || "local"
}
