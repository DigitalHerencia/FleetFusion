import { AsyncLocalStorage } from 'node:async_hooks';

import { logger } from './logger';
import { incrementCounter, observeHistogram } from './metrics';

export interface SpanRecord {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  startTime: string;
  endTime: string;
  durationMs: number;
  status: 'ok' | 'error';
  attributes: Readonly<Record<string, unknown>>;
  error?: { name: string; message: string };
}

export type SpanExporter = (span: SpanRecord) => void | Promise<void>;

interface ActiveSpan {
  traceId: string;
  spanId: string;
  name: string;
}

const spanContext = new AsyncLocalStorage<ActiveSpan>();
const exporters = new Set<SpanExporter>();

export function registerSpanExporter(exporter: SpanExporter): () => void {
  exporters.add(exporter);
  return () => exporters.delete(exporter);
}

export function getActiveSpan(): ActiveSpan | undefined {
  return spanContext.getStore();
}

function newId(bytes: number): string {
  const value = new Uint8Array(bytes);
  globalThis.crypto.getRandomValues(value);
  return [...value].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function emit(span: SpanRecord): Promise<void> {
  for (const exporter of exporters) {
    try {
      await exporter(span);
    } catch (error) {
      logger.error({ spanName: span.name, error }, 'Trace exporter failed.');
    }
  }
}

export async function withSpan<T>(
  name: string,
  operation: () => T | Promise<T>,
  attributes: Readonly<Record<string, unknown>> = {},
): Promise<T> {
  if (!name.trim()) throw new TypeError('A span name is required.');
  const parent = spanContext.getStore();
  const active: ActiveSpan = {
    traceId: parent?.traceId ?? newId(16),
    spanId: newId(8),
    name,
  };
  const start = Date.now();
  const startTime = new Date(start).toISOString();
  let status: SpanRecord['status'] = 'ok';
  let failure: SpanRecord['error'];
  try {
    return await spanContext.run(active, operation);
  } catch (error) {
    status = 'error';
    failure = {
      name: error instanceof Error ? error.name : 'Error',
      message: error instanceof Error ? error.message : String(error),
    };
    throw error;
  } finally {
    const end = Date.now();
    const span: SpanRecord = {
      traceId: active.traceId,
      spanId: active.spanId,
      ...(parent ? { parentSpanId: parent.spanId } : {}),
      name,
      startTime,
      endTime: new Date(end).toISOString(),
      durationMs: end - start,
      status,
      attributes,
      ...(failure ? { error: failure } : {}),
    };
    const labels = { span: name, status };
    incrementCounter('traced_operations_total', 1, labels);
    observeHistogram('traced_operation_duration_ms', span.durationMs, labels);
    logger[status === 'error' ? 'error' : 'debug'](
      {
        traceId: span.traceId,
        spanId: span.spanId,
        parentSpanId: span.parentSpanId,
        spanName: span.name,
        durationMs: span.durationMs,
        status: span.status,
        ...attributes,
        ...(failure ? { error: failure } : {}),
      },
      'Trace span completed.',
    );
    await emit(span);
  }
}

export function wrapDomainActionInSpan<TArgs extends readonly unknown[], TResult>(
  name: string,
  action: (...args: TArgs) => TResult | Promise<TResult>,
  attributes: Readonly<Record<string, unknown>> = {},
): (...args: TArgs) => Promise<TResult> {
  return (...args) => withSpan(name, () => action(...args), attributes);
}

export function tracePrismaQuery<T>(
  model: string,
  operation: string,
  query: () => T | Promise<T>,
): Promise<T> {
  return withSpan(`prisma.${model}.${operation}`, query, {
    dbSystem: 'postgresql',
    dbModel: model,
    dbOperation: operation,
  });
}
