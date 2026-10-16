"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { archiveComplianceItem } from "@/lib/actions/complianceActions";
import { Button } from "@/components/ui/button";

export function ComplianceArchiveButton({ id, version }: { id: string; version: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="space-y-1">
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={busy}
        onClick={async () => {
          if (!window.confirm("Archive this compliance record? It will stop appearing in active expiry monitoring.")) return;
          setBusy(true);
          setError("");
          try {
            await archiveComplianceItem({ complianceItemId: id, expectedVersion: version });
            router.refresh();
          } catch {
            setError("Could not archive this record. Reload if another user changed it.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Archiving…" : "Archive"}
      </Button>
      {error && <p role="alert" className="max-w-48 text-xs text-destructive">{error}</p>}
    </div>
  );
}
