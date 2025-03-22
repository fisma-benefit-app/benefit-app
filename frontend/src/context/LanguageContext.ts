import { createContext } from "react";
import { LanguageContextType } from "./LanguageProvider";

export const LanguageContext = createContext<LanguageContextType | null>(null);