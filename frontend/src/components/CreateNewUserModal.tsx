import useAppUser from "../hooks/useAppUser.tsx";
import { useState, FormEvent, useRef, useEffect } from "react";
import { createUser } from "../api/users.ts";
import useTranslations from "../hooks/useTranslations.ts";
import { useAlert } from "../hooks/useAlert.ts";
import DotLoadingSpinner from "./DotLoadingSpinner.tsx";
import { AppUserRole, TGenericComponentNoId } from "../lib/types.ts";

interface NewUserFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

type ModalView = "selection" | "create" | "import";
// type ImportedParentPayload = TGenericComponentNoId & {
//   subComponents: TGenericComponentNoId[];
// };

export default function CreateNewUserModal({
  open,
  setOpen,
}: NewUserFormProps) {
  // const navigate = useNavigate();
  const { sessionToken, logout } = useAppUser();
  const { showNotification } = useAlert();
  // const { sortedProjects, setProjects } = useProjects();
  const [view, setView] = useState<ModalView>("selection");
  const [role, setRole] = useState<AppUserRole>(null);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  // const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const translations = useTranslations();
  const translation = translations.newUserModal as Record<string, string>;

  useEffect(() => {
    if (open) {
      setView("selection");
      setRole(null);
      setUsername("");
      setPassword("");
      setConfirmPassword("");
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

    if (password !== confirmPassword) {
      displayError(translation.passwordsDontMatch);
      return;
    }

    setLoading(true);

    try {
      await createUser(sessionToken, role, username, password);
      showNotification(
        translations.alert.success,
        translation.userCreated,
        "success",
        "user-created",
      );
      // const idOfNewProject = await createProject(sessionToken, username);

      // await fetchAllProjects(sessionToken).then(setProjects);
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

  const handleClose = () => {
    setOpen(false);
    setRole(null);
    setUsername("");
    setPassword("");
    setConfirmPassword("");
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
              <label
                className={`text-sm text-fisma-red text-center bg-red-100 border border-fisma-red p-1 transition-opacity duration-500 ease-in-out ${showError ? "opacity-100" : "opacity-0"}`}
              >
                {error}
              </label>
            )
          )}
        </div>

        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <select
            value={role ?? ""}
            onChange={(e) => {
              setRole(e.target.value as AppUserRole);
            }}
            required
            className="w-full p-2 border-2 border-fisma-dark-blue bg-white focus:outline-none"
          >
            <option value="" disabled>
              Select a role
            </option>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>

          <input
            ref={inputRef}
            type="text"
            maxLength={50}
            placeholder={translation.placeholderText}
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
            }}
            required
            className="w-full p-2 border-2 border-fisma-dark-blue bg-white focus:outline-none"
          />

          <input
            ref={inputRef}
            type="password"
            maxLength={50}
            placeholder={"password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            required
            className="w-full p-2 border-2 border-fisma-dark-blue bg-white focus:outline-none"
          />

          <input
            ref={inputRef}
            type="password"
            maxLength={60}
            placeholder={"confirm password"}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
            }}
            required
            className="w-full p-2 border-2 border-fisma-dark-blue bg-white focus:outline-none"
          />

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 p-2 text-fisma-dark-blue bg-gray-200 hover:bg-gray-300"
            >
              {translation.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 p-2 text-white bg-fisma-dark-blue hover:brightness-70 disabled:opacity-60"
            >
              {translation.createUser}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
