import useAppUser from "../hooks/useAppUser";
import { ChangeEvent, useState } from "react";
import { Link, useNavigate } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faHome, faPlus } from "@fortawesome/free-solid-svg-icons";
import NewProjectModal from "./NewProjectModal";
import { headerTranslations } from "../lib/translations";
import useLanguage from "../hooks/useLanguage";
import { LanguageType } from "../context/LanguageProvider";

const Header = () => {
  const navigate = useNavigate();
  const { appUser, loggedIn, setAppUser, setLoggedIn, setSessionToken } = useAppUser();
  const [isProjectModalOpen, setProjectModalOpen] = useState(false);
  const { selectedLanguage, setSelectedLanguage, languageOptions } = useLanguage();

  const logout = () => {
    if (window.confirm("Haluatko varmasti kirjautua ulos?")) {
      sessionStorage.removeItem("loginToken");
      sessionStorage.removeItem("userInfo");
      setSessionToken(null);
      setAppUser(null);
      setLoggedIn(false);
      //TODO: Notify backend about logging out!
    }
  };

  const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    //value of e is always typeof LanguageType
    setSelectedLanguage(e.target.value as LanguageType);
  }

  //TODO: Save before redirecting or logging out?
  return (
    <header className="fixed top-0 w-full bg-fisma-blue text-white flex z-999">
      <Link to="/">
        <img
          src="/Fisma-benefit_logo.png"
          alt="FISMA Logo"
          className="h-15 w-auto mb-2 ml-10 hover:brightness-90 drop-shadow-fisma-logo"
        />
      </Link>
      <div className="absolute top-0 right-0 h-full flex items-center">
        <select onChange={handleLanguageChange}>
          {languageOptions.map((option, index) => <option key={index} value={option}>{option}</option>)}
        </select>
        {loggedIn && (
          <>
            <button
              className="h-full text-lg px-5 bg-fisma-chathams-blue hover:bg-fisma-gray"
              onClick={() => navigate("/")}
            >
              <FontAwesomeIcon icon={faHome} />
            </button>
            <button
              className="h-full text-lg px-5 bg-fisma-dark-blue hover:bg-fisma-gray"
              onClick={() => setProjectModalOpen(true)}
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
            <button
              className="h-full text-lg px-5 bg-fisma-blue hover:bg-fisma-red"
              onClick={logout}
            >
              {headerTranslations.logoutButton[selectedLanguage]}
              <FontAwesomeIcon icon={faUser} className="ml-2 mr-2" />({" "}
              {appUser?.username} )
            </button>
          </>
        )}
      </div>
      <NewProjectModal open={isProjectModalOpen} setOpen={setProjectModalOpen} />
    </header>
  );
};

export default Header;
