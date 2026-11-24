import type { Project } from "./types.ts";

// The user with the OWNER role in the project, if the project has one.
export const getProjectOwner = (project: Project) =>
  project.projectAppUsers.find(
    (membership) => membership.roleInProject === "OWNER",
  )?.appUser;
