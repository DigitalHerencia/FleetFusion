import { CrmOpportunityForm } from "./crmOpportunityForm.client";
import { getCrmAccounts } from "@/lib/fetchers/crmFetchers";
import { CrmPipelineFeatureClient } from "./crmPipelineFeature.client";
import { getCrmWorkspaceWorkflow } from "@/lib/workflows/crmWorkflows";

export async function CrmPipelineFeature() {
  const { deals } = await getCrmWorkspaceWorkflow();
  return (
    <>
      <CrmOpportunityForm accounts={await getCrmAccounts()} />
      <CrmPipelineFeatureClient deals={deals} />
    </>
  );
}
