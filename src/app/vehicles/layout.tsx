import { DomainLayoutShell } from '@/components/layouts/DomainLayoutShell';

export default function VehiclesLayout({ children }: { children: React.ReactNode }) {
  // Wrap vehicles pages in a domain-specific layout shell (navigation, etc.)
  return <DomainLayoutShell>{children}</DomainLayoutShell>;
}
