"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createLoad } from "@/lib/actions/dispatchActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoadFormValues {
  customerAccountId: string;
  referenceNumber: string;
  rate: string;
  miles: string;
  notes: string;
  pickupName: string;
  pickupAddress: string;
  pickupCity: string;
  pickupState: string;
  pickupPostalCode: string;
  deliveryName: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryPostalCode: string;
}

interface CustomerOption {
  id: string;
  name: string;
}

export function DispatchLoadForm({ customers }: { customers: CustomerOption[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<LoadFormValues>({
    defaultValues: {
      customerAccountId: "", referenceNumber: "", rate: "0", miles: "", notes: "",
      pickupName: "", pickupAddress: "", pickupCity: "", pickupState: "", pickupPostalCode: "",
      deliveryName: "", deliveryAddress: "", deliveryCity: "", deliveryState: "", deliveryPostalCode: "",
    },
  });
  const field = (name: keyof LoadFormValues, label: string, required = false, type = "text") => (
    <div className="form-field" key={name}>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} type={type} required={required} {...register(name)} />
    </div>
  );
  return (
    <form className="mx-auto max-w-4xl space-y-6 surface-card p-5" onSubmit={handleSubmit(async (values) => {
      setError("");
      try {
        const saved = await createLoad({
          customerAccountId: values.customerAccountId || undefined,
          referenceNumber: values.referenceNumber || undefined,
          rate: Number(values.rate),
          miles: values.miles ? Number(values.miles) : undefined,
          notes: values.notes || undefined,
          stops: [
            { type: "PICKUP", locationName: values.pickupName || undefined, address1: values.pickupAddress || undefined, city: values.pickupCity, state: values.pickupState, postalCode: values.pickupPostalCode || undefined },
            { type: "DELIVERY", locationName: values.deliveryName || undefined, address1: values.deliveryAddress || undefined, city: values.deliveryCity, state: values.deliveryState, postalCode: values.deliveryPostalCode || undefined },
          ],
        });
        router.push("/dispatch");
        router.refresh();
        return saved;
      } catch {
        setError("Load could not be created. Check the stop details and your dispatch permissions.");
      }
    })}>
      <div>
        <h1 className="type-title">Book a load</h1>
        <p className="text-sm text-muted-foreground">Create the load record and its pickup/delivery stops. Driver and vehicle assignment is managed from dispatch.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="form-field">
          <Label htmlFor="customerAccountId">Customer / broker</Label>
          <select id="customerAccountId" className="control-field" {...register("customerAccountId")}>
            <option value="">Select later</option>
            {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
          </select>
        </div>
        {field("referenceNumber", "Customer reference")}
        {field("rate", "Agreed rate (USD)", true, "number")}
        {field("miles", "Loaded miles", false, "number")}
      </div>
      <section className="space-y-4">
        <h2 className="type-label uppercase">Pickup</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {field("pickupName", "Facility / location")}
          {field("pickupAddress", "Street address")}
          {field("pickupCity", "City", true)}
          {field("pickupState", "State (2 letters)", true)}
          {field("pickupPostalCode", "ZIP / postal code")}
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="type-label uppercase">Delivery</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {field("deliveryName", "Facility / location")}
          {field("deliveryAddress", "Street address")}
          {field("deliveryCity", "City", true)}
          {field("deliveryState", "State (2 letters)", true)}
          {field("deliveryPostalCode", "ZIP / postal code")}
        </div>
      </section>
      <div className="form-field">
        <Label htmlFor="notes">Dispatch notes</Label>
        <textarea id="notes" className="control-field min-h-28" {...register("notes")} />
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating…" : "Create load"}</Button>
    </form>
  );
}
