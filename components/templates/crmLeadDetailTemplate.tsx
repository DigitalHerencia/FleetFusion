import type { CrmContactDTO } from "@/types/crmTypes";
import { CrmContactDetailTemplate } from "./crmContactDetailTemplate";
export function CrmLeadDetailTemplate({ contact }: { contact: CrmContactDTO }) {
  return <CrmContactDetailTemplate contact={contact} lead />;
}
