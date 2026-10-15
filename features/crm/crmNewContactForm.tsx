"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createContact, updateContact } from "@/lib/actions/crmActions";
import type { ContactFormValues, CrmContactDTO } from "@/types/crmTypes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export function CrmNewContactForm({
  contact,
  lead = false,
}: {
  contact?: CrmContactDTO;
  lead?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ContactFormValues>({
    defaultValues: {
      firstName: contact?.firstName ?? "",
      lastName: contact?.lastName ?? "",
      email: contact?.email ?? "",
      phone: contact?.phone ?? "",
      title: contact?.title ?? "",
      status:
        contact?.status === "ARCHIVED"
          ? "INACTIVE"
          : (contact?.status ?? (lead ? "LEAD" : "ACTIVE")),
    },
  });
  return (
    <form
      className="mx-auto max-w-3xl space-y-5 surface-card p-5"
      onSubmit={handleSubmit(async (values) => {
        setError("");
        try {
          const saved = contact
            ? await updateContact({
                ...values,
                contactId: contact.id,
                expectedUpdatedAt: contact.updatedAt,
              })
            : await createContact(values);
          router.push(`/crm/${lead ? "leads" : "contacts"}/${saved.id}`);
          router.refresh();
        } catch {
          setError(
            "Contact could not be saved. Check the fields and your permissions. Reload if the record has changed.",
          );
        }
      })}
    >
      <h1 className="type-title">
        {contact ? "Edit" : "New"} {lead ? "lead" : "contact"}
      </h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {(["firstName", "lastName", "email", "phone", "title"] as const).map(
          (field) => (
            <div className="form-field" key={field}>
              <Label htmlFor={field}>
                {
                  {
                    firstName: "First name",
                    lastName: "Last name",
                    email: "Email",
                    phone: "Phone",
                    title: "Job title",
                  }[field]
                }
              </Label>
              <Input
                id={field}
                type={field === "email" ? "email" : "text"}
                required={field === "firstName" || field === "lastName"}
                {...register(field)}
              />
            </div>
          ),
        )}
        <div className="form-field">
          <Label htmlFor="contact-status">Relationship status</Label>
          <select
            id="contact-status"
            className="control-field"
            {...register("status")}
          >
            <option>LEAD</option>
            <option>ACTIVE</option>
            <option>INACTIVE</option>
          </select>
        </div>
      </div>
      {error && <p role="alert">{error}</p>}
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? "Saving…" : "Save contact"}
      </Button>
    </form>
  );
}
