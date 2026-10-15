"use client";
import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { AdminUsersTemplate } from "@/components/templates/adminUsersTemplate";
import type { AdminMembershipDTO } from "@/types/adminTypes";
export function AdminUsersFeatureClient({
  memberships,
}: {
  memberships: AdminMembershipDTO[];
}) {
  const [query, setQuery] = useState("");
  return (
    <AdminUsersTemplate
      memberships={memberships.filter((membership) =>
        `${membership.user.displayName ?? ""} ${membership.user.email ?? ""} ${membership.role}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      )}
      toolbar={
        <div className="flex flex-wrap gap-3">
          <Link className="type-link" href="/admin/users/new">
            Add registered member
          </Link>
          <Input
            aria-label="Search members"
            placeholder="Search name, email or role"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      }
    />
  );
}
