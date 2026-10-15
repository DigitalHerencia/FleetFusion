import { updateContact, updateCrmDealStage } from "@/lib/actions/crmActions";
import {
  getClosedWonCrmValue,
  getContactById,
  getCrmDeal,
  getCrmDeals,
  getCrmAccount,
  getContacts,
} from "@/lib/fetchers/crmFetchers";

export async function getCrmWorkspaceWorkflow(limit = 100) {
  const [deals, contacts] = await Promise.all([
    getCrmDeals(limit),
    getContacts({ limit, sort: "name-asc" }),
  ]);
  return { deals, contacts };
}

export async function getCrmRecordWorkflow(
  kind: "deal" | "contact" | "account",
  id: string,
) {
  if (kind === "deal") return getCrmDeal(id);
  if (kind === "account") return getCrmAccount(id);
  return getContactById(id);
}
import type {
  CloseDealCommand,
  ReopenOpportunityCommand,
} from "@/types/crmTypes";

export async function closeDealWorkflow(input: CloseDealCommand) {
  return updateCrmDealStage({ ...input, stage: input.outcome });
}

export async function reopenOpportunityWorkflow(
  input: ReopenOpportunityCommand,
) {
  return updateCrmDealStage({ ...input, stage: "QUALIFIED" });
}

export async function qualifyLeadWorkflow(contactId: string) {
  const contact = await getContactById(contactId);
  if (!contact) throw new Error("CRM lead was not found.");
  if (contact.status !== "LEAD")
    throw new Error("Only a lead can be qualified.");
  return updateContact({
    contactId: contact.id,
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email,
    phone: contact.phone,
    title: contact.title,
    status: "ACTIVE",
    expectedUpdatedAt: new Date(contact.updatedAt),
  });
}

export async function detectStalledDealWorkflow(
  dealId: string,
  now = new Date(),
  staleAfterDays = 14,
) {
  const deal = await getCrmDeal(dealId);
  if (!deal) throw new Error("CRM deal was not found.");
  if (deal.stage === "WON" || deal.stage === "LOST") return false;
  return (
    now.getTime() - new Date(deal.updatedAt).getTime() >=
    staleAfterDays * 86_400_000
  );
}

export async function calculatePipelineValueWorkflow(limit = 100) {
  const deals = await getCrmDeals(limit);
  return deals
    .filter((deal) => deal.stage !== "LOST")
    .reduce((total, deal) => total + Number(deal.value), 0)
    .toFixed(4);
}

export async function calculateSalesVelocityWorkflow(
  periodStart: Date,
  periodEnd: Date,
) {
  if (periodEnd < periodStart) {
    throw new Error("The sales velocity period end must follow its start.");
  }
  const closedWonValue = await getClosedWonCrmValue(periodStart, periodEnd);
  const days = Math.max(
    1,
    (periodEnd.getTime() - periodStart.getTime()) / 86_400_000,
  );
  return (Number(closedWonValue) / days).toFixed(4);
}
