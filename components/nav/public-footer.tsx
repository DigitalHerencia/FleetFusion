import { PublicNavLink } from "@/components/nav/public-nav-link";
import { publicNavigation } from "@/content/public-navigation";

export interface PublicFooterLink {
  label: string;
  href: string;
}

export interface PublicFooterProps {
  links?: readonly PublicFooterLink[] | undefined;
}

export const defaultPublicFooterLinks = publicNavigation.footerLinks;

export function PublicFooter({ links = defaultPublicFooterLinks }: PublicFooterProps) {
  return (
    <footer className="relative z-10 border-t border-border bg-background/95 px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} {publicNavigation.copyright}</p>
        <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label={publicNavigation.footerLabel}>
          {links.map((item) => <PublicNavLink key={item.href} {...item} />)}
        </nav>
      </div>
    </footer>
  );
}
