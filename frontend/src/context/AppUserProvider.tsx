import { ReactNode, useEffect, useState } from "react";
import { AppUserContext, AppUserContextType } from "./AppUserContext";
const API_URL = import.meta.env.VITE_API_URL;

type AppUserProviderProps = {
  children: ReactNode;
};

export type AppUser = {
  username: string;
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
        throw new Error("Unauthorized!");
      } else {
        throw new Error(`Error logging out! Status: ${response.status}`);
      }
    }

    // Remove locally stored authentication data
    sessionStorage.removeItem("loginToken");
    sessionStorage.removeItem("userInfo");

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

    if (loginToken && userInfo) {
      setSessionToken(loginToken);
      setAppUser({ username: userInfo });
      setLoggedIn(true);
    }

    //need to track that items from sessionstorage are retrieved and state update for loggedIn is finished
    setLoadingAuth(false);
  }, []);

  return (
    <AppUserContext.Provider value={appUserProviderValue}>
      {children}
    </AppUserContext.Provider>
  );
};

export default AppUserProvider;
