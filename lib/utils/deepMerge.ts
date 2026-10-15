type PlainObject = Record<PropertyKey, unknown>;

function isPlainObject(value: unknown): value is PlainObject {
  if (value === null || typeof value !== 'object') return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function mergeValue(target: unknown, source: unknown): unknown {
  if (!isPlainObject(source)) return source;
  const result: PlainObject = isPlainObject(target) ? { ...target } : {};
  for (const key of Reflect.ownKeys(source)) {
    const incoming = source[key];
    Object.defineProperty(result, key, {
      configurable: true,
      enumerable: true,
      writable: true,
      value: isPlainObject(incoming) ? mergeValue(result[key], incoming) : incoming,
    });
  }
  return result;
}

export function deepMerge<T extends object, U extends object>(target: T, source: U): T & U {
  return mergeValue(target, source) as T & U;
}

export function mergeDeep<T extends object>(...values: readonly object[]): T {
  return values.reduce<unknown>((result, value) => mergeValue(result, value), {}) as T;
}
