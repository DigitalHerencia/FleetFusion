export type UndefinedStripped<T> = {
  [K in keyof T as undefined extends T[K] ? never : K]: T[K];
} & {
  [K in keyof T as undefined extends T[K] ? K : never]?: Exclude<T[K], undefined>;
};

export function stripUndefinedKeys<T extends Record<string, unknown>>(
  value: T,
): UndefinedStripped<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as UndefinedStripped<T>;
}
