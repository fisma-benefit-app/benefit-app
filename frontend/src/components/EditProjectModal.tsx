import { Project } from "../lib/types.ts";
import useTranslations from "../hooks/useTranslations.ts";

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProject: Project | null;
  editProjectName: string;
  onEditProjectNameChange: (name: string) => void;
  onSave: () => void;
}

export default function EditProjectModal({
  isOpen,
  onClose,
  selectedProject,
  editProjectName,
  onEditProjectNameChange,
  onSave,
}: EditProjectModalProps) {
  const translation = useTranslations();
  const projectListTranslation = translation.projectList;

  if (!isOpen || !selectedProject) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">{projectListTranslation.editProjectName}</h2>
        <input
          type="text"
          value={editProjectName}
          onChange={(e) => onEditProjectNameChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
          placeholder={projectListTranslation.projectName}
        />
        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
            onClick={onClose}
          >
            {translation.confirmModal.cancel}
          </button>
          <button
            className="px-4 py-2 bg-fisma-blue hover:bg-fisma-dark-blue text-white rounded"
            onClick={onSave}
          >
            {translation.alert.save}
          </button>
        </div>
      </div>
    </div>
  );
}
