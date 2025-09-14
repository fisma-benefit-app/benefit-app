import { createContext } from "react";
import { Project } from "../lib/types";

type ProjectsContext = {
  sortedProjects: Project[];
  loading: boolean;
  error: string;
  handleDelete: (projectId: number) => Promise<void>;
  checkIfLatestVersion: (
    project: Project | null,
    oldProjectVersions: Project[],
  ) => boolean;
  returnLatestOrPreviousVersion: (
    project: Project,
    allProjectVersions: Project[],
  ) => Project;
  setProjects: (projects: Project[]) => void;
};

export const ProjectsContext = createContext<ProjectsContext | null>(null);
