import * as React from "react";
import { Project } from "../lib/types.ts";
import useAppUser from "../hooks/useAppUser.tsx";
import { useEffect, useState } from "react";
import {
  deleteProject,
  fetchAllProjects,
  fetchProject,
  updateProject,
} from "../api/project.ts";
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
          await logout();
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
        await logout();
      }
      setError(
        err instanceof Error
          ? err.message
          : "Unexpected error occurred while trying to delete project!",
      );
    }
  };

  const handleUpdate = async (updatedProject: Project) => {
    try {
      const originalProject = projects.find((p) => p.id === updatedProject.id);
      const originalName = originalProject?.projectName;

      if (!originalName) return;

      // The backend only accepts edits to the latest version and renames the older
      // versions with it. Fetch it fresh so the rename carries its current lockVersion.
      const latestVersion = projects
        .filter((p) => p.projectName === originalName)
        .reduce((latest, p) => (p.version > latest.version ? p : latest));

      await updateProject(sessionToken, {
        ...(await fetchProject(sessionToken, latestVersion.id)),
        projectName: updatedProject.projectName,
      });

      setProjects((prevProjects) =>
        prevProjects.map((project) => {
          if (project.projectName === originalName) {
            return { ...project, projectName: updatedProject.projectName };
          }
          return project;
        }),
      );
    } catch (err) {
      if (err instanceof Error && err.message === "Unauthorized!") {
        await logout();
      }
      setError(
        err instanceof Error
          ? err.message
          : "Unexpected error occurred while trying to update project!",
      );
    }
  };

  const checkIfLatestVersion = (
    project: Project | null,
    allProjectVersions: Project[],
  ) => {
    if (project && allProjectVersions?.length > 0) {
      // the backend only accepts edits to the highest version number
      return (
        project.version >= Math.max(...allProjectVersions.map((p) => p.version))
      );
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
    handleUpdate,
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
