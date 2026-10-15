import type { ReactNode } from "react";
import Link from "next/link";
import { LogoLockup } from "@/components/brand/logo-lockup";
import { Button } from "@/components/ui/button";
import { applicationProduct } from "@/content/application";
import { publicNavigation } from "@/content/public-navigation";

export interface PublicHeaderProps {
  logo?: ReactNode | undefined;
}

export function PublicHeader({ logo = <LogoLockup /> }: PublicHeaderProps) {
  return (
    <header className="public-header">
      <div className="public-header-inner">
        <Link
          href="/"
          aria-label={applicationProduct.brand.homeLabel}
          className="brand-home"
        >
          {logo}
        </Link>
        <nav
          className="public-header-actions"
          aria-label={publicNavigation.headerLabel}
        >
          {publicNavigation.headerLinks.map((item, index) => (
            <Button
              key={item.href}
              variant={index === 0 ? "default" : "outline"}
              size="default"
              asChild
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
}
