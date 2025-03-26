import { useState } from "react"
import { ContextProviderProps } from "../lib/types"
import { LanguageContext } from "./LanguageContext";

export type Language = "fi" | "en";

const LanguageProvider = ({ children }: ContextProviderProps) => {
    const [language, setLanguage] = useState<Language>("fi");
      
    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
          {children}
        </LanguageContext.Provider>
    );
}

export default LanguageProvider;
