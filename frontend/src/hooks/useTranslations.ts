import useLanguage from "./useLanguage";
import { translations } from "../lib/translations";

const useTranslations = () => {
  const { language } = useLanguage();
  return translations[language];
};

export default useTranslations;
