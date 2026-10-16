"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createDriver } from "@/lib/actions/fleetActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DriverFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  hiredAt: string;
  status: "ACTIVE" | "ON_LEAVE" | "INACTIVE";
}

export function DriverForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<DriverFormValues>({
    defaultValues: { firstName: "", lastName: "", email: "", phone: "", hiredAt: "", status: "ACTIVE" },
  });
  return (
    <form className="mx-auto max-w-2xl space-y-5 surface-card p-5" onSubmit={handleSubmit(async (values) => {
      setError("");
      try {
        await createDriver({ ...values, email: values.email || null, phone: values.phone || null, hiredAt: values.hiredAt ? new Date(values.hiredAt) : null });
        router.push("/drivers");
        router.refresh();
      } catch {
        setError("Driver could not be saved. Check the fields and your fleet permissions.");
      }
    })}>
      <h1 className="type-title">Add driver</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="form-field"><Label htmlFor="driver-first-name">First name</Label><Input id="driver-first-name" required {...register("firstName")} /></div>
        <div className="form-field"><Label htmlFor="driver-last-name">Last name</Label><Input id="driver-last-name" required {...register("lastName")} /></div>
        <div className="form-field"><Label htmlFor="driver-email">Email</Label><Input id="driver-email" type="email" {...register("email")} /></div>
        <div className="form-field"><Label htmlFor="driver-phone">Phone</Label><Input id="driver-phone" type="tel" {...register("phone")} /></div>
        <div className="form-field"><Label htmlFor="driver-hired-at">Hire date</Label><Input id="driver-hired-at" type="date" {...register("hiredAt")} /></div>
        <div className="form-field"><Label htmlFor="driver-status">Status</Label><select id="driver-status" className="control-field" {...register("status")}><option value="ACTIVE">Active</option><option value="ON_LEAVE">On leave</option><option value="INACTIVE">Inactive</option></select></div>
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : "Save driver"}</Button>
    </form>
  );
}
