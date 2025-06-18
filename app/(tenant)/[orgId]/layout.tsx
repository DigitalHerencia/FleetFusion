import type React from 'react';
import { TenantLayoutClient } from './TenantLayoutClient';

interface TenantLayoutProps {
  children: React.ReactNode;
  params: { orgId: string };
}

export default function TenantLayout({ children, params }: TenantLayoutProps) {
  const { orgId } = params;
  return <TenantLayoutClient orgId={orgId}>{children}</TenantLayoutClient>;
}
