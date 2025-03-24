import { useState } from "react"
import { ContextProviderProps } from "../lib/types"
import { LanguageContext } from "./LanguageContext";
import { translations, Language, TranslationKey } from "../lib/translations";

const LanguageProvider = ({ children }: ContextProviderProps) => {
    const [language, setLanguage] = useState<Language>("fi");

    const t = (key: TranslationKey): string => {
        return key.split(".").reduce((obj, part) => {
          if (obj && typeof obj === "object" && part in obj) {
            return obj[part as keyof typeof obj];
          }
          return key;
        }, translations[language] as unknown) as string;
    };
      
    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
          {children}
        </LanguageContext.Provider>
    );
}

export default LanguageProvider;
// const LanguageProvider = ({ children }: ContextProviderProps) => {
//     const [selectedLanguage, setSelectedLanguage] = useState<LanguageType>("fi");
//     const languageOptions = ["fi", "en"];

//     const languageProviderValue: LanguageContextType = {
//         selectedLanguage,
//         setSelectedLanguage,
//         languageOptions
//     }

//     return (
//         <LanguageContext.Provider value={languageProviderValue}>
//             {children}
//         </LanguageContext.Provider>
//     )
// }

// export default LanguageProvider;