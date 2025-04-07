import { createContext } from "react";
import { Project } from "../lib/types";

type ProjectsContext = {
    sortedProjects: Project[];
    loading: boolean;
    error: string;
    handleDelete: (projectId: number, projectName: string) => Promise<void>;
    checkIfLatestVersion: (project: Project | null, oldProjectVersions: Project[]) => boolean
    setProjects: (projects: Project[]) => void;
  };

export const ProjectsContext = createContext<ProjectsContext | null>(null);