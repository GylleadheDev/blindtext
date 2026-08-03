export class TimeoutError extends Error {
  constructor(label: string, ms: number) {
    super(`timeout: ${label} passou de ${ms}ms`)
    this.name = "TimeoutError"
  }
}

/**
 * Teto pra promise que gateia UI. `finally` sozinho nao basta: se a promise nunca
 * settla (Server Action pendurada atras de proxy/CDN), o `finally` nunca roda e o
 * spinner fica eterno. Os dois mecanismos juntos, sempre.
 */
export function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined

  const ceiling = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(label, ms)), ms)
  })

  return Promise.race([promise, ceiling]).finally(() => {
    if (timer !== undefined) clearTimeout(timer)
  }) as Promise<T>
}
