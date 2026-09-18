import { networkingErrorMessages } from "../lib/networkingErrorMessages";

const API_URL = import.meta.env.VITE_API_URL;

const fetchJWT = async (
  username: string,
  password: string,
  rememberMe: boolean,
) => {
  const fetchURL = `${API_URL}/token?rememberMe=${rememberMe}`;
  const headers = {
    //Encode user info in Base64 which is expected by the endpoint
    Authorization: `Basic ${btoa(`${username}:${password}`)}`,
  };

  try {
    const response = await fetch(fetchURL, { method: "POST", headers });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(networkingErrorMessages.UNAUTHORIZED);
      } else if (response.status === 429) {
        throw new Error("Too many login attempts!");
      }
      throw new Error(
        `Error getting JWT in fetchJWT! Status: ${response.status}`,
      );
    }

    const token = response.headers.get("Authorization");

    if (!token) {
      throw new Error("No Authorization token received from server.");
    }

    return token;
  } catch (error) {
    // Network error or no connection to server
    if (!navigator.onLine || error instanceof TypeError) {
      throw new Error(networkingErrorMessages.SERVICE_UNAVAILABLE);
    }
    // Re-throw other errors
    throw error;
  }
};

const extendSession = async (sessionToken: string, rememberMe: boolean) => {
  const fetchURL = `${API_URL}/token?rememberMe=${rememberMe}`;
  const response = await fetch(fetchURL, {
    method: "POST",
    headers: { Authorization: sessionToken },
  });

  if (!response.ok) {
    throw new Error(`Error extending session! Status: ${response.status}`);
  }

  const token = response.headers.get("Authorization");
  if (!token) {
    throw new Error("No Authorization token received from server.");
  }

  return token;
};

const validateJWT = async (sessionToken: string): Promise<boolean | null> => {
  const fetchURL = `${API_URL}/auth/validateJWT`;
  const headers = { Authorization: sessionToken };

  try {
    const response = await fetch(fetchURL, { method: "GET", headers });

    if (response.ok) {
      return true;
    }

    if (response.status === 401) {
      return false;
    }

    console.error(`Unexpected status validating session: ${response.status}`);
    return null;
  } catch (error) {
    console.error("Session validation request failed:", error);
    return null;
  }
};

export { extendSession, fetchJWT, validateJWT };
