import type { IntegrationStatus } from "@/types/integrationTypes";
import { DashboardLayout } from "@/components/blocks/dashboard-layout";
export function SharedIntegrationsTemplate({
  integrations,
}: {
  integrations: IntegrationStatus[];
}) {
  return (
    <DashboardLayout title="Integration configuration" nav={[]}>
      <p>
        Configuration presence only. These checks do not contact providers or
        verify connectivity.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {integrations.map((integration) => (
          <article
            key={integration.name}
            className="space-y-3 surface-card p-5"
          >
            <h2 className="type-title">{integration.name}</h2>
            <p>{integration.purpose}</p>
            <p>
              {integration.state === "CONFIGURED"
                ? "Required configuration present"
                : "Required configuration missing"}
            </p>
          </article>
        ))}
      </div>
    </DashboardLayout>
  );
}
