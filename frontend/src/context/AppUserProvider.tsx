import { ReactNode, useEffect, useState } from "react";
import { AppUserContext, AppUserContextType } from "./AppUserContext";

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

  const logout = () => {
    setLoadingAuth(true);

    // Remove locally stored authentication data
    sessionStorage.removeItem("loginToken");
    sessionStorage.removeItem("userInfo");

    // Reset app state
    setSessionToken(null);
    setAppUser(null);
    setLoggedIn(false);

    setLoadingAuth(false);

    // TODO (CRITICAL): Revoke token server-side! If someone copied it, it
    // would still be valid until it expires (i.e. for 24 hours)
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
