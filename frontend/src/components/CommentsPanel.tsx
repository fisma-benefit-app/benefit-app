import useTranslations from "../hooks/useTranslations.ts";
import useProjectComments from "../hooks/useProjectComments.ts";

type CommentsPanelProps = {
  comments: ReturnType<typeof useProjectComments>;
  // Archived versions show comments read-only.
  isLatest: boolean;
};

export default function CommentsPanel({
  comments: state,
  isLatest,
}: CommentsPanelProps) {
  const translation = useTranslations().projectPage;
  const alertTranslation = useTranslations().alert;
  const {
    comments,
    commentsLoading,
    commentText,
    setCommentText,
    editingCommentId,
    editingText,
    setEditingText,
    setCommentToDeleteId,
    handleCreateComment,
    handleStartEditingComment,
    handleCancelEditingComment,
    handleUpdateComment,
  } = state;

  return (
    <div className="mt-3 border border-gray-300 p-3 bg-gray-50 rounded">
      <div className="mb-2 text-sm font-medium">
        {translation.commentsTitle}
      </div>

      {!isLatest && (
        <div className="mb-3 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] text-amber-700">
          {translation.archivedVersionReadOnly}
        </div>
      )}

      {commentsLoading ? (
        <div className="text-xs text-gray-500">{alertTranslation.loading}</div>
      ) : comments.length === 0 ? (
        <div className="text-xs text-gray-500">{translation.noCommentsYet}</div>
      ) : (
        <ul className="space-y-2 text-sm">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="bg-white p-2 rounded border border-gray-200"
            >
              {editingCommentId === comment.id && isLatest ? (
                <div className="space-y-2">
                  <textarea
                    value={editingText}
                    onChange={(event) => setEditingText(event.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 p-2 text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateComment}
                      className="bg-fisma-blue hover:bg-fisma-dark-blue text-white px-3 py-1.5 text-xs rounded"
                      disabled={!editingText.trim()}
                    >
                      {translation.save}
                    </button>
                    <button
                      onClick={handleCancelEditingComment}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1.5 text-xs rounded"
                    >
                      {translation.cancel}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="whitespace-pre-wrap break-words">
                    {comment.text}
                  </div>
                  {isLatest && (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() =>
                          handleStartEditingComment(comment.id, comment.text)
                        }
                        className="text-xs text-fisma-blue underline"
                      >
                        {translation.edit}
                      </button>
                      <button
                        onClick={() => setCommentToDeleteId(comment.id)}
                        className="text-xs text-red-600 underline"
                      >
                        {translation.delete}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {isLatest && editingCommentId === null && (
        <>
          <textarea
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            rows={3}
            placeholder={translation.addCommentPlaceholder}
            className="w-full border border-gray-300 p-2 mt-3 text-sm"
          />

          <button
            onClick={handleCreateComment}
            className="mt-2 w-full bg-fisma-blue hover:bg-fisma-dark-blue text-white py-2 px-4 rounded"
            disabled={!commentText.trim()}
          >
            {translation.addComment}
          </button>
        </>
      )}
    </div>
  );
}
