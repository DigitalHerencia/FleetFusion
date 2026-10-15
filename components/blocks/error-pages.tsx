"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import { safeHref } from "@/lib/utils/strings";
import {
  Home,
  ArrowLeft,
  Search,
  RefreshCw,
  AlertTriangle,
  ServerCrash,
  Construction,
  FileQuestion,
  Wifi,
  Ban,
  Clock,
  Lock,
} from "lucide-react";

// ============================================================================
// ERROR PAGE VARIANT 1: 404 Not Found
// ============================================================================
export interface NotFoundPageProps {
  title?: string;
  description?: string;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  homeHref?: string;
  backHref?: string;
  className?: string;
}

export function NotFoundPage({
  title = "404",
  description = "Oops! The page you're looking for doesn't exist or has been moved.",
  showSearch = false,
  onSearch,
  homeHref = "/",
  backHref,
  className,
}: NotFoundPageProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <div
      className={cn(
        "flex min-h-screen items-center justify-center bg-background p-4",
        className,
      )}
    >
      <div className="max-w-lg space-y-8 text-center">
        {/* Large 404 */}
        <div className="relative">
          <h1 className="text-[150px] leading-none font-black text-muted-foreground/20 md:text-[200px]">
            {title}
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-24 w-24 items-center justify-center border-3 border-foreground bg-primary shadow-[6px_6px_0px_hsl(var(--shadow-color))]">
              <FileQuestion className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-black uppercase md:text-3xl">
            Page Not Found
          </h2>
          <p className="text-muted-foreground">{description}</p>
        </div>

        {showSearch && (
          <form onSubmit={handleSearch} className="mx-auto flex max-w-sm gap-2">
            <Input
              type="search"
              placeholder="Search for pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" aria-label="Search">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        )}

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild>
            <a href={safeHref(homeHref)}>
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </a>
          </Button>
          {backHref && (
            <Button variant="outline" asChild>
              <a href={safeHref(backHref)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ERROR PAGE VARIANT 2: 500 Server Error
// ============================================================================
export interface ServerErrorPageProps {
  title?: string;
  description?: string;
  errorId?: string;
  onRetry?: () => void;
  homeHref?: string;
  supportEmail?: string;
  className?: string;
}

export function ServerErrorPage({
  title = "500",
  description = "Something went wrong on our end. Our team has been notified and is working on a fix.",
  errorId,
  onRetry,
  homeHref = "/",
  supportEmail,
  className,
}: ServerErrorPageProps) {
  return (
    <div
      className={cn(
        "flex min-h-screen items-center justify-center bg-background p-4",
        className,
      )}
    >
      <div className="max-w-lg space-y-8 text-center">
        {/* Large 500 */}
        <div className="relative">
          <h1 className="text-[150px] leading-none font-black text-muted-foreground/20 md:text-[200px]">
            {title}
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-24 w-24 items-center justify-center border-3 border-foreground bg-destructive shadow-[6px_6px_0px_hsl(var(--shadow-color))]">
              <ServerCrash className="h-12 w-12 text-destructive-foreground" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-black uppercase md:text-3xl">
            Server Error
          </h2>
          <p className="text-muted-foreground">{description}</p>
          {errorId && (
            <p className="border-2 border-foreground bg-muted p-2 font-mono text-xs text-muted-foreground">
              Error ID: {errorId}
            </p>
          )}
        </div>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          {onRetry && (
            <Button onClick={onRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
          <Button variant="outline" asChild>
            <a href={safeHref(homeHref)}>
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </a>
          </Button>
        </div>

        {supportEmail && (
          <p className="text-sm text-muted-foreground">
            Still having issues?{" "}
            <a
              href={safeHref(`mailto:${supportEmail}`)}
              className="font-bold text-primary hover:underline"
            >
              Contact support
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// ERROR PAGE VARIANT 3: Maintenance Page
// ============================================================================
export interface MaintenancePageProps {
  title?: string;
  description?: string;
  estimatedTime?: string;
  features?: string[];
  statusPageUrl?: string;
  className?: string;
}

export function MaintenancePage({
  title = "Under Maintenance",
  description = "We're currently performing scheduled maintenance to improve your experience.",
  estimatedTime,
  features,
  statusPageUrl,
  className,
}: MaintenancePageProps) {
  return (
    <div
      className={cn(
        "flex min-h-screen items-center justify-center bg-background p-4",
        className,
      )}
    >
      <div className="max-w-lg space-y-8 text-center">
        <div className="mx-auto flex h-32 w-32 items-center justify-center border-3 border-foreground bg-warning shadow-[8px_8px_0px_hsl(var(--shadow-color))]">
          <Construction className="h-16 w-16 text-warning-foreground" />
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-black tracking-tight uppercase md:text-4xl">
            {title}
          </h1>
          <p className="text-lg text-muted-foreground">{description}</p>

          {estimatedTime && (
            <div className="inline-flex items-center gap-2 border-3 border-foreground bg-muted px-4 py-2">
              <Clock className="h-5 w-5" />
              <span className="font-bold">Estimated time: {estimatedTime}</span>
            </div>
          )}
        </div>

        {features && features.length > 0 && (
          <div className="space-y-3 border-3 border-foreground bg-card p-6 text-left">
            <h3 className="text-sm font-bold uppercase">
              What we&apos;re working on:
            </h3>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li
                  key={`feature-${index}`}
                  className="flex items-start gap-2 text-sm"
                >
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border-2 border-foreground bg-primary text-primary-foreground">
                    ✓
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {statusPageUrl && (
          <Button variant="outline" asChild>
            <a
              href={safeHref(statusPageUrl)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Check Status Page
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// ERROR PAGE VARIANT 4: Offline Page
// ============================================================================
export interface OfflinePageProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function OfflinePage({
  title = "You're Offline",
  description = "It looks like you've lost your internet connection. Please check your connection and try again.",
  onRetry,
  className,
}: OfflinePageProps) {
  return (
    <div
      className={cn(
        "flex min-h-screen items-center justify-center bg-background p-4",
        className,
      )}
    >
      <div className="max-w-md space-y-8 text-center">
        <div className="mx-auto flex h-32 w-32 items-center justify-center border-3 border-foreground bg-muted shadow-[8px_8px_0px_hsl(var(--shadow-color))]">
          <Wifi className="h-16 w-16 text-muted-foreground" />
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-black tracking-tight uppercase md:text-4xl">
            {title}
          </h1>
          <p className="text-muted-foreground">{description}</p>
        </div>

        <div className="space-y-4">
          <div className="border-3 border-foreground bg-muted/30 p-4 text-left">
            <h3 className="mb-2 text-sm font-bold uppercase">Things to try:</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Check your Wi-Fi connection</li>
              <li>• Restart your router</li>
              <li>• Try disabling VPN if you&apos;re using one</li>
            </ul>
          </div>

          {onRetry && (
            <Button onClick={onRetry} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ERROR PAGE VARIANT 5: 403 Forbidden
// ============================================================================
export interface ForbiddenPageProps {
  title?: string;
  description?: string;
  homeHref?: string;
  loginHref?: string;
  className?: string;
}

export function ForbiddenPage({
  title = "403",
  description = "You don't have permission to access this page. Please contact your administrator if you believe this is an error.",
  homeHref = "/",
  loginHref,
  className,
}: ForbiddenPageProps) {
  return (
    <div
      className={cn(
        "flex min-h-screen items-center justify-center bg-background p-4",
        className,
      )}
    >
      <div className="max-w-lg space-y-8 text-center">
        {/* Large 403 */}
        <div className="relative">
          <h1 className="text-[150px] leading-none font-black text-muted-foreground/20 md:text-[200px]">
            {title}
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-24 w-24 items-center justify-center border-3 border-foreground bg-warning shadow-[6px_6px_0px_hsl(var(--shadow-color))]">
              <Ban className="h-12 w-12 text-warning-foreground" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-black uppercase md:text-3xl">
            Access Denied
          </h2>
          <p className="text-muted-foreground">{description}</p>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild>
            <a href={safeHref(homeHref)}>
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </a>
          </Button>
          {loginHref && (
            <Button variant="outline" asChild>
              <a href={safeHref(loginHref)}>
                <Lock className="mr-2 h-4 w-4" />
                Sign In
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ERROR PAGE VARIANT 6: Coming Soon
// ============================================================================

function getCountdown(launchDate?: Date) {
  if (!launchDate) return null;
  const total = launchDate.getTime() - Date.now();
  if (total <= 0) return null;
  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
  };
}

export interface ComingSoonPageProps {
  title?: string;
  description?: string;
  launchDate?: Date;
  onNotify?: (email: string) => void;
  className?: string;
}

export function ComingSoonPage({
  title = "Coming Soon",
  description = "We're working hard to bring you something amazing. Stay tuned!",
  launchDate,
  onNotify,
  className,
}: ComingSoonPageProps) {
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNotify?.(email);
    setSubmitted(true);
  };

  const [timeRemaining, setTimeRemaining] = React.useState(() =>
    getCountdown(launchDate),
  );

  React.useEffect(() => {
    if (!launchDate) return;
    const interval = setInterval(() => {
      setTimeRemaining(getCountdown(launchDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [launchDate]);

  return (
    <div
      className={cn(
        "flex min-h-screen items-center justify-center bg-background p-4",
        className,
      )}
    >
      <div className="max-w-lg space-y-8 text-center">
        <div className="mx-auto flex h-32 w-32 items-center justify-center border-3 border-foreground bg-primary shadow-[8px_8px_0px_hsl(var(--shadow-color))]">
          <Clock className="h-16 w-16 text-primary-foreground" />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-black tracking-tight uppercase md:text-5xl">
            {title}
          </h1>
          <p className="text-lg text-muted-foreground">{description}</p>
        </div>

        {timeRemaining && (
          <div className="flex justify-center gap-4">
            {[
              { value: timeRemaining.days, label: "Days" },
              { value: timeRemaining.hours, label: "Hours" },
              { value: timeRemaining.minutes, label: "Minutes" },
            ].map((item) => (
              <div
                key={`action-${item.label}`}
                className="w-24 border-3 border-foreground bg-card p-4 shadow-[4px_4px_0px_hsl(var(--shadow-color))]"
              >
                <div className="text-3xl font-black">{item.value}</div>
                <div className="text-xs font-bold text-muted-foreground uppercase">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {onNotify && !submitted && (
          <form onSubmit={handleSubmit} className="mx-auto flex max-w-sm gap-2">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit">Notify Me</Button>
          </form>
        )}

        {submitted && (
          <div className="border-3 border-success bg-success/10 p-4">
            <p className="font-bold text-success">
              Thanks! We&apos;ll notify you when we launch.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// ERROR PAGE VARIANT 7: Generic Error
// ============================================================================
export interface GenericErrorPageProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  actions?: Array<{
    label: string;
    href?: string;
    onClick?: () => void;
    variant?: "default" | "outline";
  }>;
  className?: string;
}

export function GenericErrorPage({
  icon,
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again later.",
  actions,
  className,
}: GenericErrorPageProps) {
  return (
    <div
      className={cn(
        "flex min-h-screen items-center justify-center bg-background p-4",
        className,
      )}
    >
      <div className="max-w-md space-y-8 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center border-3 border-foreground bg-destructive/10 shadow-[6px_6px_0px_hsl(var(--shadow-color))]">
          {icon || <AlertTriangle className="h-12 w-12 text-destructive" />}
        </div>

        <div className="space-y-4">
          <h1 className="text-2xl font-black tracking-tight uppercase md:text-3xl">
            {title}
          </h1>
          <p className="text-muted-foreground">{description}</p>
        </div>

        {actions && actions.length > 0 && (
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            {actions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant || "default"}
                onClick={action.onClick}
                asChild={!!action.href}
              >
                {action.href ? (
                  <a href={safeHref(action.href)}>{action.label}</a>
                ) : (
                  action.label
                )}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Export all variants
// ============================================================================
export const ErrorPages = {
  NotFound: NotFoundPage,
  ServerError: ServerErrorPage,
  Maintenance: MaintenancePage,
  Offline: OfflinePage,
  Forbidden: ForbiddenPage,
  ComingSoon: ComingSoonPage,
  Generic: GenericErrorPage,
};
