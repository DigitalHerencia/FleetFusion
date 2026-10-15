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

export function PublicFooter({
  links = defaultPublicFooterLinks,
}: PublicFooterProps) {
  return (
    <footer className="public-footer">
      <div className="public-footer-inner">
        <p className="public-copyright">
          © {new Date().getFullYear()} {publicNavigation.copyright}
        </p>
        <nav className="public-nav" aria-label={publicNavigation.footerLabel}>
          {links.map((item) => (
            <PublicNavLink key={item.href} {...item} />
          ))}
        </nav>
      </div>
    </footer>
  );
}
