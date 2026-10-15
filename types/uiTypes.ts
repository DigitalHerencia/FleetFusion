export type LoaderCurveKey = "rose" | "spiral" | "lissajous";
export type ProgressCurveKey = LoaderCurveKey;
export type BackgroundCurveKey = LoaderCurveKey;

export interface RevealOptions {
  rootMargin?: string;
  threshold?: number;
  once?: boolean;
  delay?: number;
}

export interface StaggerOptions {
  delay?: number;
  initialDelay?: number;
  selector?: string;
}

export type PageTransition = "default" | "fade" | "slide";
