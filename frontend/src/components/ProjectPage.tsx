import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { fetchProject } from "../api/project.ts";
import useAppUser from "../hooks/useAppUser.tsx";
import { Project } from "../lib/types.ts";
import FunctionalClassComponent from "./FunctionalClassComponent.tsx";
import { FunctionalPointSummary } from "./FunctionalPointSummary.tsx";

export default function ProjectPage() {

  const { sessionToken } = useAppUser();
  const { selectedProjectId } = useParams();

  const [project, setProject] = useState<Project | null>(null);
  const [loadingProject, setLoadingProject] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const getProject = async () => {
      setLoadingProject(true);
      try {
        const projectFromDb = await fetchProject(sessionToken, selectedProjectId);
        setProject(projectFromDb)
      } catch (err) {
        setError((err instanceof Error ? err.message : "Unexpected error occurred when getting project from backend."));
      } finally {
        setLoadingProject(false);
      }
    }

    getProject();
  }, [])

  return (
    <div className="flex gap-5">
      {loadingProject ? (
        <p>Loading project...</p>
      ) : error ? (
        <p>{error}</p>
      ) : project ? (
        <>
          <div className="flex-1">
            {project.functionalComponents.map((component) => {
              return (
                <FunctionalClassComponent componentProp={component} key={component.id} />
              );
            })}
          </div>
          <div className="flex-auto">
            <FunctionalPointSummary project={project} />
          </div>
        </>
      ) : (
        <p>No project data to show!</p>
      )}
    </div>
  );
}