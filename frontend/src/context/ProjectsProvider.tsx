import * as React from "react";
import { Project } from "../lib/types.ts";
import useAppUser from "../hooks/useAppUser.tsx";
import { useEffect, useState } from "react";
import { deleteProject, fetchAllProjects } from "../api/project.ts";
import { ProjectsContext } from "./ProjectsContext.ts";

export default function ProjectsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sessionToken, logout } = useAppUser();
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
        if (err instanceof Error && err.message === "Unauthorized!") {
          logout();
        }
        setError(
          err instanceof Error
            ? err.message
            : "Unexpected error occurred when getting projects from backend.",
        );
      } finally {
        setLoading(false);
      }
    };
    getAllProjects();
  }, [sessionToken, logout]);

  const sortedProjects =
    projects?.sort(
      (a: Project, b: Project) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    ) || [];

  const handleDelete = async (projectId: number) => {
    try {
      await deleteProject(sessionToken, projectId);
      setProjects((prevProjects) =>
        prevProjects.filter((project) => project.id !== projectId),
      );
    } catch (err) {
      if (err instanceof Error && err.message === "Unauthorized!") {
        logout();
      }
      setError(
        err instanceof Error
          ? err.message
          : "Unexpected error occurred while trying to delete project!",
      );
    }
  };

  const checkIfLatestVersion = (
    project: Project | null,
    allProjectVersions: Project[],
  ) => {
    if (project && allProjectVersions?.length > 0) {
      //projects from backend are sorted by editedTime, so latest project version is the one most recently edited
      const isLatest =
        project.version === allProjectVersions[0].version ? true : false;
      return isLatest;
    } else {
      return false;
    }
  };

  //Returns previous version if there are multiple versions, current version if there is only one version.
  const returnLatestOrPreviousVersion = (
    project: Project,
    allProjectVersions: Project[],
  ) => {
    if (allProjectVersions?.length > 1) {
      const currentIndex = allProjectVersions.findIndex(
        (p) => p.version === project.version,
      );
      if (currentIndex >= 0 && currentIndex < allProjectVersions.length - 1) {
        return allProjectVersions[currentIndex + 1];
      }
    }
    return project;
  };

  const contextValue = {
    sortedProjects,
    loading,
    error,
    handleDelete,
    checkIfLatestVersion,
    returnLatestOrPreviousVersion,
    setProjects,
  };

  return (
    <ProjectsContext.Provider value={contextValue}>
      {children}
    </ProjectsContext.Provider>
  );
}
