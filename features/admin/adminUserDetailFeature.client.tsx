"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  changeAdminMembership,
  suspendAdminMembership,
  restoreAdminMembership,
} from "@/lib/actions/adminActions";
import { appRoles } from "@/lib/authz/roles";
import type { AdminMembershipDTO } from "@/types/adminTypes";
export function AdminUserDetailFeatureClient({
  membership,
}: {
  membership: AdminMembershipDTO;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  return (
    <div className="space-y-5">
      <form
        className="space-y-3"
        action={(data) =>
          startTransition(async () => {
            try {
              await changeAdminMembership({
                membershipId: membership.id,
                role: data.get("role"),
              });
              setMessage("Role updated.");
              router.refresh();
            } catch {
              setMessage(
                "Role could not be changed. Check permissions; changing your own role is prohibited.",
              );
            }
          })
        }
      >
        <Label htmlFor="member-role">Application role</Label>
        <select
          id="member-role"
          name="role"
          className="control-field"
          defaultValue={membership.role}
        >
          {appRoles.map((role) => (
            <option key={role}>{role}</option>
          ))}
        </select>
        <Button type="submit" disabled={pending}>
          Save role
        </Button>
      </form>
      <Button
        variant="outline"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            try {
              if (membership.status === "SUSPENDED")
                await restoreAdminMembership({ membershipId: membership.id });
              else
                await suspendAdminMembership({ membershipId: membership.id });
              setMessage("Membership access updated.");
              router.refresh();
            } catch {
              setMessage(
                "Access could not be updated. Check permissions; suspending your own membership is prohibited.",
              );
            }
          })
        }
      >
        {membership.status === "SUSPENDED"
          ? "Restore access"
          : "Suspend access"}
      </Button>
      <p role="status">{message}</p>
    </div>
  );
}
