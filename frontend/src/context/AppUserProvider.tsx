import { ReactNode, useEffect, useState } from "react";
import { AppUserContext, AppUserContextType } from "./AppUserContext";
import { AppUser } from "../lib/types";
import { decodeJWT } from "../lib/jwtUtils";

const API_URL = import.meta.env.VITE_API_URL;

type AppUserProviderProps = {
  children: ReactNode;
};

const AppUserProvider = ({ children }: AppUserProviderProps) => {
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  const logout = async () => {
    setLoadingAuth(true);

    if (!sessionToken)
      throw new Error("User needs to be logged in to log out!");

    // Send logout request to backend
    const fetchURL = `${API_URL}/auth/logout`;
    const headers = {
      Authorization: sessionToken,
    };

    const response = await fetch(fetchURL, { method: "POST", headers });

    if (!response.ok) {
      if (response.status === 401) {
        setLoadingAuth(false); //If the response is ok, stop loading --> not stuck in a loading loop
        throw new Error("Unauthorized!");
      } else {
        setLoadingAuth(false);
        throw new Error(`Error logging out! Status: ${response.status}`);
      }
    }

    // Remove locally stored authentication data
    sessionStorage.removeItem("loginToken");
    sessionStorage.removeItem("userInfo");
    sessionStorage.removeItem("userId");

    // Reset app state
    setSessionToken(null);
    setAppUser(null);
    setLoggedIn(false);

    setLoadingAuth(false);
  };

  const appUserProviderValue: AppUserContextType = {
    loadingAuth,
    appUser,
    loggedIn,
    sessionToken,
    setSessionToken,
    setLoggedIn,
    setAppUser,
    logout,
  };

  //get login data from the session storage when application is refreshed
  useEffect(() => {
    setLoadingAuth(true);
    const loginToken = sessionStorage.getItem("loginToken");
    const userInfo = sessionStorage.getItem("userInfo");
    const userId = sessionStorage.getItem("userId");

    if (loginToken && userInfo) {
      setSessionToken(loginToken);
      setAppUser({
        id: userId ? parseInt(userId) : undefined,
        username: userInfo,
      });
      setLoggedIn(true);
    }

    //need to track that items from sessionstorage are retrieved and state update for loggedIn is finished
    setLoadingAuth(false);
  }, []);

  useEffect(() => {
    if (!sessionToken) return;

    const decoded = decodeJWT(sessionToken);
    if (!decoded?.exp) {
      console.warn("Could not decode token or no exp claim");
      return;
    }

    const expirationTime = decoded.exp * 1000; // convert to milliseconds
    const timeUntilExpiration = expirationTime - Date.now();

    if (timeUntilExpiration <= 0) {
      logout().catch((error) => {
        console.error("Error during immediate logout:", error);
        // Force logout without calling backend
        sessionStorage.removeItem("loginToken");
        sessionStorage.removeItem("userInfo");
        sessionStorage.removeItem("userId");
        setSessionToken(null);
        setAppUser(null);
        setLoggedIn(false);
      });
      return;
    }

    console.log(
      `Setting auto-logout timeout for ${timeUntilExpiration}ms (${(timeUntilExpiration / 1000).toFixed(2)}s)`,
    );

    const timeoutId = setTimeout(() => {
      logout();
    }, timeUntilExpiration);

    return () => clearTimeout(timeoutId);
  }, [sessionToken]);

  return (
    <AppUserContext.Provider value={appUserProviderValue}>
      {children}
    </AppUserContext.Provider>
  );
};

export default AppUserProvider;
