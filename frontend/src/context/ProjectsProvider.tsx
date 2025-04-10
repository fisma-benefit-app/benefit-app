import * as React from "react";
import { Project } from "../lib/types.ts";
import useAppUser from "../hooks/useAppUser.tsx";
import {useEffect, useState} from "react";
import { deleteProject, fetchAllProjects} from "../api/project.ts";
import { ProjectsContext } from "./ProjectsContext.ts";
import useTranslations from "../hooks/useTranslations.ts";

export default function ProjectsProvider({children,}: { children: React.ReactNode; }) {
  const { sessionToken } = useAppUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const translation = useTranslations().projectList;

  useEffect(() => {
    const getAllProjects = async () => {
      setLoading(true);
      try {
        const allProjectsFromDb = await fetchAllProjects(sessionToken);
        const sortedProjects = allProjectsFromDb.sort((a: Project, b: Project) => new Date(b.editedDate).getTime() - new Date(a.editedDate).getTime());
        setProjects(sortedProjects);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error occurred when getting projects from backend.");
      } finally {
        setLoading(false);
      }
    };
    getAllProjects();
  }, [sessionToken]);

  const handleDelete = async (projectId: number, projectName: string) => {
    if (window.confirm(`${translation.confirmDelete} "${projectName}"?`)) {
      try {
        await deleteProject(sessionToken, projectId);
        setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error occurred while trying to delete project!");
      }
    }
  };


  const contextValue = {
    projects,
    loading,
    error,
    handleDelete,
    setProjects,
  }

  return (
    <ProjectsContext.Provider
      value={contextValue}>
      {children}
    </ProjectsContext.Provider>
  );
}
