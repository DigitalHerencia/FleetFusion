"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrganizationSettings } from "@/lib/actions/commonActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OrganizationDTO } from "@/types/commonTypes";
export function ProfileFeatureClient({
  organization,
}: {
  organization: OrganizationDTO;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  return (
    <form
      className="space-y-4"
      action={(data) =>
        startTransition(async () => {
          try {
            await updateOrganizationSettings({
              timezone: data.get("timezone"),
              locale: data.get("locale"),
              defaultCurrency: data.get("defaultCurrency"),
            });
            setMessage("Workspace preferences saved.");
            router.refresh();
          } catch {
            setMessage(
              "Preferences could not be saved. Check input and workspace permissions.",
            );
          }
        })
      }
    >
      {(["timezone", "locale", "defaultCurrency"] as const).map((field) => (
        <div className="form-field" key={field}>
          <Label htmlFor={`settings-${field}`}>
            {
              {
                timezone: "Time zone",
                locale: "Locale",
                defaultCurrency: "Default currency",
              }[field]
            }
          </Label>
          <Input
            id={`settings-${field}`}
            name={field}
            defaultValue={organization[field]}
            required
          />
        </div>
      ))}
      <Button type="submit" disabled={pending}>
        Save preferences
      </Button>
      <p role="status">{message}</p>
    </form>
  );
}
