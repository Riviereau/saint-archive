/*
  lib/serverRateLimit.ts — Limite par adresse IP, en mémoire.

  Se réinitialise au redémarrage du serveur. En production, utilisez
  Redis ou une base de données.
*/

const hits = new Map<string, { count: number; resetAt: number }>();

export function allow(key: string, limit: number): boolean {
  const now = Date.now();
  const record = hits.get(key);

  if (!record || record.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + 24 * 60 * 60 * 1000 });
    return true;
  }
  if (record.count >= limit) return false;
  record.count += 1;
  return true;
}

export function clientIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "127.0.0.1";
}
