import { useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";

const useLanguage = () => {
    const context = useContext(LanguageContext);

    if (!context) {
        throw new Error("Use this hook within the LanguageProvider component!")
    }

    return context;
}

export default useLanguage;