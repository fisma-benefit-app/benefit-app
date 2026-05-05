import { useState, useEffect } from "react";
import useTranslations from "../hooks/useTranslations";
import { ProjectComment } from "../lib/types";

interface CommentModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  projectComments: ProjectComment[];
  onSaveComments: (comments: string[]) => Promise<void>;
}

export default function CommentModal({
  open,
  setOpen,
  projectComments,
  onSaveComments,
}: CommentModalProps) {
  const translation = useTranslations().commentModal;
  const [comments, setComments] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Initialize comments from projectComments
  useEffect(() => {
    if (open) {
      const existingComments = projectComments.map((c) => c.text);
      // Ensure we have at least one empty comment field, up to 6 total
      const commentsArray = [...existingComments];
      while (commentsArray.length < 6) {
        commentsArray.push("");
      }
      setComments(commentsArray.slice(0, 6)); // Limit to 6
    }
  }, [open, projectComments]);

  const handleCommentChange = (index: number, value: string) => {
    const newComments = [...comments];
    newComments[index] = value;
    setComments(newComments);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Filter out empty comments
      const nonEmptyComments = comments.filter((c) => c.trim() !== "");
      await onSaveComments(nonEmptyComments);
      setOpen(false);
    } catch (error) {
      console.error("Error saving comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-[4px] z-50">
      <div className="bg-fisma-blue p-6 shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-white text-2xl font-medium text-center overflow-hidden overflow-ellipsis bg-fisma-dark-blue mb-6 -mx-6 -mt-6 px-6 py-4">
          {translation.header}
        </h2>

        <div className="space-y-4 mb-6">
          {comments.map((comment, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-white font-medium min-w-[60px]">
                {translation.comment} {index + 1}:
              </span>
              <input
                type="text"
                value={comment}
                onChange={(e) => handleCommentChange(index, e.target.value)}
                placeholder={translation.placeholder}
                maxLength={200}
                className="flex-1 px-3 py-2 bg-white text-black rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-fisma-dark-blue"
              />
            </div>
          ))}
        </div>

        <div className="text-sm text-white mb-4">
          {translation.maxCharacters}
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 text-white bg-gray-600 hover:bg-gray-700 disabled:opacity-50 rounded"
          >
            {translation.cancel}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 text-white bg-fisma-dark-blue hover:brightness-110 disabled:opacity-50 rounded"
          >
            {loading ? "Saving..." : translation.save}
          </button>
        </div>
      </div>
    </div>
  );
}
