import type { ChartConfig } from "./types";

// Neubrutalism color palettes for charts
export const CHART_PALETTES = {
  bold: [
    "hsl(var(--primary))",
    "hsl(var(--secondary))",
    "hsl(var(--accent))",
    "hsl(var(--success))",
    "hsl(var(--warning))",
    "hsl(var(--info))",
  ],
  vibrant: [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ],
  pastel: [
    "hsl(var(--chart-1) / 0.72)",
    "hsl(var(--chart-2) / 0.72)",
    "hsl(var(--chart-3) / 0.72)",
    "hsl(var(--chart-4) / 0.72)",
    "hsl(var(--chart-5) / 0.72)",
  ],
  monochrome: [
    "hsl(var(--foreground))",
    "hsl(var(--foreground) / 0.8)",
    "hsl(var(--foreground) / 0.6)",
    "hsl(var(--foreground) / 0.4)",
    "hsl(var(--foreground) / 0.2)",
    "hsl(var(--foreground) / 0.1)",
  ],
} as const;

export type ChartPalette = keyof typeof CHART_PALETTES;

// Helper to get colors from a palette
export function getChartColor(palette: ChartPalette, index: number): string {
  const colors = CHART_PALETTES[palette];
  return colors[index % colors.length]!;
}

// Generate ChartConfig from palette
export function createChartConfig(
  keys: string[],
  labels: string[],
  palette: ChartPalette = "bold",
): ChartConfig {
  const config: ChartConfig = {};
  keys.forEach((key, index) => {
    config[key] = {
      label: labels[index] || key,
      color: getChartColor(palette, index),
    };
  });
  return config;
}
