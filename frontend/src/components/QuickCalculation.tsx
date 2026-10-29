import { ChangeEvent, FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import {
  createProject,
  fetchAllProjects,
  fetchProject,
  updateProject,
} from "../api/project.ts";
import useAppUser from "../hooks/useAppUser.tsx";
import useProjects from "../hooks/useProjects.tsx";
import useTranslations from "../hooks/useTranslations.ts";
import {
  getComponentTypeOptions,
  getInputFields,
} from "../lib/fc-service-functions.ts";
import {
  MAX_GENERATED_COMPONENTS,
  QuickCalculationAverage,
  QuickCalculationCounts,
  QuickCalculationKey,
  buildQuickCalculationComponents,
  calculateQuickCalculationSize,
  countGeneratedComponents,
  defaultQuickCalculationAverages,
  quickCalculationItems,
} from "../lib/quickCalculation.ts";
import { ComponentType, TGenericComponent } from "../lib/types.ts";
import DotLoadingSpinner from "./DotLoadingSpinner.tsx";

const parameterFields = [
  "dataElements",
  "readingReferences",
  "writingReferences",
  "operations",
] as const;

const inputClassName =
  "w-full max-w-[120px] sm:max-w-[200px] shrink-0 p-2 border border-[#ccc] bg-white rounded text-base";

const toCount = (value: string) => Math.max(0, parseInt(value) || 0);

const QuickCalculation = () => {
  const navigate = useNavigate();
  const { loggedIn, sessionToken, logout } = useAppUser();
  const { sortedProjects, setProjects } = useProjects();
  const translations = useTranslations();
  const translation = translations.quickCalculation;
  const classTranslation = translations.functionalClassComponent;
  const newProjectTranslation = translations.newProjectModal;

  const [countInputs, setCountInputs] = useState<
    Record<QuickCalculationKey, string>
  >({
    query: "",
    input: "",
    output: "",
    interfaceTo: "",
    interfaceFrom: "",
    entity: "",
    rule: "",
  });
  const [averages, setAverages] = useState(defaultQuickCalculationAverages);
  const [projectName, setProjectName] = useState("");
  const [markAllComplete, setMarkAllComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const counts = Object.fromEntries(
    quickCalculationItems.map(({ key }) => [key, toCount(countInputs[key])]),
  ) as QuickCalculationCounts;
  const size = Math.round(calculateQuickCalculationSize(counts, averages));
  const tooLarge =
    countGeneratedComponents(counts, averages) > MAX_GENERATED_COMPONENTS;

  const handleCountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCountInputs({ ...countInputs, [name]: value });
  };

  const updateAverage = (
    key: QuickCalculationKey,
    change: Partial<QuickCalculationAverage>,
  ) => {
    setAverages({ ...averages, [key]: { ...averages[key], ...change } });
  };

  const handleCreateProject = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const nameTaken = sortedProjects.some(
      (project) =>
        project.projectName.toLowerCase() === projectName.toLowerCase(),
    );
    if (!projectName.trim() || nameTaken) {
      setError(
        nameTaken
          ? newProjectTranslation.nameTakenError
          : newProjectTranslation.noNameError,
      );
      setProjectName("");
      return;
    }

    setLoading(true);
    try {
      const titles = Object.fromEntries(
        quickCalculationItems.map(({ key }) => [
          key,
          translation.items[key].title,
        ]),
      ) as Record<QuickCalculationKey, string>;
      const components = buildQuickCalculationComponents(
        counts,
        averages,
        titles,
        markAllComplete ? 1 : 0,
      );

      // Same two steps as the CSV import: the sub-components can only be attached once their
      // parents have been saved and have ids.
      const idOfNewProject = Number(
        await createProject(sessionToken, projectName),
      );
      const emptyProject = await fetchProject(sessionToken, idOfNewProject);
      await updateProject(sessionToken, {
        ...emptyProject,
        functionalComponents: components.map((component) => ({
          ...component,
          subComponents: undefined,
        })),
      });

      const savedProject = await fetchProject(sessionToken, idOfNewProject);
      await updateProject(sessionToken, {
        ...savedProject,
        functionalComponents: components.map((component) => {
          const savedComponent = savedProject.functionalComponents.find(
            (saved: TGenericComponent) => saved.title === component.title,
          );
          if (!savedComponent) {
            throw new Error(`Component ${component.title} was not saved!`);
          }
          return {
            ...component,
            id: savedComponent.id,
            subComponents: component.subComponents?.map((subComponent) => ({
              ...subComponent,
              parentFCId: savedComponent.id,
            })),
          };
        }),
      });

      await fetchAllProjects(sessionToken).then(setProjects);
      navigate(`/project/${idOfNewProject}`);
    } catch (err) {
      if (err instanceof Error && err.message === "Unauthorized!") {
        await logout();
      }
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-8">
      <div className="max-w-[800px] mt-8 mx-auto px-4">
        <div className="mb-6">
          <label
            htmlFor="platformList"
            className="block mb-2 font-medium text-[#333]"
          >
            {translation.architecture}
          </label>
          <select
            disabled
            id="platformList"
            name="platformList"
            className="w-full max-w-[200px] p-2 border bg-gray-400 border-[#ccc] rounded text-base"
          >
            <option value="4">
              {translation.architectureOptions.threeLayer}
            </option>
            <option value="1">
              {translation.architectureOptions.singlePlatform}
            </option>
            <option value="2">
              {translation.architectureOptions.isolatedUi}
            </option>
            <option value="3">
              {translation.architectureOptions.isolatedDatabase}
            </option>
          </select>
        </div>

        <div className="mb-6">
          <h3>{translation.functionality}</h3>

          {quickCalculationItems.map(({ key }) => (
            <div key={key} className="flex items-center gap-4 mb-4">
              <input
                type="number"
                id={key}
                name={key}
                value={countInputs[key]}
                min="0"
                onChange={handleCountChange}
                className={inputClassName}
              />
              <label
                htmlFor={key}
                className="block m-0 font-normal text-[#333]"
              >
                {translation.unit} {translation.items[key].label}
              </label>
            </div>
          ))}
        </div>

        <details className="mb-6">
          <summary className="cursor-pointer font-medium text-[#333]">
            {translation.averagesHeader}
          </summary>
          <p className="my-3 text-[#333]">{translation.averagesDescription}</p>
          <button
            type="button"
            onClick={() => setAverages(defaultQuickCalculationAverages)}
            className="mb-4 bg-[#1e73be] hover:bg-[#13517a] text-white py-2 px-4 border-0 rounded text-base cursor-pointer"
          >
            {translation.resetAverages}
          </button>
          {quickCalculationItems.map(({ key, className }) => {
            const inputFields = getInputFields(className);
            return (
              <div key={key} className="mb-4">
                <div className="mb-1 font-medium text-[#333]">
                  {translation.items[key].title}
                </div>
                <div className="grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:items-end">
                  {key === "input" && (
                    <select
                      aria-label={classTranslation.componentTypePlaceholder}
                      value={averages[key].componentType}
                      onChange={(e) =>
                        updateAverage(key, {
                          componentType: e.target.value as ComponentType,
                        })
                      }
                      className="col-span-2 sm:col-span-1 p-2 border border-[#ccc] bg-white rounded text-base"
                    >
                      {getComponentTypeOptions(className).map((option) => (
                        <option key={option} value={option}>
                          {classTranslation.componentTypeOptions[option]}
                        </option>
                      ))}
                    </select>
                  )}
                  {parameterFields
                    .filter((field) => inputFields.includes(field))
                    .map((field) => (
                      <div key={field} className="flex flex-col">
                        <label
                          htmlFor={`${key}-${field}`}
                          className="text-sm text-[#333]"
                        >
                          {classTranslation.parameters[field].fullView}
                        </label>
                        <input
                          type="number"
                          id={`${key}-${field}`}
                          value={averages[key][field]}
                          min="0"
                          onChange={(e) =>
                            updateAverage(key, {
                              [field]: Math.max(
                                0,
                                Math.trunc(Number(e.target.value)) || 0,
                              ),
                            })
                          }
                          className="w-full sm:w-28 p-2 border border-[#ccc] bg-white rounded text-base"
                        />
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </details>

        <div
          className="bg-[#f8f9fa] border-2 border-[#1e73be] rounded-lg p-6 mt-8 text-2xl font-bold text-[#1e73be] text-center"
          id="Tulosalue"
        >
          {translation.result}: {size} fp
        </div>

        {loggedIn && (
          <form onSubmit={handleCreateProject} className="mt-8">
            <h3>{translation.createProjectHeader}</h3>
            <p className="my-3 text-[#333]">
              {translation.createProjectDescription}
            </p>
            <div className="flex flex-col gap-4 max-w-[400px]">
              <input
                type="text"
                maxLength={60}
                placeholder={newProjectTranslation.placeholderText}
                value={projectName}
                onChange={(e) => {
                  setProjectName(e.target.value);
                  setError(null);
                }}
                required
                className="w-full p-2 border border-[#ccc] bg-white rounded text-base"
              />
              <label className="flex items-center gap-2 text-[#333]">
                <input
                  type="checkbox"
                  checked={markAllComplete}
                  onChange={(e) => setMarkAllComplete(e.target.checked)}
                />
                {translation.markAllComplete}
              </label>
              {tooLarge && (
                <p className="m-0 text-fisma-red">{translation.tooLarge}</p>
              )}
              {error && <p className="m-0 text-fisma-red">{error}</p>}
              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={loading || tooLarge || size === 0}
                  className="bg-[#1e73be] hover:bg-[#13517a] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-8 border-0 rounded text-base cursor-pointer"
                >
                  {translation.createProject}
                </button>
                {loading && (
                  <span className="bg-fisma-blue rounded p-1">
                    <DotLoadingSpinner />
                  </span>
                )}
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default QuickCalculation;
