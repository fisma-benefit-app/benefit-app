import { AppUserRequest, AppUserRole } from "../lib/types";
const API_URL = import.meta.env.VITE_API_URL;

// "notLatestVersion": another tab archived this version as a new one, so it can no longer be
// edited. "savedElsewhere": another tab saved this version first.
export class ConflictError extends Error {
  constructor(readonly reason: "notLatestVersion" | "savedElsewhere") {
    super("Conflict!");
  }
}

const createUser = async (
  sessionToken: string | null,
  roleForUser: AppUserRole,
  nameForUser: string | null,
  passwordForUser: string | null,
) => {
  if (!sessionToken)
    throw new Error("User needs to be logged in to create a user!");
  if (!roleForUser) throw new Error("New user needs a role!");
  if (!nameForUser) throw new Error("New user needs a name!");
  if (!passwordForUser) throw new Error("New user needs a password!");

  const fetchURL = `${API_URL}/appusers`;
  const headers = {
    Authorization: sessionToken,
    "Content-Type": "application/json",
  };

  // Build ProjectRequest DTO
  const userRequest: AppUserRequest = {
    username: nameForUser,
    password: passwordForUser,
    role: roleForUser,
  };

  const response = await fetch(fetchURL, {
    method: "POST",
    headers,
    body: JSON.stringify(userRequest),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized!");
    }
    throw new Error(
      `Error creating a new user in createUser! Status: ${response.status}`,
    );
  }

  //   const location = response.headers.get("Location");

  //   if (!location) {
  //     throw new Error("User created but no Location header found!");
  //   }

  //   const parts = location.split("projects/");
  //   const newProjectId = parts.length > 1 ? parts[1] : null;

  //   if (!newProjectId) {
  //     throw new Error("Id of new project could not be parsed!");
  //   } else return newProjectId;
};

export { createUser };
