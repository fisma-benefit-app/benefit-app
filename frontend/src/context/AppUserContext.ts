import { createContext } from "react";
import { AppUser } from "../lib/types";

export type AppUserContextType = {
  loadingAuth: boolean;
  appUser: AppUser | null;
  loggedIn: boolean;
  invalidSession: boolean;
  sessionToken: string | null;
  setInvalidSession: React.Dispatch<React.SetStateAction<boolean>>;
  setSessionToken: React.Dispatch<React.SetStateAction<string | null>>;
  setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  setAppUser: React.Dispatch<React.SetStateAction<AppUser | null>>;
  logout: () => Promise<void>;
};

export const AppUserContext = createContext<AppUserContextType | null>(null);
