import { getExpenses } from "@/lib/fetchers/invoicingFetchers";
import { ExpensesFeatureClient } from "./expensesFeature.client";
export async function ExpensesFeature() {
  return <ExpensesFeatureClient expenses={await getExpenses()} />;
}
