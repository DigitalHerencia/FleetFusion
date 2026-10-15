"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function PublicNavLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const pathname = usePathname();
  const active = pathname === href.split("?")[0];
  return (
    <Link
      href={href}
      className="public-nav-link"
      aria-current={active ? "page" : undefined}
    >
      {label}
    </Link>
  );
}
