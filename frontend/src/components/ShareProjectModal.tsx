import { type FormEvent, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserMinus } from "@fortawesome/free-solid-svg-icons";
import { AddMemberError, RemoveMemberError } from "../api/project.ts";
import { AppUserSummary, Project } from "../lib/types.ts";
import ConfirmModal from "./ConfirmModal.tsx";
import useTranslations from "../hooks/useTranslations.ts";

interface ShareProjectModalProps {
  project: Project | null;
  onClose: () => void;
  currentUsername: string | undefined;
  onAddUser: (project: Project, username: string) => Promise<void>;
  onRemoveUser: (project: Project, member: AppUserSummary) => Promise<void>;
}

export default function ShareProjectModal({
  project,
  onClose,
  currentUsername,
  onAddUser,
  onRemoveUser,
}: ShareProjectModalProps) {
  const translation = useTranslations();
  const projectListTranslation = translation.projectList;
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [memberToConfirm, setMemberToConfirm] = useState<AppUserSummary | null>(
    null,
  );

  if (!project) return null;

  const close = () => {
    setUsername("");
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      await onAddUser(project, trimmed);
      setUsername("");
    } catch (err) {
      if (err instanceof AddMemberError) {
        setError(
          err.reason === "userNotFound"
            ? projectListTranslation.shareUserNotFound
            : projectListTranslation.shareAlreadyMember,
        );
      } else {
        setError(projectListTranslation.shareFailed);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const removeMember = async (member: AppUserSummary) => {
    setError(null);
    try {
      await onRemoveUser(project, member);
    } catch (err) {
      setError(
        err instanceof RemoveMemberError
          ? projectListTranslation.shareLastMember
          : projectListTranslation.shareFailed,
      );
    }
  };

  const isCurrentUser = (member: AppUserSummary) =>
    member.username === currentUsername;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-2">
          {projectListTranslation.shareProject}: {project.projectName}
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          {projectListTranslation.shareDescription}
        </p>
        <h3 className="font-semibold mb-1">
          {projectListTranslation.shareMembers}
        </h3>
        <ul className="mb-4">
          {project.projectAppUsers.map(({ id, appUser }) => (
            <li key={id} className="flex items-center justify-between py-1">
              <span>
                {appUser.username}
                {isCurrentUser(appUser) &&
                  ` (${projectListTranslation.shareYou})`}
              </span>
              <button
                type="button"
                className="text-gray-500 hover:text-fisma-red p-2 transition-colors"
                title={
                  isCurrentUser(appUser)
                    ? projectListTranslation.shareLeave
                    : projectListTranslation.shareRemove
                }
                onClick={() => setMemberToConfirm(appUser)}
              >
                <FontAwesomeIcon icon={faUserMinus} />
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={handleSubmit}>
          <div className="flex space-x-2">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={50}
              className="flex-1 p-2 border border-gray-300 rounded"
              placeholder={projectListTranslation.shareUsername}
              aria-label={projectListTranslation.shareUsername}
            />
            <button
              type="submit"
              disabled={submitting || !username.trim()}
              className="px-4 py-2 bg-fisma-blue hover:bg-fisma-dark-blue text-white rounded disabled:opacity-50"
            >
              {projectListTranslation.shareAdd}
            </button>
          </div>
          {error && (
            <p role="alert" className="text-fisma-red text-sm mt-2">
              {error}
            </p>
          )}
        </form>
        <div className="flex justify-end mt-4">
          <button
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
            onClick={close}
          >
            {projectListTranslation.shareClose}
          </button>
        </div>
      </div>
      <ConfirmModal
        open={memberToConfirm !== null}
        setOpen={(open) => {
          if (!open) setMemberToConfirm(null);
        }}
        message={
          memberToConfirm && isCurrentUser(memberToConfirm)
            ? projectListTranslation.shareConfirmLeave
            : `${projectListTranslation.shareConfirmRemove} ${memberToConfirm?.username}?`
        }
        onConfirm={() => {
          if (memberToConfirm) removeMember(memberToConfirm);
        }}
      />
    </div>
  );
}
