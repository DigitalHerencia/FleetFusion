import Link from "next/link";
import { applicationProduct } from "@/content/application";
import { LogoLockup } from "@/components/brand/logo-lockup";

export function Wordmark({
  collapsed = false,
  compact = false,
}: {
  collapsed?: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label={applicationProduct.brand.homeLabel}
      className="brand-home"
    >
      <LogoLockup
        collapsed={collapsed}
        size={compact ? "compact" : "default"}
      />
    </Link>
  );
}
