import { randomUUID } from 'node:crypto';

import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';

const TAG_MAX_LENGTH = 256;
const SLIDING_WINDOW_SCRIPT = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
redis.call('ZREMRANGEBYSCORE', key, '-inf', now - window)
local count = redis.call('ZCARD', key)
if count >= limit then
  local first = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
  return {0, count, tonumber(first[2]) + window}
end
redis.call('ZADD', key, now, ARGV[4])
redis.call('PEXPIRE', key, window)
return {1, count + 1, now + window}
`;

export interface RateLimitOptions {
  limit?: number;
  windowMs?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

export class RateLimitUnavailableError extends Error {
  constructor(message = 'The rate-limit service is unavailable.') {
    super(message);
    this.name = 'RateLimitUnavailableError';
  }
}

function rateLimitConfiguration(): { url: string; token: string } | undefined {
  const url = process.env['UPSTASH_REDIS_REST_URL']?.trim();
  const token = process.env['UPSTASH_REDIS_REST_TOKEN']?.trim();
  if (!url && !token) return undefined;
  if (!url || !token)
    throw new RateLimitUnavailableError('Upstash Redis URL and token must both be configured.');
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') throw new Error('HTTPS is required.');
  } catch {
    throw new RateLimitUnavailableError('UPSTASH_REDIS_REST_URL must be a valid HTTPS URL.');
  }
  return { url: url.replace(/\/+$/, ''), token };
}

export async function checkOrganizationRateLimit(
  organizationId: string,
  userId: string,
  options: RateLimitOptions = {},
): Promise<RateLimitResult> {
  const limit = options.limit ?? 100;
  const windowMs = options.windowMs ?? 60_000;
  if (!Number.isInteger(limit) || limit < 1)
    throw new RangeError('Rate limit must be a positive integer.');
  if (!Number.isInteger(windowMs) || windowMs < 1)
    throw new RangeError('Rate-limit window must be positive.');

  const config = rateLimitConfiguration();
  if (!config) {
    if (process.env['NODE_ENV'] === 'production') {
      throw new RateLimitUnavailableError(
        'Upstash Redis is required for production rate limiting.',
      );
    }
    return { allowed: true, limit, remaining: limit, resetAt: Date.now() + windowMs };
  }

  const orgId = assertTagPart(organizationId, 'Organization ID');
  const actorId = assertTagPart(userId, 'User ID');
  const now = Date.now();
  const key = `rate-limit:org:${encodeURIComponent(orgId)}:user:${encodeURIComponent(actorId)}`;
  let response: Response;
  try {
    response = await fetch(config.url, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${config.token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify([
        'EVAL',
        SLIDING_WINDOW_SCRIPT,
        '1',
        key,
        String(now),
        String(windowMs),
        String(limit),
        `${now}:${randomUUID()}`,
      ]),
      cache: 'no-store',
    });
  } catch {
    throw new RateLimitUnavailableError();
  }
  if (!response.ok) throw new RateLimitUnavailableError();

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new RateLimitUnavailableError('The rate-limit service returned invalid JSON.');
  }
  if (
    payload === null ||
    typeof payload !== 'object' ||
    !('result' in payload) ||
    !Array.isArray(payload.result)
  ) {
    throw new RateLimitUnavailableError('The rate-limit service returned an invalid result.');
  }
  const [allowed, count, resetAt] = payload.result;
  if (
    (allowed !== 0 && allowed !== 1) ||
    typeof count !== 'number' ||
    typeof resetAt !== 'number' ||
    !Number.isFinite(count) ||
    !Number.isFinite(resetAt)
  ) {
    throw new RateLimitUnavailableError('The rate-limit service returned an invalid result.');
  }
  return {
    allowed: allowed === 1,
    limit,
    remaining: Math.max(0, limit - count),
    resetAt,
  };
}

function assertTagPart(value: string, name: string): string {
  const normalized = value.trim();
  const hasControlCharacter = [...normalized].some((character) => character.charCodeAt(0) < 32);
  if (!normalized || normalized.length > TAG_MAX_LENGTH || hasControlCharacter) {
    throw new TypeError(`${name} must be a non-empty cache-safe string.`);
  }
  return normalized;
}

export function organizationCacheTag(organizationId: string, resource: string): string {
  const orgId = assertTagPart(organizationId, 'Organization ID');
  const resourceName = assertTagPart(resource, 'Cache resource');
  const tag = `org:${encodeURIComponent(orgId)}:${resourceName}`;
  if (tag.length > TAG_MAX_LENGTH) throw new RangeError('The generated cache tag is too long.');
  return tag;
}

export async function revalidateOrganizationTag(
  organizationId: string,
  resource: string,
): Promise<void> {
  revalidateTag(organizationCacheTag(organizationId, resource), 'max');
}

export async function revalidateOrganizationPath(
  organizationId: string,
  resource: string,
  path: string,
  type?: 'page' | 'layout',
): Promise<void> {
  await revalidateOrganizationTag(organizationId, resource);
  revalidatePath(path, type);
}

export function cacheOrganizationData<Arguments extends unknown[], Result>(
  organizationId: string,
  key: string,
  resource: string,
  loader: (...args: Arguments) => Promise<Result>,
  revalidateSeconds = 300,
): (...args: Arguments) => Promise<Result> {
  const safeKey = assertTagPart(key, 'Cache key');
  if (!Number.isInteger(revalidateSeconds) || revalidateSeconds < 0) {
    throw new RangeError('Cache revalidation seconds must be a non-negative integer.');
  }
  return unstable_cache(loader, [organizationId, safeKey], {
    tags: [organizationCacheTag(organizationId, resource)],
    revalidate: revalidateSeconds,
  });
}
