import {ChangeEvent, useEffect, useState} from "react";
import { useParams, useNavigate } from "react-router";
import {fetchAllProjects, fetchProject, updateProject} from "../api/project.ts";
import useAppUser from "../hooks/useAppUser.tsx";
import {
  Project,
  ProjectWithUpdate,
  TGenericComponentNoId,
} from "../lib/types.ts";
import { createNewProjectVersion } from "../api/project.ts";
import FunctionalClassComponent from "./FunctionalClassComponent.tsx";
import { FunctionalPointSummary } from "./FunctionalPointSummary.tsx";
import useTranslations from "../hooks/useTranslations.ts";
import CreateCurrentDate from "../api/date.ts";
import LoadingSpinner from "./LoadingSpinner.tsx";
import useProjects from "../hooks/useProjects.tsx";

//TODO: add state and component which gives user feedback when project is saved, functionalcomponent is added or deleted etc.
//maybe refactor the if -blocks in the crud functions. maybe the crud functions should be in their own context/file
//maybe better placeholder component when project is being loaded
export default function ProjectPage() {
  const { sessionToken } = useAppUser();
  const { selectedProjectId } = useParams();
  const {setProjects, projects} = useProjects();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [loadingProject, setLoadingProject] = useState(false);
  const [error, setError] = useState<string>("");
  const [oldProjectVersions, setOldProjectVersions] = useState<Project[]>([]);

  const translation = useTranslations().projectPage;


  //sort functional components by id (order of creation from oldest to newest)
  const sortedComponents = project?.functionalComponents.sort((a, b) => a.id - b.id);

  //get old versions of the same project
  const getOldProjectVersions = (projects: Project[], currentProject: Project) => {
    const oldList: Project[] = [];
    projects.forEach((project) => {
      if (project.projectName === currentProject.projectName) {
        oldList.push(project);
      }
    })
    setOldProjectVersions(oldList);
  };

  useEffect(() => {
    const getProject = async () => {
      setLoadingProject(true);
      try {
        const projectFromDb = await fetchProject(sessionToken, Number(selectedProjectId));
        setProject(projectFromDb);
        getOldProjectVersions(projects, projectFromDb);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error occurred when getting project from backend.");
      } finally {
        setLoadingProject(false);
      }
    };
    getProject();
  }, [selectedProjectId, sessionToken, projects]);

  const createFunctionalComponent = async () => {
    if (project) {
      const newFunctionalComponent: TGenericComponentNoId = {
        className: "Interactive end-user navigation and query service",
        componentType: null,
        dataElements: 0,
        readingReferences: 0,
        writingReferences: null,
        functionalMultiplier: null,
        operations: null,
        degreeOfCompletion: null,
        comment: null,
      };

      const projectWithNewComponent: ProjectWithUpdate = { ...project, functionalComponents: [...project.functionalComponents, newFunctionalComponent,] };

      try {
        const updatedProject: Project = await updateProject(sessionToken, projectWithNewComponent);
        setProject(updatedProject);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const deleteFunctionalComponent = async (componentId: number) => {
    if (window.confirm("Oletko varma, että haluat poistaa funktionaalisen komponentin?")) {
      if (project) {
        const filteredComponents = project?.functionalComponents.filter((component) => component.id !== componentId);
        const filteredProject: Project = { ...project, functionalComponents: filteredComponents };
        try {
          const updatedProject = await updateProject(sessionToken, filteredProject);
          setProject(updatedProject);
        } catch (err) {
          console.error(err);
        }
      }
    }
  };

  const saveProject = async () => {
    if (project) {
      try {
        const editedProject = {...project, editedDate: CreateCurrentDate()};
        const savedProject = await updateProject(sessionToken, editedProject);
        setProject(savedProject);
        alert(translation.projectSaved);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const saveProjectVersion = async (projectVersion: number) => {
    if (project) {
      if (window.confirm(`${translation.saveVersionWarningBeginning}${projectVersion}?${translation.saveVersionWarningEnd}`)) {
      saveProject(); // Save project before creating a new version if the user forgets to save their changes. Possibly do this with automatic saving instead.
      try {
        const idOfNewProjectVersion = await createNewProjectVersion(sessionToken, project);
        const updatedProjects = await fetchAllProjects(sessionToken);
        setProjects(updatedProjects);
        navigate(`project/${idOfNewProjectVersion}`);
      } catch (err) {
        console.error(err);
      }
    }
  }
  };

  const handleVersionSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedId: number = Number(e.target.value);
    const selectedProject = projects.find((p: Project) => p.id === selectedId);

    if (selectedProject) {
      navigate(`project/${selectedId}`);
    }
  }

  return (
    <div className="gap-5 flex justify-center my-20">
      {loadingProject ? (
        <LoadingSpinner/>
      ) : error ? (
        <p>{error}</p>
      ) : project ? (
        <>
          <div>
            {sortedComponents?.map((component) => {
              return (
                <FunctionalClassComponent
                  project={project}
                  setProject={setProject}
                  component={component}
                  deleteFunctionalComponent={deleteFunctionalComponent}
                  key={component.id}
                />
              );
            })}
          </div>
          <div className="my-5 flex flex-col">
            {/* Create functionality for this button */}
            <button
              className="bg-fisma-blue hover:bg-fisma-gray text-white px-4 py-4 cursor-pointer mb-2 sticky top-20"
              onClick={saveProject}
            >
              {translation.saveProject}
            </button>
            <button
              className="bg-fisma-blue hover:bg-fisma-gray text-white px-4 py-4 cursor-pointer mb-2 sticky top-40"
              onClick={() => saveProjectVersion(project.version)}
            >
              {translation.saveProjectAsVersion}{project.version}
            </button>
            <select
                className="border-2 border-gray-400 px-4 py-4 cursor-pointer my-2 sticky top-60"
                onChange={handleVersionSelect}
                defaultValue=""
            >
              <option value="" disabled>Valitse Projektiversio</option>
              {oldProjectVersions.map((project) => (
                  <option key={project.id} value={project.id}>{project.version}</option>
              ))}
            </select>
            <button
              onClick={createFunctionalComponent}
              className="bg-fisma-blue  hover:bg-fisma-gray text-white px-4 py-4 cursor-pointer my-2 sticky top-80"
            >
              {translation.newFunctionalComponent}
            </button>
            {/* Render summary only if project has functional components */}
            {project.functionalComponents.length > 0 && (
              <FunctionalPointSummary project={project} />
            )}
          </div>
        </>
      ) : (
        <p>{translation.noProject}</p>
      )}
    </div>
  );
}
