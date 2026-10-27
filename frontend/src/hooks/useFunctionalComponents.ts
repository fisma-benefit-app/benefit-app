import {
  Dispatch,
  MutableRefObject,
  RefObject,
  SetStateAction,
  useState,
} from "react";
import {
  createFunctionalComponent,
  deleteFunctionalComponent,
  fetchProject,
} from "../api/project.ts";
import { createSubComponents } from "../lib/fc-service-functions.ts";
import { Project, TGenericComponentNoId } from "../lib/types.ts";
import useAppUser from "./useAppUser.tsx";
import { useAlert } from "./useAlert.ts";
import useTranslations from "./useTranslations.ts";

type UseFunctionalComponentsParams = {
  project: Project | null;
  setProject: Dispatch<SetStateAction<Project | null>>;
  setLoadingProject: (loading: boolean) => void;
  setComponentSearchQuery: (query: string) => void;
  isLatest: boolean;
  // Set while a create/delete is in flight so auto-save stays out of the way.
  isManuallySaved: MutableRefObject<boolean>;
  // Scrolled into view after a component is added.
  bottomRef: RefObject<HTMLDivElement | null>;
  saveProject: (showNotif?: boolean) => Promise<void>;
  debouncedSaveProject: () => void;
};

// Creating, deleting and MLA-toggling the functional components of a project.
export default function useFunctionalComponents({
  project,
  setProject,
  setLoadingProject,
  setComponentSearchQuery,
  isLatest,
  isManuallySaved,
  bottomRef,
  saveProject,
  debouncedSaveProject,
}: UseFunctionalComponentsParams) {
  const { sessionToken, logout } = useAppUser();
  const { showNotification, updateNotification } = useAlert();
  const alertTranslation = useTranslations().alert;
  const [lastAddedComponentId, setLastAddedComponentId] = useState<
    number | null
  >(null);

  // MLA sub-component handler
  const handleMLAToggle = (componentId: number, newMLAValue: boolean) => {
    if (!project) return;

    const updatedComponents = project.functionalComponents.map((comp) => {
      if (comp.id === componentId) {
        if (newMLAValue && !comp.subComponents) {
          return {
            ...comp,
            isMLA: true,
            subComponents: createSubComponents(comp),
          };
        } else if (!newMLAValue) {
          return {
            ...comp,
            isMLA: false,
            subComponents: undefined,
          };
        }
        return { ...comp, isMLA: newMLAValue };
      }
      return comp;
    });

    const updatedProject = {
      ...project,
      functionalComponents: updatedComponents,
    };

    setProject(updatedProject);

    if (isLatest) {
      debouncedSaveProject();
    }
  };

  const handleCreateFunctionalComponent = async () => {
    await saveProject(false);

    isManuallySaved.current = true;
    setLoadingProject(true);
    setComponentSearchQuery("");

    if (project) {
      const newFunctionalComponent: TGenericComponentNoId = {
        className: null,
        componentType: null,
        dataElements: null,
        readingReferences: null,
        writingReferences: null,
        functionalMultiplier: null,
        operations: null,
        degreeOfCompletion: 1,
        title: null,
        description: null,
        previousFCId: null,
        orderPosition: project.functionalComponents.length,
        isMLA: false,
        parentFCId: null,
      };

      showNotification(
        alertTranslation.creating,
        alertTranslation.creating,
        "loading",
        "create-functional-component",
      );

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

        // Normalize and sort before setting state
        const normalized = updatedProject.functionalComponents
          .slice()
          .sort((a, b) => a.orderPosition - b.orderPosition)
          .map((c, idx) => ({ ...c, orderPosition: idx }));

        setProject({ ...updatedProject, functionalComponents: normalized });

        updateNotification(
          "create-functional-component",
          alertTranslation.success,
          alertTranslation.createSuccessful,
          "success",
        );

        setTimeout(() => {
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } catch (err) {
        if (err instanceof Error && err.message === "Unauthorized!") {
          await logout();
        }
        updateNotification(
          "create-functional-component",
          alertTranslation.error,
          alertTranslation.createFailed,
          "error",
        );
      } finally {
        setLoadingProject(false);
        setTimeout(() => {
          isManuallySaved.current = false;
        }, 2000);
      }
    }
  };

  const handleDeleteFunctionalComponent = async (
    componentId: number,
  ): Promise<void> => {
    isManuallySaved.current = true;
    setLoadingProject(true);

    showNotification(
      alertTranslation.deleting,
      alertTranslation.deleting,
      "loading",
      "delete-functional-component",
    );

    if (project) {
      try {
        await deleteFunctionalComponent(sessionToken, componentId, project.id);

        const updatedProject = await fetchProject(sessionToken, project.id);
        setProject(updatedProject);

        updateNotification(
          "delete-functional-component",
          alertTranslation.success,
          alertTranslation.deleteSuccessful,
          "success",
        );
      } catch (err) {
        console.error("Delete component error:", err);

        if (err instanceof Error && err.message.includes("JSON")) {
          try {
            const updatedProject = await fetchProject(sessionToken, project.id);
            setProject(updatedProject);

            updateNotification(
              "delete-functional-component",
              alertTranslation.success,
              alertTranslation.deleteSuccessful,
              "success",
            );
            return;
          } catch (fetchErr) {
            console.error("Refetch failed:", fetchErr);
          }
        }

        if (err instanceof Error && err.message === "Unauthorized!") {
          await logout();
        }

        updateNotification(
          "delete-functional-component",
          alertTranslation.error,
          alertTranslation.deleteFailed,
          "error",
        );
      } finally {
        setLoadingProject(false);
        setTimeout(() => {
          isManuallySaved.current = false;
        }, 2000);
      }
    }
  };

  return {
    lastAddedComponentId,
    setLastAddedComponentId,
    handleMLAToggle,
    handleCreateFunctionalComponent,
    handleDeleteFunctionalComponent,
  };
}
