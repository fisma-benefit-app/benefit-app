import type { Project } from "./types";

export function getProjectFamilyKey(project: Pick<Project, "id" | "familyId">) {
  // During a rolling deployment, an older API may omit the family ID.
  return project.familyId ?? String(project.id);
}
