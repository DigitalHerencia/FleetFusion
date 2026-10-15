"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addAdminMembership } from "@/lib/actions/adminActions";
import { appRoles } from "@/lib/authz/roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export function AdminNewUserForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  return (
    <form
      className="mx-auto max-w-3xl space-y-5 surface-card p-5"
      action={(data) =>
        startTransition(async () => {
          try {
            const membership = await addAdminMembership({
              email: data.get("email"),
              role: data.get("role"),
            });
            router.push(`/admin/users/${membership.user.id}`);
            router.refresh();
          } catch {
            setError(
              "Member could not be added. They must already be registered and not already belong to this workspace; administrative access is required.",
            );
          }
        })
      }
    >
      <h1 className="type-title">Add a registered member</h1>
      <p>Add workspace access for an existing application user.</p>
      <Label htmlFor="member-email">Registered email</Label>
      <Input id="member-email" name="email" type="email" required />
      <Label htmlFor="new-member-role">Application role</Label>
      <select
        id="new-member-role"
        name="role"
        defaultValue="MEMBER"
        className="control-field"
      >
        {appRoles.map((role) => (
          <option key={role}>{role}</option>
        ))}
      </select>
      {error && <p role="alert">{error}</p>}
      <Button type="submit" disabled={pending}>
        Add member
      </Button>
    </form>
  );
}
