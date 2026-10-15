export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type LogContext = Readonly<Record<string, unknown>>;

export interface StructuredLogger {
  trace(fields: LogContext | string, message?: string): void;
  debug(fields: LogContext | string, message?: string): void;
  info(fields: LogContext | string, message?: string): void;
  warn(fields: LogContext | string, message?: string): void;
  error(fields: LogContext | string, message?: string): void;
  fatal(fields: LogContext | string, message?: string): void;
  child(context: LogContext): StructuredLogger;
}

const LEVELS: Record<LogLevel, number> = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
};
const SECRET_FIELD =
  /(?:password|passwd|secret|token|authorization|cookie|api.?key|private.?key|credential|ssn|social.?security|email|phone)/i;
const SENSITIVE_TEXT =
  /\bBearer\s+[A-Za-z0-9._~+/-]+=*|\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+\b|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

function currentLevel(): LogLevel {
  const configured =
    typeof process !== 'undefined' ? process.env['LOG_LEVEL']?.toLowerCase() : undefined;
  return configured && configured in LEVELS ? (configured as LogLevel) : 'info';
}

function redact(value: unknown, seen = new WeakSet<object>()): unknown {
  if (typeof value === 'string') return value.replace(SENSITIVE_TEXT, '[REDACTED]');
  if (value instanceof Error) {
    return {
      name: value.name,
      message: redact(value.message, seen),
      ...(typeof (value as Error & { code?: unknown }).code === 'string'
        ? { code: (value as Error & { code: string }).code }
        : {}),
    };
  }
  if (Array.isArray(value)) return value.map((item) => redact(item, seen));
  if (value && typeof value === 'object') {
    if (seen.has(value)) return '[Circular]';
    seen.add(value);
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      result[key] = SECRET_FIELD.test(key) ? '[REDACTED]' : redact(item, seen);
    }
    seen.delete(value);
    return result;
  }
  return value;
}

function output(
  level: LogLevel,
  context: LogContext,
  fields: LogContext | string,
  message?: string,
): void {
  if (LEVELS[level] < LEVELS[currentLevel()]) return;
  const suppliedFields = typeof fields === 'string' ? {} : fields;
  const text = typeof fields === 'string' ? fields : (message ?? '');
  const record = redact({
    ...context,
    ...suppliedFields,
    ...(text ? { message: text } : {}),
    timestamp: new Date().toISOString(),
    level,
  }) as Record<string, unknown>;
  const serialized = JSON.stringify(record);
  const consoleMethod =
    level === 'fatal' || level === 'error'
      ? globalThis.console.error
      : level === 'warn'
        ? globalThis.console.warn
        : globalThis.console.info;
  consoleMethod.call(globalThis.console, serialized);
}

function makeLogger(context: LogContext): StructuredLogger {
  return {
    trace: (fields, message) => output('trace', context, fields, message),
    debug: (fields, message) => output('debug', context, fields, message),
    info: (fields, message) => output('info', context, fields, message),
    warn: (fields, message) => output('warn', context, fields, message),
    error: (fields, message) => output('error', context, fields, message),
    fatal: (fields, message) => output('fatal', context, fields, message),
    child: (additionalContext) => makeLogger({ ...context, ...additionalContext }),
  };
}

export const logger: StructuredLogger = makeLogger({});

export function createLogger(context: LogContext = {}): StructuredLogger {
  return makeLogger(context);
}
