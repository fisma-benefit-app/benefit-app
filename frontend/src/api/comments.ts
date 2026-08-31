import { CommentRequest, CommentResponse } from "../lib/types";

const API_URL = import.meta.env.VITE_API_URL;

const fetchProjectComments = async (
  sessionToken: string | null,
  projectId: number | undefined,
): Promise<CommentResponse[]> => {
  if (!sessionToken) {
    throw new Error("User needs to be logged in to fetch comments!");
  }
  if (!projectId) {
    throw new Error("Request needs the id of the project!");
  }

  const fetchURL = `${API_URL}/projects/${projectId}/comments`;
  const headers = {
    Authorization: sessionToken,
  };

  const response = await fetch(fetchURL, { method: "GET", headers });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized!");
    }
    throw new Error(
      `Error fetching project comments in fetchProjectComments! Status: ${response.status}`,
    );
  }

  return response.json();
};

const createProjectComment = async (
  sessionToken: string | null,
  projectId: number | undefined,
  request: CommentRequest,
): Promise<CommentResponse> => {
  if (!sessionToken) {
    throw new Error("User needs to be logged in to create a comment!");
  }
  if (!projectId) {
    throw new Error("Request needs the id of the project!");
  }

  const fetchURL = `${API_URL}/projects/${projectId}/comments`;
  const headers = {
    Authorization: sessionToken,
    "Content-Type": "application/json",
  };

  const response = await fetch(fetchURL, {
    method: "POST",
    headers,
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized!");
    }
    throw new Error(
      `Error creating a project comment in createProjectComment! Status: ${response.status}`,
    );
  }

  const location = response.headers.get("Location");
  if (!location) {
    throw new Error("Comment created but no Location header found!");
  }

  const lastSegment = location.split("/").pop();
  if (!lastSegment) {
    throw new Error("Comment id could not be parsed!");
  }

  const commentResponse: CommentResponse = {
    id: Number(lastSegment),
    text: request.text,
    projectId,
  };

  return commentResponse;
};

const updateProjectComment = async (
  sessionToken: string | null,
  projectId: number | undefined,
  commentId: number,
  request: CommentRequest,
): Promise<CommentResponse> => {
  if (!sessionToken) {
    throw new Error("User needs to be logged in to update a comment!");
  }
  if (!projectId) {
    throw new Error("Request needs the id of the project!");
  }

  const fetchURL = `${API_URL}/projects/${projectId}/comments/${commentId}`;
  const headers = {
    Authorization: sessionToken,
    "Content-Type": "application/json",
  };

  const response = await fetch(fetchURL, {
    method: "PUT",
    headers,
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized!");
    }
    throw new Error(
      `Error updating a project comment in updateProjectComment! Status: ${response.status}`,
    );
  }

  return response.json();
};

const deleteProjectComment = async (
  sessionToken: string | null,
  projectId: number | undefined,
  commentId: number,
): Promise<void> => {
  if (!sessionToken) {
    throw new Error("User needs to be logged in to delete a comment!");
  }
  if (!projectId) {
    throw new Error("Request needs the id of the project!");
  }

  const fetchURL = `${API_URL}/projects/${projectId}/comments/${commentId}`;
  const headers = {
    Authorization: sessionToken,
  };

  const response = await fetch(fetchURL, { method: "DELETE", headers });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized!");
    }
    throw new Error(
      `Error deleting a project comment in deleteProjectComment! Status: ${response.status}`,
    );
  }
};

export {
  fetchProjectComments,
  createProjectComment,
  updateProjectComment,
  deleteProjectComment,
};
