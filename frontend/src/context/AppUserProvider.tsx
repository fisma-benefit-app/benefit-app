import { ReactNode, useEffect, useState, useCallback } from "react";
import { AppUserContext, AppUserContextType } from "./AppUserContext";
import { AppUser } from "../lib/types";
import { extendSession, validateJWT } from "../api/authorization";
import { decodeJWT, sessionTimeoutConfig } from "../lib/jwtUtils";
import { useAlert } from "./AlertProvider";
import useTranslations from "../hooks/useTranslations";

const API_URL = import.meta.env.VITE_API_URL;
const MAX_TIMEOUT_DELAY = 2_147_483_647;

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

  const clearLocalSession = () => {
    sessionStorage.removeItem("loginToken");
    sessionStorage.removeItem("userInfo");
    sessionStorage.removeItem("userId");

    localStorage.removeItem("loginToken");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("userId");

    setSessionToken(null);
    setAppUser(null);
    setLoggedIn(false);
  };

  const logout = useCallback(async () => {
    setLoadingAuth(true);
    try {
      if (sessionToken) {
        const fetchURL = `${API_URL}/auth/logout`;
        const headers = { Authorization: sessionToken };
        await fetch(fetchURL, { method: "POST", headers });
      }
    } catch (err) {
      console.error(
        "Logout request failed, clearing session locally anyway:",
        err,
      );
    } finally {
      clearLocalSession();
      hideNotification("session-expiring");
      setLoadingAuth(false);
    }
  }, [hideNotification, sessionToken]);

  useEffect(() => {
    const restoreSession = async () => {
      //need to track that items from sessionstorage are retrieved and state update for loggedIn is finished
      setLoadingAuth(true);
      const loginToken =
        sessionStorage.getItem("loginToken") ||
        localStorage.getItem("loginToken");
      const userInfo =
        sessionStorage.getItem("userInfo") || localStorage.getItem("userInfo");
      const userId =
        sessionStorage.getItem("userId") || localStorage.getItem("userId");

      if (loginToken && userInfo) {
        const decoded = decodeJWT(loginToken);
        if (!decoded || !decoded?.exp) {
          await logout();
          console.warn("Could not decode token or no exp claim");
          return;
        }

        const jwtValid = await validateJWT(loginToken);

        if (!jwtValid) {
          clearLocalSession();
        } else {
          setSessionToken(loginToken);
          setAppUser({
            id: userId ? parseInt(userId) : undefined,
            username: userInfo,
          });
          setLoggedIn(true);
        }
      }
      setLoadingAuth(false);
    }

    restoreSession();
  }, []);

  const showSessionWarning = useCallback(
    (expirationTime: number) => {
      const getMinutesLeft = () =>
        Math.max(0, Math.ceil((expirationTime - Date.now()) / 60000));

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
        {
          label: translation.extendSession,
          onClick: async () => {
            try {
              const rememberMe = localStorage.getItem("loginToken") !== null;
              const renewedToken = await extendSession(
                sessionToken!,
                rememberMe,
              );

              if (localStorage.getItem("loginToken")) {
                localStorage.setItem("loginToken", renewedToken);
              } else {
                sessionStorage.setItem("loginToken", renewedToken);
              }
              setSessionToken(renewedToken);
              hideNotification("session-expiring");
            } catch (error) {
              console.error("Could not extend session:", error);
              await logout();
            }
          },
        },
      );
    },
    [
      hideNotification,
      logout,
      sessionToken,
      showNotification,
      translation.extendSession,
      translation.sessionExpirationDescription,
      translation.sessionExpirationHeader,
    ],
  );

  useEffect(() => {
    if (!sessionToken) return;

    const decoded = decodeJWT(sessionToken);
    if (!decoded || !decoded?.exp) {
      logout();
      console.warn("Could not decode token or no exp claim");
      return;
    }

    const expirationTime = decoded.exp * 1000;
    const timeUntilExpiration = expirationTime - Date.now();

    if (timeUntilExpiration <= 0) {
      logout();
      return;
    }

    console.log(
      `Setting auto-logout timeout for ${timeUntilExpiration}ms (${(timeUntilExpiration / 1000).toFixed(2)}s)`,
    );

    const scheduleUntil = (deadline: number, callback: () => void) => {
      let timeoutId: number | undefined;

      const scheduleNext = () => {
        const remaining = deadline - Date.now();
        if (remaining <= 0) {
          callback();
          return;
        }

        timeoutId = window.setTimeout(
          scheduleNext,
          Math.min(remaining, MAX_TIMEOUT_DELAY),
        );
      };

      scheduleNext();

      return () => {
        if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      };
    };

    const cancelLogoutTimeout = scheduleUntil(expirationTime, logout);

    const sessionWarningThreshhold =
      sessionTimeoutConfig.sessionWarningThreshhold;
    const alertCountdownTick = sessionTimeoutConfig.alertCountdownTick;
    const timeUntilFirstWarning =
      timeUntilExpiration - sessionWarningThreshhold;

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

    let cancelWarningTimeout = () => { };

    if (timeUntilFirstWarning <= 0) {
      startCountdown();
    } else {
      cancelWarningTimeout = scheduleUntil(
        expirationTime - sessionWarningThreshhold,
        startCountdown,
      );
    }

    return () => {
      cancelLogoutTimeout();
      cancelWarningTimeout();
      if (countdownIntervalId) clearInterval(countdownIntervalId);
    };
  }, [sessionToken, logout, showSessionWarning]);

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
