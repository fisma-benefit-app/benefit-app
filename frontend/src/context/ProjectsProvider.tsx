import * as React from "react";
import { Project } from "../lib/types.ts";
import useAppUser from "../hooks/useAppUser.tsx";
import {useEffect, useState} from "react";
import { deleteProject, fetchAllProjects} from "../api/project.ts";
import { ProjectsContext } from "./ProjectsContext.ts";

export default function ProjectsProvider({children,}: { children: React.ReactNode; }) {
  const { sessionToken } = useAppUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const getAllProjects = async () => {
      setLoading(true);
      try {
        const allProjectsFromDb = await fetchAllProjects(sessionToken);
        setProjects(allProjectsFromDb);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error occurred when getting projects from backend.");
      } finally {
        setLoading(false);
      }
    };
    getAllProjects();
  }, [sessionToken]);

  //sorted projects are derived, not sorted only in the useEffect so we dont have to sort again later, we should discuss
  const sortedProjects = projects.sort((a: Project, b: Project) => new Date(b.editedDate).getTime() - new Date(a.editedDate).getTime());

  const handleDelete = async (projectId: number, projectName: string) => {
    if (window.confirm(`Oletko varma, että haluat poistaa projektin "${projectName}"?`)) {
      try {
        await deleteProject(sessionToken, projectId);
        setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error occurred while trying to delete project!");
      }
    }
  };

  const checkIfLatestVersion = (project: Project | null, allProjectVersions: Project[]) => {
    if (project && allProjectVersions.length > 0) {
      //allProjectVersions is sorted by version number from highest to lowest, so latest version is in the first index
      const isLatest = project.version === allProjectVersions[0].version ? true : false;
      return isLatest;
    } else {
      return false;
    }
  }

  const contextValue = {
    sortedProjects,
    loading,
    error,
    handleDelete,
    checkIfLatestVersion,
    setProjects,
  }

  return (
    <ProjectsContext.Provider
      value={contextValue}>
      {children}
    </ProjectsContext.Provider>
  );
}
