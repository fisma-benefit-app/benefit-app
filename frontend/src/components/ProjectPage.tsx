import { ChangeEvent, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  fetchAllProjects,
  fetchProject,
  updateProject,
} from "../api/project.ts";
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
import ConfirmModal from "./ConfirmModal.tsx";

//TODO: add state and component which gives user feedback when project is saved, functionalcomponent is added or deleted etc.
//maybe refactor the if -blocks in the crud functions. maybe the crud functions should be in their own context/file
export default function ProjectPage() {
  const { sessionToken, logout } = useAppUser();
  const { selectedProjectId } = useParams();
  const { setProjects, sortedProjects, checkIfLatestVersion } = useProjects();
  const navigate = useNavigate();
  const [collapseAll, setCollapseAll] = useState<boolean>(true);
  const [collapseVersion, setCollapseVersion] = useState<number>(0);

  const [project, setProject] = useState<Project | null>(null);
  const [loadingProject, setLoadingProject] = useState(false);
  const [error, setError] = useState<string>("");

  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);

  const translation = useTranslations().projectPage;

  //get all versions of the same project
  const allProjectVersions: Project[] = sortedProjects.filter(
    (projectInArray) => project?.projectName === projectInArray.projectName,
  );

  //only allow user to edit project if it is the latest one
  const isLatest = checkIfLatestVersion(project, allProjectVersions);

  //sort functional components by id (order of creation from oldest to newest)
  const sortedComponents =
    project?.functionalComponents.sort((a, b) => a.id - b.id) || [];

  useEffect(() => {
    const getProject = async () => {
      setLoadingProject(true);
      try {
        const projectFromDb = await fetchProject(
          sessionToken,
          Number(selectedProjectId),
        );
        setProject(projectFromDb);
      } catch (err) {
        if (err instanceof Error && err.message === "Unauthorized!") {
          logout();
        }
        console.error("Error fetching project:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Unexpected error occurred when getting project from backend.",
        );
      } finally {
        setLoadingProject(false);
      }
    };
    getProject();
  }, [selectedProjectId, sessionToken]);

  const createFunctionalComponent = async () => {
    setLoadingProject(true);
    if (project) {
      const newFunctionalComponent: TGenericComponentNoId = {
        className: "Interactive end-user navigation and query service",
        componentType: null,
        dataElements: null,
        readingReferences: null,
        writingReferences: null,
        functionalMultiplier: null,
        operations: null,
        degreeOfCompletion: null,
        comment: null,
        previousFCId: null,
      };

      const projectWithNewComponent: ProjectWithUpdate = {
        ...project,
        functionalComponents: [
          ...project.functionalComponents,
          newFunctionalComponent,
        ],
      };

      try {
        const updatedProject: Project = await updateProject(
          sessionToken,
          projectWithNewComponent,
        );
        setProject(updatedProject);
      } catch (err) {
        if (err instanceof Error && err.message === "Unauthorized!") {
          logout();
        }
        console.error(err);
      } finally {
        setLoadingProject(false);
      }
    }
  };

  const deleteFunctionalComponent = async (componentId: number) => {
    setLoadingProject(true);
    if (project) {
      const filteredComponents = project?.functionalComponents.filter(
        (component) => component.id !== componentId,
      );
      const filteredProject: Project = {
        ...project,
        functionalComponents: filteredComponents,
      };
      try {
        const updatedProject = await updateProject(
          sessionToken,
          filteredProject,
        );
        setProject(updatedProject);
      } catch (err) {
        if (err instanceof Error && err.message === "Unauthorized!") {
          logout();
        }
        console.error(err);
      } finally {
        setLoadingProject(false);
      }
    }
  };

  const saveProject = async () => {
    setLoadingProject(true);
    if (project) {
      try {
        const editedProject = { ...project, editedDate: CreateCurrentDate() };
        const savedProject = await updateProject(sessionToken, editedProject);
        setProject(savedProject);
      } catch (err) {
        if (err instanceof Error && err.message === "Unauthorized!") {
          logout();
        }
        console.error(err);
      } finally {
        setLoadingProject(false);
      }
    }
  };

  const saveProjectVersion = async () => {
    if (project) {
      setLoadingProject(true);
      try {
        await saveProject(); //TODO: Automatic saving instead?
        const idOfNewProjectVersion = await createNewProjectVersion(
          sessionToken,
          project,
        );
        const updatedProjects = await fetchAllProjects(sessionToken);
        setProjects(updatedProjects);
        navigate(`/project/${idOfNewProjectVersion}`);
      } catch (err) {
        if (err instanceof Error && err.message === "Unauthorized!") {
          logout();
        }
        console.error("Error creating new project version:", err);
      } finally {
        setLoadingProject(false);
      }
    }
  };

  const handleVersionSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedId: number = Number(e.target.value);
    const selectedProject = sortedProjects.find(
      (p: Project) => p.id === selectedId,
    );

    if (selectedProject) {
      navigate(`/project/${selectedId}`);
    }
  };

  if (loadingProject) return <LoadingSpinner />;

  return (
    <>
      <div className="pl-5 pr-5">
        <div className="flex justify-between">
          <div className="w-[calc(100%-340px)] mt-15">
            {project ? ( //TODO: Dedicated error page? No project does not render maybe cause of wrong kind of if?
              <>
                {sortedComponents?.map((component) => (
                  <FunctionalClassComponent
                    project={project}
                    setProject={setProject}
                    component={component}
                    deleteFunctionalComponent={deleteFunctionalComponent}
                    key={component.id}
                    isLatest={isLatest}
                    forceCollapsed={collapseAll}
                    collapseVersion={collapseVersion}
                  />
                ))}
              </>
            ) : error ? (
              <p>{error}</p>
            ) : (
              <p></p>
              //TODO: If no components are present show message
            )}
          </div>
        </div>
      </div>

      <div className="fixed right-5 top-20 w-[320px]">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center w-full">
              <div className="flex-grow-0 flex flex-col max-w-[calc(100% - 140px)]">
                <div className="text-left font-medium">
                  {translation.nameOfProject}:
                </div>
                <div className="text-left break-words">
                  {project?.projectName}
                </div>
              </div>
              <button
                className="w-[49%] bg-fisma-blue hover:bg-fisma-dark-blue text-white px-4 py-3 text-xs text-center whitespace-nowrap overflow-hidden text-ellipsis"
                onClick={() => {
                  setCollapseAll((prev) => !prev);
                  setCollapseVersion((prev) => prev + 1);
                }}
              >
                {collapseAll ? translation.collapseAll : translation.expandAll}
              </button>
            </div>
            <div className="flex flex-row gap-2 w-full">
              <button
                className={`w-full ${isLatest || !loadingProject ? "bg-fisma-blue hover:bg-fisma-dark-blue cursor-pointer" : "bg-fisma-gray"} text-white text-xs py-3 px-4`}
                onClick={saveProject}
                disabled={!isLatest || loadingProject}
              >
                {translation.saveProject}
              </button>
              <button
                className={`w-full ${isLatest || !loadingProject ? "bg-fisma-blue hover:bg-fisma-dark-blue cursor-pointer" : "bg-fisma-gray"} text-white text-xs py-3 px-4`}
                onClick={() => setConfirmModalOpen(true)}
                disabled={!isLatest || loadingProject}
              >
                {translation.saveProjectAsVersion} {project?.version}
              </button>
            </div>
            <select
              className="border-2 border-gray-400 px-4 py-4 cursor-pointer my-2"
              onChange={handleVersionSelect}
              defaultValue=""
              disabled={loadingProject}
            >
              <option value="" disabled>
                {translation.selectProjectVersion}
              </option>
              {allProjectVersions.map((project) => (
                <option key={project.id} value={project.id}>
                  {translation.version} {project.version}
                </option>
              ))}
            </select>
            <button
              onClick={createFunctionalComponent}
              className={`${isLatest || !loadingProject ? "bg-fisma-blue hover:bg-fisma-dark-blue cursor-pointer" : "bg-fisma-gray"} text-white py-3 px-4`}
              disabled={!isLatest || loadingProject}
            >
              {translation.newFunctionalComponent}
            </button>
          </div>

          {Array.isArray(project?.functionalComponents) &&
            project.functionalComponents.length > 0 && (
              <FunctionalPointSummary project={project} />
            )}
        </div>
      </div>

      <ConfirmModal
        message={`${translation.saveVersionWarningBeginning} ${project?.version}? ${translation.saveVersionWarningEnd}`}
        open={isConfirmModalOpen}
        setOpen={setConfirmModalOpen}
        onConfirm={() => saveProjectVersion()}
      />
    </>
  );
}
