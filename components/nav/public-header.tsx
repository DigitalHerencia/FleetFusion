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
    <header className="relative z-30 border-b border-white/10 bg-background/95 text-foreground shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label={applicationProduct.brand.homeLabel} className="shrink-0 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
          {logo}
        </Link>
        <nav className="flex items-center justify-end gap-2 sm:gap-3" aria-label={publicNavigation.headerLabel}>
          {publicNavigation.headerLinks.map((item, index) => (
            <Button key={item.href} variant={index === publicNavigation.headerLinks.length - 1 ? "default" : "ghost"} size="sm" className={index === publicNavigation.headerLinks.length - 1 ? "hidden sm:inline-flex" : "hidden sm:inline-flex"} asChild>
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
          <Button size="sm" className="sm:hidden" asChild><Link href="/sign-up">Start free trial</Link></Button>
        </nav>
      </div>
    </header>
  );
}
