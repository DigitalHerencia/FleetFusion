import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ComplianceArchiveButton } from "@/features/compliance/complianceArchiveButton";
import { Card, CardContent } from "@/components/ui/card";
import { WorkspaceFileUpload } from "@/features/portal/workspaceFileUpload.client";
import { ComplianceForm } from "@/features/compliance/complianceForm";
import {
  getComplianceFormOptions,
  getComplianceItems,
  getComplianceWriteAccess,
} from "@/lib/fetchers/complianceFetchers";

function daysUntilExpiry(expiresAt: Date | null) {
  if (!expiresAt) return null;
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const expiry = Date.UTC(expiresAt.getUTCFullYear(), expiresAt.getUTCMonth(), expiresAt.getUTCDate());
  return Math.round((expiry - today) / 86_400_000);
}

function expiryState(expiresAt: Date | null) {
  const days = daysUntilExpiry(expiresAt);
  if (days === null) return { label: "No expiry date", variant: "outline" as const };
  if (days < 0) return { label: `Expired ${Math.abs(days)}d ago`, variant: "destructive" as const };
  if (days <= 7) return { label: days === 0 ? "Expires today" : `Expires in ${days}d`, variant: "destructive" as const };
  if (days <= 30) return { label: `Expires in ${days}d`, variant: "default" as const };
  if (days <= 60) return { label: `Expires in ${days}d`, variant: "secondary" as const };
  return { label: "Current", variant: "outline" as const };
}

export async function ComplianceFeature() {
  const [items, canWrite] = await Promise.all([
    getComplianceItems(),
    getComplianceWriteAccess(),
  ]);
  const options = canWrite ? await getComplianceFormOptions() : null;
  const expired = items.filter((item) => {
    const days = daysUntilExpiry(item.expiresAt);
    return days !== null && days < 0;
  }).length;
  const urgent = items.filter((item) => {
    const days = daysUntilExpiry(item.expiresAt);
    return days !== null && days >= 0 && days <= 7;
  }).length;

  return (
    <main className="container space-y-6 py-8">
      <header className="space-y-2 border-b-3 border-foreground pb-6">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Fleet operations</p>
        <h1 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">Compliance vault</h1>
        <p className="max-w-3xl text-muted-foreground">Track organization, driver, and vehicle documents. Expiry windows are calculated from the recorded expiry date.</p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Badge variant={expired ? "destructive" : "outline"}>{expired} expired</Badge>
          <Badge variant={urgent ? "destructive" : "outline"}>{urgent} due within 7 days</Badge>
          <Badge variant="secondary">{items.length} active records</Badge>
        </div>
      </header>

      {canWrite && options && (
        <section className="grid items-start gap-4 xl:grid-cols-2">
          <div className="space-y-3">
            <h2 className="type-label uppercase">Document storage</h2>
            <WorkspaceFileUpload domain="compliance" />
            <p className="text-xs text-muted-foreground">Uploads are stored privately. Add a record below to associate the file with a compliance requirement.</p>
          </div>
          <ComplianceForm options={options} />
        </section>
      )}

      <section className="space-y-3">
        <h2 className="type-label uppercase">Documents and expiry alerts</h2>
        {items.map((item) => {
          const state = expiryState(item.expiresAt);
          const subject = item.subjectType === "DRIVER"
            ? `Driver: ${item.driver ? `${item.driver.firstName} ${item.driver.lastName}` : "Unknown driver"}`
            : item.subjectType === "VEHICLE"
              ? `Vehicle: ${item.vehicle?.unitNumber ?? "Unknown vehicle"}`
              : "Organization";
          return (
            <Card key={item.id}>
              <CardContent className="flex flex-wrap items-start justify-between gap-4 p-4">
                <div className="min-w-0 space-y-1">
                  <h3 className="font-bold">{item.title || item.type.replaceAll("_", " ")}</h3>
                  <p className="text-sm text-muted-foreground">{subject} · {item.type.replaceAll("_", " ")}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.referenceNumber ? `Reference ${item.referenceNumber} · ` : ""}
                    {item.expiresAt ? `Expires ${item.expiresAt.toLocaleDateString()}` : "No expiry date recorded"}
                    {item.asset ? ` · File: ${item.asset.filename}` : " · No file attached"}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <Badge variant={state.variant}>{state.label}</Badge>
                  {canWrite && (
                    <div className="flex items-center gap-2">
                      <Button asChild size="sm" variant="outline"><Link href={"/compliance/" + item.id + "/edit"}>Edit</Link></Button>
                      <ComplianceArchiveButton id={item.id} version={item.version} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {items.length === 0 && <Card><CardContent className="p-6 text-sm text-muted-foreground">No compliance records have been added for this organization.</CardContent></Card>}
      </section>
    </main>
  );
}
