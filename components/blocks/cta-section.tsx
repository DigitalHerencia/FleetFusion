import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import { safeHref } from "@/lib/utils/strings";
import { ArrowRight, Mail, Sparkles, Zap } from "lucide-react";

// ============================================================================
// CTA VARIANT 1: Simple Centered
// ============================================================================
export interface CTASimpleProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  primaryAction: { label: string; href?: string; onClick?: () => void };
  secondaryAction?: { label: string; href?: string; onClick?: () => void };
  className?: string;
}

export function CTASimple({
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
}: CTASimpleProps) {
  return (
    <section className={cn("px-4 py-16 md:px-8 lg:px-16", className)}>
      <div className="mx-auto max-w-4xl space-y-6 text-center">
        <h2 className="text-3xl font-black tracking-tight uppercase md:text-4xl">
          {title}
        </h2>

        {description && (
          <div className="mx-auto max-w-2xl text-lg font-medium whitespace-pre-line text-foreground/90 [&_p]:my-4">
            {description}
          </div>
        )}

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          {primaryAction.href ? (
            <Button size="lg" asChild>
              <a href={safeHref(primaryAction.href)}>
                {primaryAction.label}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          ) : (
            <Button size="lg" onClick={primaryAction.onClick}>
              {primaryAction.label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          {secondaryAction &&
            (secondaryAction.href ? (
              <Button size="lg" variant="outline" asChild>
                <a href={safeHref(secondaryAction.href)}>
                  {secondaryAction.label}
                </a>
              </Button>
            ) : (
              <Button
                size="lg"
                variant="outline"
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </Button>
            ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CTA VARIANT 2: With Background
// ============================================================================
export interface CTAWithBackgroundProps {
  title: string;
  description?: string;
  primaryAction: { label: string; href?: string; onClick?: () => void };
  backgroundColor?: "primary" | "secondary" | "accent" | "muted";
  className?: string;
}

export function CTAWithBackground({
  title,
  description,
  primaryAction,
  backgroundColor = "primary",
  className,
}: CTAWithBackgroundProps) {
  const bgColors = {
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    accent: "bg-accent text-accent-foreground",
    muted: "bg-muted text-foreground",
  };

  return (
    <section className={cn("px-4 py-16 md:px-8 lg:px-16", className)}>
      <div
        className={cn(
          "mx-auto max-w-5xl border-3 border-foreground p-8 shadow-[8px_8px_0px_hsl(var(--shadow-color))] md:p-12",
          bgColors[backgroundColor],
        )}
      >
        <div className="space-y-6 text-center">
          <Sparkles className="mx-auto h-12 w-12" />

          <h2 className="text-3xl font-black tracking-tight uppercase md:text-4xl">
            {title}
          </h2>

          {description && (
            <p className="mx-auto max-w-2xl text-lg font-medium opacity-90">
              {description}
            </p>
          )}

          {primaryAction.href ? (
            <Button
              size="lg"
              variant={backgroundColor === "muted" ? "default" : "outline"}
              className={
                backgroundColor !== "muted"
                  ? "bg-background text-foreground hover:bg-background/90"
                  : ""
              }
              asChild
            >
              <a href={safeHref(primaryAction.href)}>
                {primaryAction.label}
                <Zap className="ml-2 h-4 w-4" />
              </a>
            </Button>
          ) : (
            <Button
              size="lg"
              variant={backgroundColor === "muted" ? "default" : "outline"}
              className={
                backgroundColor !== "muted"
                  ? "bg-background text-foreground hover:bg-background/90"
                  : ""
              }
              onClick={primaryAction.onClick}
            >
              {primaryAction.label}
              <Zap className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CTA VARIANT 3: Newsletter
// ============================================================================
export interface CTANewsletterProps {
  title: string;
  description?: string;
  placeholder?: string;
  buttonLabel?: string;
  onSubmit?: (email: string) => void;
  className?: string;
}

export function CTANewsletter({
  title,
  description,
  placeholder = "Enter your email",
  buttonLabel = "Subscribe",
  onSubmit,
  className,
}: CTANewsletterProps) {
  const [email, setEmail] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(email);
    setEmail("");
  };

  return (
    <section
      className={cn("bg-muted/30 px-4 py-16 md:px-8 lg:px-16", className)}
    >
      <div className="mx-auto max-w-2xl space-y-6 text-center">
        <Mail className="mx-auto h-12 w-12 text-primary" />

        <h2 className="text-2xl font-black tracking-tight uppercase md:text-3xl">
          {title}
        </h2>

        {description && (
          <p className="font-medium text-muted-foreground">{description}</p>
        )}

        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
        >
          <Input
            type="email"
            placeholder={placeholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
            required
          />
          <Button type="submit" size="lg">
            {buttonLabel}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>

        <p className="text-xs text-muted-foreground">
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}

// ============================================================================
// CTA VARIANT 4: Split with Image
// ============================================================================
export interface CTASplitProps {
  title: string;
  description?: string;
  primaryAction: { label: string; href?: string; onClick?: () => void };
  secondaryAction?: { label: string; href?: string; onClick?: () => void };
  imageSrc: string;
  imageAlt?: string;
  imagePosition?: "left" | "right";
  className?: string;
}

export function CTASplit({
  title,
  description,
  primaryAction,
  secondaryAction,
  imageSrc,
  imageAlt = "CTA image",
  imagePosition = "right",
  className,
}: CTASplitProps) {
  return (
    <section className={cn("px-4 py-16 md:px-8 lg:px-16", className)}>
      <div className="mx-auto max-w-6xl overflow-hidden border-3 border-foreground shadow-[8px_8px_0px_hsl(var(--shadow-color))]">
        <div
          className={cn(
            "grid md:grid-cols-2",
            imagePosition === "left" && "md:[&>*:first-child]:order-2",
          )}
        >
          <div className="flex flex-col justify-center space-y-6 p-8 md:p-12">
            <h2 className="text-2xl font-black tracking-tight uppercase md:text-3xl">
              {title}
            </h2>

            {description && (
              <p className="font-medium text-muted-foreground">{description}</p>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              {primaryAction.href ? (
                <Button size="lg" asChild>
                  <a href={safeHref(primaryAction.href)}>
                    {primaryAction.label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              ) : (
                <Button size="lg" onClick={primaryAction.onClick}>
                  {primaryAction.label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              {secondaryAction &&
                (secondaryAction.href ? (
                  <Button size="lg" variant="outline" asChild>
                    <a href={safeHref(secondaryAction.href)}>
                      {secondaryAction.label}
                    </a>
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={secondaryAction.onClick}
                  >
                    {secondaryAction.label}
                  </Button>
                ))}
            </div>
          </div>

          <div className="bg-muted">
            <Image
              src={imageSrc}
              alt={imageAlt}
              height={800}
              unoptimized
              width={1200}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CTA VARIANT 5: Banner
// ============================================================================
export interface CTABannerProps {
  text: string;
  action: { label: string; href?: string; onClick?: () => void };
  dismissible?: boolean;
  onDismiss?: () => void;
  variant?: "primary" | "secondary" | "accent" | "warning";
  className?: string;
}

export function CTABanner({
  text,
  action,
  dismissible = false,
  onDismiss,
  variant = "primary",
  className,
}: CTABannerProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  const variantStyles = {
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    accent: "bg-accent text-accent-foreground",
    warning: "bg-yellow-500 text-foreground",
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "relative border-b-3 border-foreground px-4 py-3",
        variantStyles[variant],
        className,
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-3 text-center sm:flex-row sm:text-left">
        <p className="text-sm font-bold">{text}</p>
        {action.href ? (
          <Button
            size="sm"
            variant="outline"
            className="shrink-0 bg-background text-foreground hover:bg-background/90"
            asChild
          >
            <a href={safeHref(action.href)}>
              {action.label}
              <ArrowRight className="ml-1 h-3 w-3" />
            </a>
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="shrink-0 bg-background text-foreground hover:bg-background/90"
            onClick={action.onClick}
          >
            {action.label}
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        )}
        {dismissible && (
          <button
            aria-label="Dismiss"
            onClick={() => {
              setIsVisible(false);
              onDismiss?.();
            }}
            className="absolute right-4 text-current opacity-70 hover:opacity-100"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Export all variants
// ============================================================================
export const CTASection = {
  Simple: CTASimple,
  WithBackground: CTAWithBackground,
  Newsletter: CTANewsletter,
  Split: CTASplit,
  Banner: CTABanner,
};
