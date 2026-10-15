"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CrmPipelineTemplate } from "@/components/templates/crmPipelineTemplate";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateCrmDealStage } from "@/lib/actions/crmActions";
import { CrmDealStage } from "@/schemas/crmSchemas";
import type { CrmDealSummaryDTO } from "@/types/crmTypes";

export function CrmPipelineFeatureClient({
  deals,
}: {
  deals: CrmDealSummaryDTO[];
}) {
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <>
      <p role="status">{message}</p>
      <CrmPipelineTemplate
        deals={deals.filter((deal) =>
          `${deal.name} ${deal.account.name} ${deal.owner?.displayName ?? ""}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )}
        toolbar={
          <Input
            aria-label="Search opportunities and accounts"
            placeholder="Search opportunities or accounts"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        }
        renderControls={(deal) => (
          <form
            className="flex flex-wrap gap-2"
            action={(data) =>
              startTransition(async () => {
                setMessage("");
                try {
                  await updateCrmDealStage({
                    dealId: deal.id,
                    expectedVersion: deal.version,
                    stage: data.get("stage"),
                  });
                  setMessage(`${deal.name} updated.`);
                  router.refresh();
                } catch {
                  setMessage(
                    "Unable to move opportunity. The transition may be invalid, access denied, or the record changed. Refresh and try again.",
                  );
                }
              })
            }
          >
            <select
              name="stage"
              aria-label={`Stage for ${deal.name}`}
              defaultValue={deal.stage}
              className="control-field"
              disabled={pending}
            >
              {Object.values(CrmDealStage).map((stage) => (
                <option key={stage}>{stage}</option>
              ))}
            </select>
            <Button type="submit" size="sm" disabled={pending}>
              Move opportunity
            </Button>
          </form>
        )}
      />
    </>
  );
}
