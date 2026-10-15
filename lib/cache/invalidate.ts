import { revalidatePath, revalidateTag } from "next/cache";

export function invalidateTags(tags: readonly string[]) {
  for (const tag of new Set(tags)) revalidateTag(tag, "max");
}

export function invalidatePaths(paths: readonly string[]) {
  for (const path of new Set(paths)) revalidatePath(path);
}
