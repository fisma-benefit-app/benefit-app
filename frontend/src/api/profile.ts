const API_URL = import.meta.env.VITE_API_URL;

export interface AppUserSummary {
  id: number;
  username: string;
}

export interface AppUserRequest {
  username: string;
  password: string;
}

export interface PasswordChangeRequest {
  newPassword: string;
}

/**
 * Get user by ID
 * GET /appusers/{id}
 */
const getUserById = async (
  sessionToken: string | null,
  userId: number,
): Promise<AppUserSummary> => {
  if (!sessionToken)
    throw new Error("User needs to be logged in to fetch user information!");
  if (!userId) throw new Error("Request needs the id of the user!");

  const fetchURL = `${API_URL}/appusers/${userId}`;
  const headers = {
    Authorization: sessionToken,
  };

  const response = await fetch(fetchURL, { method: "GET", headers });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized!");
    } else if (response.status === 404) {
      throw new Error("User not found!");
    } else {
      throw new Error(
        `Error fetching user in getUserById! Status: ${response.status}`,
      );
    }
  }

  const user = await response.json();
  return user;
};

/**
 * Create new user
 * POST /appusers
 */
const createAppUser = async (
  userRequest: AppUserRequest,
): Promise<AppUserSummary> => {
  if (!userRequest.username || !userRequest.password) {
    throw new Error("Username and password are required!");
  }

  const fetchURL = `${API_URL}/appusers`;
  const headers = {
    "Content-Type": "application/json",
  };

  const response = await fetch(fetchURL, {
    method: "POST",
    headers,
    body: JSON.stringify(userRequest),
  });

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error("Invalid user data!");
    } else {
      throw new Error(
        `Error creating user in createAppUser! Status: ${response.status}`,
      );
    }
  }

  return response.json();
};

/**
 * Update user
 * PUT /appusers/{id}
 */
const updateAppUser = async (
  sessionToken: string | null,
  userId: number,
  userRequest: AppUserRequest,
): Promise<AppUserSummary> => {
  if (!sessionToken)
    throw new Error("User needs to be logged in to update user!");
  if (!userId) throw new Error("Request needs the id of the user!");
  if (!userRequest.username || !userRequest.password) {
    throw new Error("Username and password are required!");
  }

  const fetchURL = `${API_URL}/appusers/${userId}`;
  const headers = {
    Authorization: sessionToken,
    "Content-Type": "application/json",
  };

  const response = await fetch(fetchURL, {
    method: "PUT",
    headers,
    body: JSON.stringify(userRequest),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized!");
    } else if (response.status === 404) {
      throw new Error("User not found!");
    } else if (response.status === 500) {
      throw new Error(
        "Failed to update user due to database constraint violation or internal error!",
      );
    } else {
      throw new Error(
        `Error updating user in updateAppUser! Status: ${response.status}`,
      );
    }
  }

  return response.json();
};

/**
 * Delete user account
 * DELETE /appusers/{id}
 */
const deleteAppUser = async (
  sessionToken: string | null,
  userId: number,
): Promise<void> => {
  if (!sessionToken)
    throw new Error("User needs to be logged in to delete account!");
  if (!userId) throw new Error("Request needs the id of the user!");

  const fetchURL = `${API_URL}/appusers/${userId}`;
  const headers = {
    Authorization: sessionToken,
  };

  const response = await fetch(fetchURL, { method: "DELETE", headers });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized!");
    } else if (response.status === 500) {
      throw new Error(
        "Failed to delete user due to database integrity constraints or cascading deletion errors!",
      );
    } else {
      throw new Error(
        `Error deleting user in deleteAppUser! Status: ${response.status}`,
      );
    }
  }
};

/**
 * Change user password
 * PUT /appusers/password
 */
const changePassword = async (
  sessionToken: string | null,
  newPassword: string,
): Promise<string> => {
  if (!sessionToken)
    throw new Error("User needs to be logged in to change password!");
  if (!newPassword) throw new Error("New password is required!");

  const fetchURL = `${API_URL}/appusers/password`;
  const headers = {
    Authorization: sessionToken,
    "Content-Type": "application/json",
  };

  const passwordChangeRequest: PasswordChangeRequest = {
    newPassword: newPassword,
  };

  const response = await fetch(fetchURL, {
    method: "PUT",
    headers,
    body: JSON.stringify(passwordChangeRequest),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized!");
    } else if (response.status === 400) {
      throw new Error("Invalid password format!");
    } else if (response.status === 500) {
      throw new Error(
        "Password encryption failure or database error during password update!",
      );
    } else {
      throw new Error(
        `Error changing password in changePassword! Status: ${response.status}`,
      );
    }
  }

  return response.text();
};

export {
  getUserById,
  createAppUser,
  updateAppUser,
  deleteAppUser,
  changePassword,
};
