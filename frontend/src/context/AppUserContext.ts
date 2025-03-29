import { createContext } from "react";
import { AppUserContextType } from "./AppUserProvider";

export const AppUserContext = createContext<AppUserContextType | null>(null);