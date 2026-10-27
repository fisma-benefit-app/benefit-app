import { useEffect, useState } from "react";
import {
  fetchProjectComments,
  createProjectComment,
  updateProjectComment,
  deleteProjectComment,
} from "../api/comments.ts";
import { CommentResponse } from "../lib/types.ts";

// Comment state and CRUD for one project. Comments are (re)loaded whenever
// the project id or session changes.
export default function useProjectComments(
  sessionToken: string | null,
  projectId: number | undefined,
) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [commentToDeleteId, setCommentToDeleteId] = useState<number | null>(
    null,
  );
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  useEffect(() => {
    if (!projectId || !sessionToken) return;

    const loadProjectComments = async () => {
      setCommentsLoading(true);
      try {
        const projectComments = await fetchProjectComments(
          sessionToken,
          projectId,
        );
        setComments(projectComments);
      } catch (error) {
        console.error("Failed to load project comments", error);
      } finally {
        setCommentsLoading(false);
      }
    };

    loadProjectComments();
  }, [projectId, sessionToken]);

  const handleCreateComment = async () => {
    if (!projectId || !commentText.trim()) return;

    try {
      const createdComment = await createProjectComment(
        sessionToken,
        projectId,
        { text: commentText.trim() },
      );
      setComments((prev) => [...prev, createdComment]);
      setCommentText("");
      setCommentsOpen(true);
    } catch (error) {
      console.error("Failed to create comment", error);
    }
  };

  const handleStartEditingComment = (
    commentId: number,
    existingText: string,
  ) => {
    setEditingCommentId(commentId);
    setEditingText(existingText);
  };

  const handleCancelEditingComment = () => {
    setEditingCommentId(null);
    setEditingText("");
  };

  const handleUpdateComment = async () => {
    if (!projectId || editingCommentId == null || !editingText.trim()) return;

    try {
      const updatedComment = await updateProjectComment(
        sessionToken,
        projectId,
        editingCommentId,
        { text: editingText.trim() },
      );

      setComments((prev) =>
        prev.map((comment) =>
          comment.id === updatedComment.id ? updatedComment : comment,
        ),
      );
      handleCancelEditingComment();
    } catch (error) {
      console.error("Failed to update comment", error);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!projectId) return;

    try {
      await deleteProjectComment(sessionToken, projectId, commentId);
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
      if (editingCommentId === commentId) {
        handleCancelEditingComment();
      }
    } catch (error) {
      console.error("Failed to delete comment", error);
    } finally {
      setCommentToDeleteId(null);
    }
  };

  return {
    commentsOpen,
    setCommentsOpen,
    commentText,
    setCommentText,
    editingCommentId,
    editingText,
    setEditingText,
    commentToDeleteId,
    setCommentToDeleteId,
    comments,
    commentsLoading,
    handleCreateComment,
    handleStartEditingComment,
    handleCancelEditingComment,
    handleUpdateComment,
    handleDeleteComment,
  };
}
