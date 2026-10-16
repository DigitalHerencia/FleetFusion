"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createComplianceItem } from "@/lib/actions/complianceActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ComplianceFormValues {
  subject: string;
  type: string;
  title: string;
  referenceNumber: string;
  issuedAt: string;
  expiresAt: string;
  assetId: string;
}
interface ComplianceFormOptions {
  drivers: Array<{ id: string; firstName: string; lastName: string; status: string }>;
  vehicles: Array<{ id: string; unitNumber: string; status: string }>;
  assets: Array<{ id: string; filename: string }>;
}

const documentTypes = [
  ["CDL", "Commercial driver's license"],
  ["MEDICAL_CARD", "Medical card"],
  ["REGISTRATION", "Registration"],
  ["INSURANCE", "Insurance"],
  ["ANNUAL_INSPECTION", "Annual inspection"],
  ["IRP_CAB_CARD", "IRP cab card"],
  ["IFTA_LICENSE", "IFTA license"],
  ["UCR", "UCR"],
  ["OPERATING_AUTHORITY", "Operating authority"],
  ["OTHER", "Other"],
];

export function ComplianceForm({ options }: { options: ComplianceFormOptions }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<ComplianceFormValues>({
    defaultValues: { subject: "ORGANIZATION", type: "OTHER", title: "", referenceNumber: "", issuedAt: "", expiresAt: "", assetId: "" },
  });
  return (
    <form className="space-y-4 surface-card p-5" onSubmit={handleSubmit(async (values) => {
      setError("");
      let subjectType: "ORGANIZATION" | "DRIVER" | "VEHICLE" = "ORGANIZATION";
      let driverId: string | null = null;
      let vehicleId: string | null = null;
      if (values.subject.startsWith("driver:")) {
        subjectType = "DRIVER";
        driverId = values.subject.slice("driver:".length);
      } else if (values.subject.startsWith("vehicle:")) {
        subjectType = "VEHICLE";
        vehicleId = values.subject.slice("vehicle:".length);
      }
      try {
        await createComplianceItem({
          subjectType,
          driverId,
          vehicleId,
          type: values.type,
          title: values.title || null,
          referenceNumber: values.referenceNumber || null,
          issuedAt: values.issuedAt ? new Date(values.issuedAt) : null,
          expiresAt: values.expiresAt ? new Date(values.expiresAt) : null,
          assetId: values.assetId || null,
        });
        router.refresh();
      } catch {
        setError("Compliance record could not be saved. Verify the subject, dates, and permissions.");
      }
    })}>
      <h2 className="type-title">Add compliance record</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="form-field">
          <Label htmlFor="compliance-subject">Applies to</Label>
          <select id="compliance-subject" className="control-field" {...register("subject")}>
            <option value="ORGANIZATION">Organization</option>
            {options.drivers.map((driver) => <option key={driver.id} value={`driver:${driver.id}`}>Driver: {driver.firstName} {driver.lastName}</option>)}
            {options.vehicles.map((vehicle) => <option key={vehicle.id} value={`vehicle:${vehicle.id}`}>Vehicle: {vehicle.unitNumber}</option>)}
          </select>
        </div>
        <div className="form-field">
          <Label htmlFor="compliance-type">Document type</Label>
          <select id="compliance-type" className="control-field" {...register("type")}>
            {documentTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div className="form-field"><Label htmlFor="compliance-title">Display name</Label><Input id="compliance-title" {...register("title")} /></div>
        <div className="form-field"><Label htmlFor="compliance-reference">Reference / policy number</Label><Input id="compliance-reference" {...register("referenceNumber")} /></div>
        <div className="form-field"><Label htmlFor="compliance-issued">Issue date</Label><Input id="compliance-issued" type="date" {...register("issuedAt")} /></div>
        <div className="form-field"><Label htmlFor="compliance-expires">Expiry date</Label><Input id="compliance-expires" type="date" {...register("expiresAt")} /></div>
        <div className="form-field sm:col-span-2">
          <Label htmlFor="compliance-asset">Uploaded file</Label>
          <select id="compliance-asset" className="control-field" {...register("assetId")}>
            <option value="">No file attached</option>
            {options.assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.filename}</option>)}
          </select>
          <p className="text-xs text-muted-foreground">Upload the file above first, then select it here.</p>
        </div>
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : "Save compliance record"}</Button>
    </form>
  );
}
