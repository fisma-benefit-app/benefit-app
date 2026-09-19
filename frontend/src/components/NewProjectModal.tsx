import useAppUser from "../hooks/useAppUser";
import { useState, FormEvent, useRef, useEffect, ChangeEvent } from "react";
import {
  createProject,
  fetchAllProjects,
  updateProject,
  fetchProject,
} from "../api/project.ts";
import { useNavigate } from "react-router";
import useTranslations from "../hooks/useTranslations.ts";
import useProjects from "../hooks/useProjects.tsx";
import DotLoadingSpinner from "./DotLoadingSpinner.tsx";
import { parseCsvFile, parseEuropeanNumber } from "../lib/csvImportUtils.ts";
import { TGenericComponent, TGenericComponentNoId } from "../lib/types";
import { createSubComponents } from "../lib/fc-service-functions.ts";

interface NewProjectFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

type ModalView = "selection" | "create" | "import";
type ImportedParentPayload = TGenericComponentNoId & {
  subComponents: TGenericComponentNoId[];
};

export default function NewProjectModal({
  open,
  setOpen,
}: NewProjectFormProps) {
  const navigate = useNavigate();
  const { sessionToken, logout } = useAppUser();
  const { sortedProjects, setProjects } = useProjects();
  const [view, setView] = useState<ModalView>("selection");
  const [name, setName] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const translation = useTranslations().newProjectModal as Record<
    string,
    string
  >;

  useEffect(() => {
    if (open) {
      setView("selection");
      setName("");
      setSelectedFile(null);
      setError(null);
      setShowError(false);
    }
  }, [open]);

  useEffect(() => {
    if (view === "create" && open) {
      inputRef.current?.focus();
    }
  }, [view, open]);

  const displayError = (message: string) => {
    setError(message);
    setShowError(true);
    setTimeout(() => {
      setShowError(false);
      setTimeout(() => setError(null), 500);
    }, 2500);
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const nameTaken = sortedProjects.some(
      (project) => project.projectName.toLowerCase() === name.toLowerCase(),
    );

    if (!name.trim() || nameTaken) {
      setError(
        nameTaken ? translation.nameTakenError : translation.noNameError,
      );
      setName("");
      setLoading(false);
      return;
    }

    try {
      const idOfNewProject = await createProject(sessionToken, name);
      await fetchAllProjects(sessionToken).then(setProjects);
      navigate(`project/${idOfNewProject}`);
      handleClose();
    } catch (err) {
      if (err instanceof Error && err.message === "Unauthorized!") {
        await logout();
      }
      displayError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.name.endsWith(".csv")) {
        displayError(
          translation.invalidFileFormat || "Please select a .csv file",
        );
        e.target.value = ""; // Reset input
        return;
      }
      setSelectedFile(file);
      // Suggest project's name from the file's name
      const suggestedName = file.name
        .replace(/\.csv$/i, "")
        .replace(/-v\d+$/i, "");
      setName(suggestedName);
    }
  };

  const handleImport = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      displayError(translation.noFileSelected || "Please choose a CSV file.");
      return;
    }

    const nameTaken = sortedProjects.some(
      (project) => project.projectName.toLowerCase() === name.toLowerCase(),
    );

    if (!name.trim() || nameTaken) {
      displayError(
        nameTaken ? translation.nameTakenError : translation.noNameError,
      );
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const csvData = await parseCsvFile(selectedFile);

      if (csvData.length === 0) {
        throw new Error(
          translation.emptyCsvFile || "CSV file is empty or invalid.",
        );
      }

      // 1. Create an empty project on the backend to get its ID
      const idOfNewProject = await createProject(sessionToken, name);
      const numericProjectId = Number(idOfNewProject);

      // 2. Fetch the newly created empty project structure so we have a valid Project object to update
      const emptyProject = await fetchProject(sessionToken, numericProjectId);

      const childTitles = new Set(
        csvData.flatMap((row) =>
          row["subComponents"]
            ? row["subComponents"].split(",").map((title) => title.trim())
            : [],
        ),
      );
      const parentRows = csvData.filter((row) => {
        const title = row["Title"]?.trim();
        return (
          Boolean(title) &&
          !childTitles.has(title) &&
          (!row["subComponentType"] || row["subComponentType"].trim() === "")
        );
      });

      // Khai báo kiểu tường minh, nói không với any
      const functionalComponentsPayload: ImportedParentPayload[] = [];
      const usedChildRowIndexes = new Set<number>();

      for (const parentRow of parentRows) {
        // Ignore empty rows or the "Total" row at the end of the file
        if (!parentRow["Title"] || parentRow["Title"].trim() === "") {
          continue;
        }

        // Find and map the actual sub-component rows for Multi-layered Architecture (MLA)
        let subComponentsPayload: TGenericComponentNoId[] = [];

        if (
          parentRow["subComponents"] &&
          parentRow["subComponents"].trim() !== ""
        ) {
          const subTitles = parentRow["subComponents"]
            .split(",")
            .map((s: string) => s.trim());

          subComponentsPayload = subTitles
            .map((subTitle: string) => {
              const childRowIndex = csvData.findIndex(
                (row, rowIndex) =>
                  !usedChildRowIndexes.has(rowIndex) &&
                  row["Title"]?.trim() === subTitle,
              );

              if (childRowIndex !== -1) {
                usedChildRowIndexes.add(childRowIndex);
                const childRow = csvData[childRowIndex];

                return {
                  id: null,
                  title: childRow["Title"].trim(),
                  description: childRow["Description/Comments"]
                    ? childRow["Description/Comments"].trim()
                    : null,
                  className: childRow["Class Name"]
                    ? childRow["Class Name"].trim()
                    : null,
                  componentType: childRow["Component Type"]
                    ? childRow["Component Type"].trim()
                    : null,
                  dataElements: parseInt(childRow["Data Elements"]) || 0,
                  readingReferences:
                    parseInt(childRow["Reading References"]) || 0,
                  writingReferences:
                    parseInt(childRow["Writing References"]) || 0,
                  operations: parseInt(childRow["Operations"]) || 0,
                  degreeOfCompletion: parseEuropeanNumber(
                    childRow["Degree Of Completion"],
                  ),
                  functionalMultiplier: 1,
                  previousFCId: null,
                  orderPosition: 0,
                  isMLA: false,
                  parentFCId: null,
                  subComponentType: childRow["subComponentType"]
                    ? childRow["subComponentType"].trim()
                    : null,
                  isReadonly: true,
                  subComponents: [],
                };
              }
              return null;
            })
            .filter(Boolean) as TGenericComponentNoId[];
        }

        // Build the parent component object mapping to the backend's expected structure
        const parentComponent = {
          id: null,
          title: parentRow["Title"].trim(),
          description: parentRow["Description/Comments"]
            ? parentRow["Description/Comments"].trim()
            : null,
          className: parentRow["Class Name"]
            ? parentRow["Class Name"].trim()
            : null,
          componentType: parentRow["Component Type"]
            ? parentRow["Component Type"].trim()
            : null,
          dataElements: parseInt(parentRow["Data Elements"]) || 0,
          readingReferences: parseInt(parentRow["Reading References"]) || 0,
          writingReferences: parseInt(parentRow["Writing References"]) || 0,
          operations: parseInt(parentRow["Operations"]) || 0,
          degreeOfCompletion: parseEuropeanNumber(
            parentRow["Degree Of Completion"],
          ),
          functionalMultiplier: 1,
          previousFCId: null,
          orderPosition: 0,
          isMLA: Boolean(subComponentsPayload.length > 0),
          parentFCId: null,
          subComponentType: null,
          isReadonly: false,
          subComponents: subComponentsPayload,
        } as TGenericComponentNoId & {
          subComponents: TGenericComponentNoId[];
        };

        if (
          subComponentsPayload.length === 0 &&
          parentRow["subComponents"]?.trim()
        ) {
          const generatedSubComponents = createSubComponents({
            ...parentComponent,
            id: 0,
            subComponents: [],
          } as TGenericComponent).map((subComponent) => ({
            ...subComponent,
            id: null,
            parentFCId: null,
            subComponents: [],
          }));

          parentComponent.subComponents = generatedSubComponents;
          parentComponent.isMLA = generatedSubComponents.length > 0;
        }

        functionalComponentsPayload.push(parentComponent);
      }

      const parentOnlyPayload = functionalComponentsPayload.map((parent) => ({
        ...parent,
        subComponents: [],
      }));

      await updateProject(sessionToken, {
        ...emptyProject,
        functionalComponents: parentOnlyPayload,
      });

      const savedProject = await fetchProject(sessionToken, numericProjectId);
      const payloadWithParentIds = functionalComponentsPayload.map(
        (importedParent) => {
          const savedParent = savedProject.functionalComponents.find(
            (component: TGenericComponent) =>
              component.title === importedParent.title,
          );

          if (!savedParent) return importedParent;

          return {
            ...importedParent,
            id: savedParent.id,
            subComponents: importedParent.subComponents.map(
              (subComponent: TGenericComponentNoId) => ({
                ...subComponent,
                parentFCId: savedParent.id,
              }),
            ),
          };
        },
      );

      await updateProject(sessionToken, {
        ...savedProject,
        functionalComponents: payloadWithParentIds,
      });

      console.log(
        `Successfully imported project with full MLA structure. Project ID: ${idOfNewProject}`,
      );

      // 5. Refresh project list and navigate to the new project view
      await fetchAllProjects(sessionToken).then(setProjects);
      navigate(`project/${idOfNewProject}`);
      handleClose();
    } catch (err) {
      if (err instanceof Error && err.message === "Unauthorized!") {
        await logout();
      }
      displayError(err instanceof Error ? err.message : "Error importing CSV.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setName("");
    setSelectedFile(null);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-[4px] z-999">
      <div className="bg-fisma-blue p-4 shadow-2xl lg w-96">
        <h2 className="text-white text-2xl font-bold text-center bg-fisma-dark-blue mb-4 -mx-4 -mt-4 px-4 py-2">
          {view === "selection" && (translation.header || "New Project")}
          {view === "create" &&
            (translation.createNew || "Create Blank Project")}
          {view === "import" && (translation.importCsv || "Import from CSV")}
        </h2>

        <div className="h-8 mb-4 flex items-center justify-center">
          {loading ? (
            <DotLoadingSpinner />
          ) : (
            error && (
              <label
                className={`text-sm text-fisma-red text-center bg-red-100 border border-fisma-red p-1 transition-opacity duration-500 ease-in-out ${showError ? "opacity-100" : "opacity-0"}`}
              >
                {error}
              </label>
            )
          )}
        </div>
        {view === "selection" && (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setView("create")}
              className="w-full text-white bg-fisma-dark-blue hover:brightness-70 p-3 font-semibold"
            >
              {translation.createNew || "Create Blank Project"}
            </button>

            <div className="flex items-center justify-center space-x-2">
              <hr className="w-1/3 border-gray-400" />
              <span className="text-gray-600 text-sm font-bold">OR</span>
              <hr className="w-1/3 border-gray-400" />
            </div>

            <button
              onClick={() => setView("import")}
              className="w-full text-white bg-green-700 hover:brightness-70 p-3 font-semibold"
            >
              {translation.importCsv || "Import from CSV"}
            </button>

            <button
              onClick={handleClose}
              className="w-full mt-2 text-fisma-dark-blue bg-gray-200 hover:bg-gray-300 p-2"
            >
              {translation.cancel}
            </button>
          </div>
        )}

        {view === "create" && (
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <input
              ref={inputRef}
              type="text"
              maxLength={60}
              placeholder={translation.placeholderText}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              required
              className="w-full p-2 border-2 border-fisma-dark-blue bg-white focus:outline-none"
            />
            <div className="flex justify-evenly items-center">
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setView("selection");
                }}
                className="w-30 text-white bg-fisma-dark-blue hover:brightness-70 p-2"
              >
                {translation.back || "Back"}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-30 text-white bg-fisma-dark-blue hover:brightness-70 p-2"
              >
                {translation.createNew}
              </button>
            </div>
          </form>
        )}

        {view === "import" && (
          <form onSubmit={handleImport} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 p-4 border-2 border-dashed border-fisma-dark-blue bg-white">
              <label className="text-sm font-bold text-fisma-dark-blue">
                {translation.chooseCsvFile || "Choose CSV File:"}
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="text-sm"
                required
              />
            </div>

            {/* Input name of project */}
            {selectedFile && (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-fisma-dark-blue">
                  {translation.projectName || "Project Name:"}
                </label>
                <input
                  type="text"
                  maxLength={60}
                  placeholder={translation.placeholderText}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full p-2 border-2 border-fisma-dark-blue bg-white focus:outline-none"
                />
              </div>
            )}

            <div className="flex justify-between items-center gap-2 mt-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => setView("selection")}
                className="w-1/2 text-white bg-gray-500 hover:brightness-70 p-2"
              >
                {translation.back || "Back"}
              </button>
              <button
                type="submit"
                disabled={loading || !selectedFile}
                className={`w-1/2 text-white p-2 ${!selectedFile ? "bg-gray-400 cursor-not-allowed" : "bg-green-700 hover:brightness-70"}`}
              >
                {translation.import || "Import"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
