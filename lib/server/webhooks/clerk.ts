import { createHmac, timingSafeEqual } from 'node:crypto';

export const MAX_CLERK_WEBHOOK_BYTES = 256 * 1024;
export const CLERK_WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS = 5 * 60;

export interface ClerkWebhookEvent {
  type: string;
  data: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ClerkWebhookProcessor {
  processOnce(eventId: string, event: ClerkWebhookEvent): Promise<'processed' | 'duplicate'>;
}

function decodeSecret(secret: string): Buffer {
  const encoded = secret.startsWith('whsec_') ? secret.slice('whsec_'.length) : secret;
  if (!encoded || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) {
    throw new TypeError('The Clerk webhook secret is invalid.');
  }
  const decoded = Buffer.from(encoded, 'base64');
  if (
    decoded.length === 0 ||
    decoded.toString('base64').replace(/=+$/, '') !== encoded.replace(/=+$/, '')
  ) {
    throw new TypeError('The Clerk webhook secret is invalid.');
  }
  return decoded;
}

function signatureMatches(expected: Buffer, header: string): boolean {
  return header.split(/\s+/).some((entry) => {
    const [version, encoded] = entry.split(',', 2);
    if (version !== 'v1' || !encoded) return false;
    let actual: Buffer;
    try {
      actual = Buffer.from(encoded, 'base64');
    } catch {
      return false;
    }
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  });
}

export function verifyClerkWebhookSignature(
  rawBody: string | Uint8Array,
  headers: Headers,
  secret = process.env['CLERK_WEBHOOK_SECRET'],
  nowSeconds = Math.floor(Date.now() / 1000),
): string {
  if (!secret) throw new Error('CLERK_WEBHOOK_SECRET is not configured.');

  const messageId = headers.get('svix-id');
  const timestamp = headers.get('svix-timestamp');
  const signatures = headers.get('svix-signature');
  if (!messageId || !timestamp || !signatures || !/^\d+$/.test(timestamp)) {
    throw new TypeError('Required Svix signature headers are missing or invalid.');
  }

  const timestampSeconds = Number(timestamp);
  if (
    !Number.isSafeInteger(timestampSeconds) ||
    Math.abs(nowSeconds - timestampSeconds) > CLERK_WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS
  ) {
    throw new TypeError('The webhook timestamp is outside the accepted time window.');
  }

  const raw = typeof rawBody === 'string' ? rawBody : Buffer.from(rawBody).toString('utf8');
  const expected = createHmac('sha256', decodeSecret(secret))
    .update(`${messageId}.${timestamp}.${raw}`)
    .digest();
  if (!signatureMatches(expected, signatures))
    throw new TypeError('The webhook signature is invalid.');
  return messageId;
}

async function readBoundedBody(request: Request): Promise<string> {
  if (!request.body) return '';
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_CLERK_WEBHOOK_BYTES) {
        await reader.cancel();
        throw new RangeError('The webhook payload exceeds the 256KB limit.');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const body = Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))).toString('utf8');
  if (Buffer.byteLength(body, 'utf8') !== total)
    throw new TypeError('The webhook body is not valid UTF-8.');
  return body;
}

function parseEvent(rawBody: string): ClerkWebhookEvent {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    throw new TypeError('The webhook payload is not valid JSON.');
  }
  if (
    parsed === null ||
    typeof parsed !== 'object' ||
    Array.isArray(parsed) ||
    typeof (parsed as Record<string, unknown>)['type'] !== 'string' ||
    (parsed as Record<string, unknown>)['data'] === null ||
    typeof (parsed as Record<string, unknown>)['data'] !== 'object' ||
    Array.isArray((parsed as Record<string, unknown>)['data'])
  ) {
    throw new TypeError('The webhook payload has an unsupported event shape.');
  }
  return parsed as ClerkWebhookEvent;
}

function jsonResponse(status: number, body: Record<string, unknown>): Response {
  return Response.json(body, {
    status,
    headers: { 'cache-control': 'no-store' },
  });
}

export function createClerkWebhookHandler(
  processor: ClerkWebhookProcessor,
  secret = process.env['CLERK_WEBHOOK_SECRET'],
): (request: Request) => Promise<Response> {
  return async (request) => {
    if (!secret) return jsonResponse(503, { error: 'Webhook verification is not configured.' });
    if (request.method !== 'POST') return jsonResponse(405, { error: 'Method not allowed.' });
    let rawBody: string;
    let eventId: string;
    let event: ClerkWebhookEvent;
    try {
      rawBody = await readBoundedBody(request);
      if (!rawBody) throw new TypeError('The webhook payload is empty.');
      eventId = verifyClerkWebhookSignature(rawBody, request.headers, secret);
      event = parseEvent(rawBody);
    } catch (error) {
      const message = error instanceof RangeError ? error.message : 'Invalid webhook request.';
      return jsonResponse(400, { error: message });
    }

    try {
      const result = await processor.processOnce(eventId, event);
      return jsonResponse(200, { received: true, duplicate: result === 'duplicate' });
    } catch {
      return jsonResponse(500, { error: 'Webhook processing failed.' });
    }
  };
}
