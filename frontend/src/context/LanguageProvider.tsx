import { useState } from "react"
import { ContextProviderProps } from "../lib/types"
import { LanguageContext } from "./LanguageContext";

export type LanguageType = "fi" | "en";

export type LanguageContextType = {
    selectedLanguage: LanguageType,
    setSelectedLanguage: React.Dispatch<React.SetStateAction<LanguageType>>,
    languageOptions: string[]
}

const LanguageProvider = ({ children }: ContextProviderProps) => {
    const [selectedLanguage, setSelectedLanguage] = useState<LanguageType>("fi");
    const languageOptions = ["fi", "en"];

    const languageProviderValue: LanguageContextType = {
        selectedLanguage,
        setSelectedLanguage,
        languageOptions
    }

    return (
        <LanguageContext.Provider value={languageProviderValue}>
            {children}
        </LanguageContext.Provider>
    )
}

export default LanguageProvider;