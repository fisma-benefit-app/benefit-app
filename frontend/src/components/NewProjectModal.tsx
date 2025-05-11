import useAppUser from "../hooks/useAppUser";
import { useState, FormEvent, useRef, useEffect } from "react";
import { createProject, fetchAllProjects } from "../api/project.ts";
import { useNavigate } from "react-router";
import useTranslations from "../hooks/useTranslations.ts";
import useProjects from "../hooks/useProjects.tsx";
import DotLoadingSpinner from "./DotLoadingSpinner.tsx";

interface NewProjectFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function NewProjectModal({ open, setOpen }: NewProjectFormProps) {
  const navigate = useNavigate();
  const { sessionToken } = useAppUser();
  const { sortedProjects, setProjects } = useProjects();
  const [name, setName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const translation = useTranslations().newProjectModal;

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const nameTaken = sortedProjects.some(project => project.projectName.toLowerCase() === name.toLowerCase());

    if (!name.trim() || nameTaken) {

      setError(nameTaken ? translation.nameTakenError : translation.noNameError);
      setName("");
      setShowError(true);

      setTimeout(() => {
        setShowError(false);
        setTimeout(() => setError(null), 500);
      }, 2500);
      setLoading(false);
      return;
    }

    try {
      const idOfNewProject = await createProject(sessionToken, name);
      await fetchAllProjects(sessionToken).then(setProjects);
      navigate(`project/${idOfNewProject}`);
      setOpen(false);
    } catch (err) {
      console.error("Error creating project:", err);
      setError(err instanceof Error ? err.message : "Unexpected error occured while sending new project request to backend.");
      setShowError(true);

      setTimeout(() => {
        setShowError(false);
        setTimeout(() => setError(null), 500);
      }, 2500);
    } finally {
      setLoading(false);
      setName("");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-[4px] z-999">
      <div className="bg-fisma-blue p-4 shadow-2xl lg w-96">
        <h2 className="text-white text-2xl font-bold text-center bg-fisma-dark-blue mb-4 -mx-4 -mt-4 px-4 py-2">
          {translation.header}
        </h2>

        <div className="h-8 mb-4 flex items-center justify-center">
          {loading ? (
            <DotLoadingSpinner />
          ) : (
            error && (
              <label className={`text-sm text-fisma-red text-center bg-red-100 border border-fisma-red p-1 transition-opacity duration-500 ease-in-out ${showError ? 'opacity-100' : 'opacity-0'}`}>
                {error}
              </label>
            )
          )}
        </div>

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
              onClick={() => { setOpen(false); setName(""); }}
              className="w-30 text-white bg-fisma-dark-blue hover:brightness-70 p-2">
              {translation.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-30 text-white bg-fisma-dark-blue hover:brightness-70 p-2">
              {translation.createNew}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}