export type MetricLabels = Readonly<Record<string, string | number | boolean>>;

export interface MetricSnapshot {
  counters: ReadonlyArray<{ name: string; labels: MetricLabels; value: number }>;
  gauges: ReadonlyArray<{ name: string; labels: MetricLabels; value: number }>;
  histograms: ReadonlyArray<{
    name: string;
    labels: MetricLabels;
    count: number;
    sum: number;
    buckets: Readonly<Record<string, number>>;
  }>;
}

interface HistogramData {
  count: number;
  sum: number;
  buckets: Map<number, number>;
}

const DEFAULT_BUCKETS = [5, 10, 25, 50, 100, 250, 500, 1_000, 2_500, 5_000];
const MAX_SERIES = 2_000;
const counters = new Map<string, { name: string; labels: MetricLabels; value: number }>();
const gauges = new Map<string, { name: string; labels: MetricLabels; value: number }>();
const histograms = new Map<string, { name: string; labels: MetricLabels; data: HistogramData }>();

function validateName(name: string): void {
  if (!/^[a-zA-Z_:][a-zA-Z0-9_:]*$/.test(name)) {
    throw new TypeError(`Invalid metric name "${name}".`);
  }
}

function normalizeLabels(labels: MetricLabels = {}): { key: string; labels: MetricLabels } {
  const normalized = Object.fromEntries(
    Object.entries(labels)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => {
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key) || key === '__name__') {
          throw new TypeError(`Invalid metric label name "${key}".`);
        }
        return [key, String(value)];
      }),
  );
  return { key: JSON.stringify(normalized), labels: normalized };
}

function ensureCapacity(store: Map<string, unknown>, key: string): void {
  if (!store.has(key) && store.size >= MAX_SERIES) {
    throw new RangeError(`Metric series limit (${MAX_SERIES}) reached; reduce label cardinality.`);
  }
}

export function incrementCounter(name: string, value = 1, labels: MetricLabels = {}): number {
  validateName(name);
  if (!Number.isFinite(value) || value < 0)
    throw new RangeError('Counter increments must be finite and non-negative.');
  const normalized = normalizeLabels(labels);
  const key = `${name}:${normalized.key}`;
  ensureCapacity(counters, key);
  const metric = counters.get(key) ?? { name, labels: normalized.labels, value: 0 };
  metric.value += value;
  counters.set(key, metric);
  return metric.value;
}

export function setGauge(name: string, value: number, labels: MetricLabels = {}): void {
  validateName(name);
  if (!Number.isFinite(value)) throw new RangeError('Gauge values must be finite.');
  const normalized = normalizeLabels(labels);
  const key = `${name}:${normalized.key}`;
  ensureCapacity(gauges, key);
  gauges.set(key, { name, labels: normalized.labels, value });
}

export function observeHistogram(
  name: string,
  value: number,
  labels: MetricLabels = {},
  bucketBoundaries: readonly number[] = DEFAULT_BUCKETS,
): void {
  validateName(name);
  if (!Number.isFinite(value) || value < 0)
    throw new RangeError('Histogram observations must be finite and non-negative.');
  const boundaries = [...bucketBoundaries];
  if (
    boundaries.some(
      (bound, index) =>
        !Number.isFinite(bound) || bound <= 0 || (index > 0 && bound <= boundaries[index - 1]!),
    )
  ) {
    throw new TypeError(
      'Histogram bucket boundaries must be positive, finite, and strictly increasing.',
    );
  }
  const normalized = normalizeLabels(labels);
  const key = `${name}:${normalized.key}`;
  ensureCapacity(histograms, key);
  let metric = histograms.get(key);
  if (metric && [...metric.data.buckets.keys()].join(',') !== boundaries.join(',')) {
    throw new TypeError(
      `Histogram "${name}" was already created with different bucket boundaries.`,
    );
  }
  metric ??= {
    name,
    labels: normalized.labels,
    data: { count: 0, sum: 0, buckets: new Map(boundaries.map((bound) => [bound, 0])) },
  };
  metric.data.count += 1;
  metric.data.sum += value;
  for (const bound of metric.data.buckets.keys()) {
    if (value <= bound) metric.data.buckets.set(bound, metric.data.buckets.get(bound)! + 1);
  }
  histograms.set(key, metric);
}

export function recordRequestMetrics(input: {
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
}): void {
  const labels = {
    method: input.method.toUpperCase(),
    path: input.path,
    status: Math.trunc(input.statusCode),
  };
  incrementCounter('http_requests_total', 1, labels);
  observeHistogram('http_request_duration_ms', input.durationMs, labels);
}

export function recordWebhookFailure(provider: string, reason = 'unspecified'): void {
  incrementCounter('webhook_failures_total', 1, { provider, reason });
}

export function getMetricSnapshot(): MetricSnapshot {
  return {
    counters: [...counters.values()].map((metric) => ({ ...metric, labels: { ...metric.labels } })),
    gauges: [...gauges.values()].map((metric) => ({ ...metric, labels: { ...metric.labels } })),
    histograms: [...histograms.values()].map(({ name, labels, data }) => ({
      name,
      labels: { ...labels },
      count: data.count,
      sum: data.sum,
      buckets: Object.fromEntries(
        [...data.buckets.entries()].map(([bound, count]) => [String(bound), count]),
      ),
    })),
  };
}

function formatLabels(labels: MetricLabels, extra: Record<string, string> = {}): string {
  const values = Object.entries({ ...labels, ...extra });
  return values.length
    ? `{${values.map(([key, value]) => `${key}="${String(value).replaceAll('\\', '\\\\').replaceAll('"', '\\"').replaceAll('\n', '\\n')}"`).join(',')}}`
    : '';
}

export function exportPrometheusMetrics(): string {
  const lines: string[] = [];
  for (const { name, labels, value } of counters.values())
    lines.push(`${name}${formatLabels(labels)} ${value}`);
  for (const { name, labels, value } of gauges.values())
    lines.push(`${name}${formatLabels(labels)} ${value}`);
  for (const { name, labels, data } of histograms.values()) {
    for (const [bound, count] of data.buckets) {
      lines.push(`${name}_bucket${formatLabels(labels, { le: String(bound) })} ${count}`);
    }
    lines.push(`${name}_bucket${formatLabels(labels, { le: '+Inf' })} ${data.count}`);
    lines.push(`${name}_sum${formatLabels(labels)} ${data.sum}`);
    lines.push(`${name}_count${formatLabels(labels)} ${data.count}`);
  }
  return lines.length ? `${lines.join('\n')}\n` : '';
}

export function resetMetrics(): void {
  counters.clear();
  gauges.clear();
  histograms.clear();
}
