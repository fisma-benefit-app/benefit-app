import { createContext } from "react";
import { Language } from "./LanguageProvider";

interface LanguageContextType {
  language: Language;
  setLanguage: React.Dispatch<React.SetStateAction<Language>>;
}

export const LanguageContext = createContext<LanguageContextType | null>(null);
