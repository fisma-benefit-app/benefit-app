import useAppUser from "../hooks/useAppUser";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faHome, faPlus } from "@fortawesome/free-solid-svg-icons";
import NewProjectModal from "./NewProjectModal";
import useLanguage from "../hooks/useLanguage";

const Header = () => {
  const navigate = useNavigate();
  const { appUser, loggedIn, setAppUser, setLoggedIn, setSessionToken } = useAppUser();
  const [isProjectModalOpen, setProjectModalOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();

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
              className="h-full text-lg px-5 bg-fisma-chathams-blue hover:bg-fisma-red"
              onClick={logout}
            >
              {t("header.logout")}
              <FontAwesomeIcon icon={faUser} className="ml-2 mr-2" />({" "}
              {appUser?.username} )
            </button>
          </>
        )}
        <button
          className="h-full text-lg px-5 bg-fisma-dark-blue hover:bg-fisma-gray"
          onClick={() => setLanguage(language === "fi" ? "en" : "fi")}
        >
          {language.toUpperCase()}
        </button>
      </div>
      <NewProjectModal open={isProjectModalOpen} setOpen={setProjectModalOpen} />
    </header>
  );
};

export default Header;
