import type { LoaderCurveKey } from "@/types/uiTypes";

type Point = { x: number; y: number };

export function getPoint(
  curve: LoaderCurveKey,
  progress: number,
  detailScale = 1,
): Point {
  const t = Math.min(1, Math.max(0, progress)) * Math.PI * 2;

  if (curve === "spiral") {
    const radius = 7 + 32 * (t / (Math.PI * 2));
    return {
      x: 50 + radius * Math.cos(t * 2),
      y: 50 + radius * Math.sin(t * 2),
    };
  }

  if (curve === "lissajous") {
    return {
      x: 50 + 38 * Math.sin(3 * t),
      y: 50 + 38 * Math.sin(2 * t + Math.PI / 2),
    };
  }

  const radius = 34 * Math.cos(4 * t) * detailScale;
  return { x: 50 + radius * Math.cos(t), y: 50 + radius * Math.sin(t) };
}

export function getAngle(
  curve: LoaderCurveKey,
  progress: number,
  detailScale = 1,
): number {
  const current = getPoint(curve, progress, detailScale);
  const next = getPoint(curve, Math.min(progress + 0.002, 1), detailScale);
  return (Math.atan2(next.y - current.y, next.x - current.x) * 180) / Math.PI;
}

export function buildPath(curve: LoaderCurveKey, detailScale = 1): string {
  return Array.from({ length: 121 }, (_, index) => {
    const point = getPoint(curve, index / 120, detailScale);
    return `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
  }).join(" ");
}

export function getDetailScale(now: number, duration: number): number {
  return 0.94 + 0.06 * (1 + Math.sin((now / duration) * Math.PI * 2));
}

export function getCurvePulseDuration(curve: LoaderCurveKey): number {
  return curve === "spiral" ? 2400 : curve === "lissajous" ? 3200 : 2800;
}
