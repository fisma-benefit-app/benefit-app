import { ReactNode, useEffect, useState } from "react";
import { AppUserContext, AppUserContextType } from "./AppUserContext";
import { AppUser } from "../lib/types";
import { decodeJWT } from "../lib/jwtUtils";
import { useAlert } from "./AlertProvider";
import useTranslations from "../hooks/useTranslations";

const API_URL = import.meta.env.VITE_API_URL;

type AppUserProviderProps = {
  children: ReactNode;
};

const AppUserProvider = ({ children }: AppUserProviderProps) => {
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  const { showNotification, hideNotification } = useAlert();
  const translation = useTranslations().alert;

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

  const clearLocalSession = () => {
    sessionStorage.removeItem("loginToken");
    sessionStorage.removeItem("userInfo");
    sessionStorage.removeItem("userId");
    setSessionToken(null);
    setAppUser(null);
    setLoggedIn(false);
  };

  const logout = async () => {
    setLoadingAuth(true);
    try {
      if (sessionToken) {
        const fetchURL = `${API_URL}/auth/logout`;
        const headers = { Authorization: sessionToken };
        await fetch(fetchURL, { method: "POST", headers });
      }
    } catch (err) {
      console.error("Logout request failed, clearing session locally anyway:", err);
    } finally {
      clearLocalSession();
      hideNotification("session-expiring");
      setLoadingAuth(false);
    }
  };

  const showSessionWarning = (expirationTime: number) => {
    const getMinutesLeft = () => Math.max(0, Math.ceil((expirationTime - Date.now()) / 60000));

    const updateSessionWarning = (minutesLeft: number) =>
      translation.sessionExpirationDescription.replace(
        "{minutes}",
        String(minutesLeft),
      );

    showNotification(
      translation.sessionExpirationHeader,
      updateSessionWarning(getMinutesLeft()),
      "error",
      "session-expiring",
    );
  }

  useEffect(() => {
    if (!sessionToken) return;

    const decoded = decodeJWT(sessionToken);
    if (!decoded?.exp) {
      console.warn("Could not decode token or no exp claim");
      return;
    }

    const expirationTime = decoded.exp * 1000;
    const timeUntilExpiration = expirationTime - Date.now();

    if (timeUntilExpiration <= 0) {
      logout();
      return;
    }

    console.log(`Setting auto-logout timeout for ${timeUntilExpiration}ms (${(timeUntilExpiration / 1000).toFixed(2)}s)`);

    const timeoutId = setTimeout(() => {
      logout();
    }, timeUntilExpiration);

    const sessionWarningThreshhold = 30 * 60 * 1000;
    const alertCountdownTick = 5 * 60 * 1000;
    const timeUntilFirstWarning = timeUntilExpiration - sessionWarningThreshhold;

    let countdownIntervalId: number | undefined;

    const startCountdown = () => {
      showSessionWarning(expirationTime);

      countdownIntervalId = setInterval(() => {
        if (expirationTime - Date.now() <= 0) {
          if (countdownIntervalId) clearInterval(countdownIntervalId);
          return;
        }
        showSessionWarning(expirationTime);
      }, alertCountdownTick);
    };

    let warningTimeoutId: number | undefined;

    if (timeUntilFirstWarning <= 0) {
      startCountdown();
    } else {
      warningTimeoutId = setTimeout(startCountdown, timeUntilFirstWarning);
    }

    return () => {
      clearTimeout(timeoutId);
      if (warningTimeoutId) clearTimeout(warningTimeoutId);
      if (countdownIntervalId) clearInterval(countdownIntervalId);
    }
  }, [sessionToken, translation]);

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

  return (
    <AppUserContext.Provider value={appUserProviderValue}>
      {children}
    </AppUserContext.Provider>
  );
};

export default AppUserProvider;
