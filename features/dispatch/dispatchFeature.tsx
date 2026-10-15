import { DispatchFeatureClient } from "@/features/dispatch/dispatchFeature.client";
import { getDispatchBoardWorkflow } from "@/lib/workflows/dispatchWorkflows";

export async function DispatchFeature() {
  const board = await getDispatchBoardWorkflow();
  return <DispatchFeatureClient board={board} />;
}
