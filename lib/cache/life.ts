export const cacheLife = {
  realtime: 0,
  short: 30,
  standard: 300,
  long: 3_600,
  static: 86_400,
} as const;

export type CacheLifeName = keyof typeof cacheLife;
