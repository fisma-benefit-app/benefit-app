import { createContext } from "react";
import { Project } from "../lib/types";

type ProjectsContext = {
    projects: Project[];
    loading: boolean;
    error: string;
    handleDelete: (projectId: number, projectName: string) => Promise<void>;
    setProjects: (projects: Project[]) => void;
  };

export const ProjectsContext = createContext<ProjectsContext | null>(null);