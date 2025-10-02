import { ChangeEvent, useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import {
  fetchAllProjects,
  fetchProject,
  updateProject,
  createFunctionalComponent,
  deleteFunctionalComponent,
} from "../api/project.ts";
import useAppUser from "../hooks/useAppUser.tsx";
import {
  Project,
  ProjectResponse,
  TGenericComponentNoId,
  TGenericComponent,
} from "../lib/types.ts";
import { createNewProjectVersion } from "../api/project.ts";
import FunctionalClassComponent from "./FunctionalClassComponent.tsx";
import { FunctionalPointSummary } from "./FunctionalPointSummary.tsx";
import useTranslations from "../hooks/useTranslations.ts";
import CreateCurrentDate from "../api/date.ts";
import LoadingSpinner from "./LoadingSpinner.tsx";
import useProjects from "../hooks/useProjects.tsx";
import ConfirmModal from "./ConfirmModal.tsx";

// dnd-kit imports
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableFunctionalComponent({
  component,
  project,
  setProject,
  setProjectResponse,
  deleteFunctionalComponent,
  isLatest,
  forceCollapsed,
  collapseVersion,
}: {
  component: TGenericComponent;
  project: Project;
  setProject: React.Dispatch<React.SetStateAction<Project | null>>;
  setProjectResponse: React.Dispatch<
    React.SetStateAction<ProjectResponse | null>
  >;
  deleteFunctionalComponent: (id: number) => Promise<void>;
  isLatest: boolean;
  forceCollapsed: boolean;
  collapseVersion: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: component.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <FunctionalClassComponent
        project={project}
        setProject={setProject}
        setProjectResponse={setProjectResponse}
        component={component}
        deleteFunctionalComponent={deleteFunctionalComponent}
        isLatest={isLatest}
        forceCollapsed={forceCollapsed}
        collapseVersion={collapseVersion}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

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
  const [projectResponse, setProjectResponse] =
    useState<ProjectResponse | null>(null);
  const [loadingProject, setLoadingProject] = useState(false);
  const [error, setError] = useState<string>("");

  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [lastAddedComponentId, setLastAddedComponentId] = useState<
    number | null
  >(null);

  const translation = useTranslations().projectPage;

  const bottomRef = useRef<HTMLDivElement | null>(null);

  //get all versions of the same project
  const allProjectVersions: Project[] = sortedProjects.filter(
    (projectInArray) => project?.projectName === projectInArray.projectName,
  );

  //only allow user to edit project if it is the latest one
  const isLatest = checkIfLatestVersion(project, allProjectVersions);

  // sort functional components by order (ascending)
  const sortedComponents =
    project?.functionalComponents
      .slice() // copy first so we don’t mutate state
      .sort((a, b) => a.orderPosition - b.orderPosition) || [];

  useEffect(() => {
    const getProject = async () => {
      setLoadingProject(true);
      try {
        const projectFromDb = await fetchProject(
          sessionToken,
          Number(selectedProjectId),
        );

        // normalize & sort after fetching
        const normalized = projectFromDb.functionalComponents
          .slice()
          .sort((a, b) => a.orderPosition - b.orderPosition)
          .map((c, idx) => ({ ...c, orderPosition: idx }));

        setProject({ ...projectFromDb, functionalComponents: normalized });
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
  }, [selectedProjectId, sessionToken, logout]);

  const handleCreateFunctionalComponent = async () => {
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
        title: null,
        description: null,
        previousFCId: null,
        orderPosition: project.functionalComponents.length,
      };

      try {
        const updatedProject = await createFunctionalComponent(
          sessionToken,
          project.id,
          newFunctionalComponent,
        );

        // Find the new component by comparing IDs
        const prevIds = new Set(project.functionalComponents.map((c) => c.id));
        const newComponent = updatedProject.functionalComponents.find(
          (c) => !prevIds.has(c.id),
        );

        if (newComponent) {
          setLastAddedComponentId(newComponent.id);
        }

        setProject(updatedProject);

        setTimeout(() => {
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
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

  const handleDeleteFunctionalComponent = async (componentId: number) => {
    setLoadingProject(true);
    if (project) {
      try {
        const updatedProject = await deleteFunctionalComponent(
          sessionToken,
          componentId,
          project.id,
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
        // normalize before saving
        const normalized = project.functionalComponents
          .slice()
          .sort((a, b) => a.orderPosition - b.orderPosition)
          .map((c, idx) => ({ ...c, orderPosition: idx }));

        const editedProject = {
          ...project,
          functionalComponents: normalized,
          editedDate: CreateCurrentDate(),
        };
        const savedProject = await updateProject(sessionToken, editedProject);
        setProjectResponse(savedProject);
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!project || !over || active.id === over.id) return;

    const oldIndex = project.functionalComponents.findIndex(
      (c) => c.id === active.id,
    );
    const newIndex = project.functionalComponents.findIndex(
      (c) => c.id === over.id,
    );

    if (oldIndex === -1 || newIndex === -1) return;

    const updatedComponents = [...project.functionalComponents];
    const [moved] = updatedComponents.splice(oldIndex, 1);
    updatedComponents.splice(newIndex, 0, moved);

    // Update orderPosition values
    const reOrdered = updatedComponents.map((c, index) => ({
      ...c,
      orderPosition: index,
    }));

    setProject({ ...project, functionalComponents: reOrdered });
  };

  const saveProjectVersion = async () => {
    if (project) {
      setLoadingProject(true);
      try {
        await saveProject(); //TODO: Automatic saving instead? (Could use useQuery or similar)
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

  useEffect(() => {
    setLastAddedComponentId(null);
  }, [collapseAll]);

  if (loadingProject) return <LoadingSpinner />;

  return (
    <>
      <div className="pl-5 pr-5">
        <div className="flex justify-between">
          <div className="w-[calc(100%-340px)] mt-15">
            {project ? ( //TODO: Dedicated error page? No project does not render maybe cause of wrong kind of if?
              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sortedComponents.map((c) => c.id)}
                  strategy={rectSortingStrategy}
                >
                  {/* Grid wrapper for components */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
                    {sortedComponents?.map((component) => (
                      <SortableFunctionalComponent
                        key={component.id}
                        component={component}
                        project={project}
                        setProject={setProject}
                        setProjectResponse={setProjectResponse}
                        deleteFunctionalComponent={
                          handleDeleteFunctionalComponent
                        }
                        isLatest={isLatest}
                        forceCollapsed={
                          collapseAll
                            ? component.id !== lastAddedComponentId
                            : false
                        }
                        collapseVersion={collapseVersion}
                      />
                    ))}
                  </div>

                  {sortedComponents.length === 0 && (
                    <p className="text-gray-500 p-4">
                      {translation.noFunctionalComponents}
                    </p>
                  )}
                  <div ref={bottomRef} />
                </SortableContext>
              </DndContext>
            ) : error ? (
              <p>{error}</p>
            ) : (
              <p></p>
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
                {collapseAll ? translation.expandAll : translation.collapseAll}
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
              onClick={handleCreateFunctionalComponent}
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
