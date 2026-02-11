import useAppUser from "../hooks/useAppUser";
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faHome,
  faPlus,
  faBars,
  faTimes,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import NewProjectModal from "./NewProjectModal";
import ConfirmModal from "./ConfirmModal";
import useLanguage from "../hooks/useLanguage";
import useTranslations from "../hooks/useTranslations";

const Header = () => {
  const navigate = useNavigate();
  const { appUser, loggedIn, logout, setLoggedIn, sessionToken } = useAppUser();
  const [isProjectModalOpen, setProjectModalOpen] = useState(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setUserDropdownOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const translation = useTranslations().header;

  const changeLanguage = () => {
    setLanguage(language === "fi" ? "en" : "fi");
    localStorage.setItem("languagePreference", language === "fi" ? "en" : "fi");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu when navigating
  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    setConfirmModalOpen(true);
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const handleProfileClick = () => {
    navigate("/profile");
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const tryLogout = () => {
    if (
      sessionStorage.getItem("loginToken") !== sessionToken ||
      sessionStorage.getItem("loginToken") === null
    ) {
      console.log(sessionStorage.getItem("loginToken"));
      console.log(sessionToken);
      setLoggedIn(false);
      navigate("/login");
    } else {
      logout();
    }
  };

  return (
    <>
      <header className="fixed top-0 w-full bg-fisma-blue text-white flex z-999 h-15">
        <Link to="/">
          <img
            src={`${import.meta.env.BASE_URL}Fisma-benefit_logo.png`}
            alt="FISMA-BENEFIT-logo"
            className="h-12 w-auto mb-2 ml-10 hover:opacity-75 drop-shadow-fisma-logo"
          />
        </Link>
        <div className="absolute top-0 right-0 h-full flex items-stretch">
          {loggedIn && (
            <>
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-stretch">
                <button
                  className="flex items-center text-lg px-5 hover:bg-fisma-dark-blue"
                  onClick={() => navigate("/")}
                  title={translation.home}
                >
                  <FontAwesomeIcon icon={faHome} />
                </button>
                <button
                  className="flex items-center text-lg px-5 hover:bg-fisma-dark-blue"
                  onClick={() => setProjectModalOpen(true)}
                  title={translation.newProject}
                >
                  <FontAwesomeIcon icon={faPlus} />
                </button>

                {/* User Dropdown */}
                <div className="relative flex items-stretch" ref={dropdownRef}>
                  <button
                    className="px-5 hover:bg-fisma-dark-blue flex items-center gap-2"
                    onClick={() => setUserDropdownOpen(!isUserDropdownOpen)}
                  >
                    <FontAwesomeIcon icon={faUser} />
                    <span className="text-sm font-semibold">
                      {appUser?.username}
                    </span>
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={`text-xs transition-transform ${
                        isUserDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 top-full mt-0 w-48 bg-white text-gray-800 shadow-lg rounded-b-md overflow-hidden z-50">
                      <button
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors flex items-center gap-3"
                        onClick={handleProfileClick}
                      >
                        <FontAwesomeIcon
                          icon={faUser}
                          className="text-fisma-blue"
                        />
                        {translation.profile}
                      </button>
                      <button
                        className="w-full text-left px-4 py-3 hover:bg-fisma-red hover:text-white transition-colors flex items-center gap-3 border-t border-gray-200"
                        onClick={handleLogout}
                      >
                        <FontAwesomeIcon icon={faUser} />
                        {translation.logout}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Burger Menu */}
              <div className="md:hidden flex items-stretch">
                <button
                  className="flex items-center text-2xl px-5 hover:bg-fisma-dark-blue"
                  onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label={translation.menu}
                >
                  <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} />
                </button>
              </div>
            </>
          )}

          {/* Language Switcher - Desktop Only */}
          {!loggedIn && (
            <button
              className="flex items-center w-15 text-lg px-5 hover:bg-fisma-dark-blue"
              onClick={changeLanguage}
            >
              {language.toUpperCase()}
            </button>
          )}
          {loggedIn && (
            <button
              className="hidden md:flex items-center w-15 text-lg px-5 hover:bg-fisma-dark-blue"
              onClick={changeLanguage}
            >
              {language.toUpperCase()}
            </button>
          )}
        </div>

        {/* Mobile Menu Dropdown */}
        {loggedIn && isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-fisma-blue shadow-lg md:hidden z-40">
            <button
              className="w-full text-left px-6 py-4 hover:bg-fisma-dark-blue border-b border-fisma-dark-blue flex items-center gap-3"
              onClick={() => {
                changeLanguage();
              }}
            >
              {language.toUpperCase()}
            </button>
            <button
              className="w-full text-left px-6 py-4 hover:bg-fisma-dark-blue border-b border-fisma-dark-blue flex items-center gap-3"
              onClick={() => handleNavigation("/")}
            >
              <FontAwesomeIcon icon={faHome} />
              {translation.home}
            </button>
            <button
              className="w-full text-left px-6 py-4 hover:bg-fisma-dark-blue border-b border-fisma-dark-blue flex items-center gap-3"
              onClick={() => {
                setProjectModalOpen(true);
                setMobileMenuOpen(false);
              }}
            >
              <FontAwesomeIcon icon={faPlus} />
              {translation.newProject}
            </button>

            <div className="px-6 py-3 bg-fisma-dark-blue text-xs font-semibold border-b border-fisma-blue">
              {appUser?.username}
            </div>
            <button
              className="w-full text-left px-6 py-4 hover:bg-fisma-dark-blue border-b border-fisma-dark-blue flex items-center gap-3"
              onClick={handleProfileClick}
            >
              <FontAwesomeIcon icon={faUser} />
              {translation.profile}
            </button>

            <button
              className="w-full text-left px-6 py-4 hover:bg-fisma-red flex items-center gap-3"
              onClick={handleLogout}
            >
              <FontAwesomeIcon icon={faUser} />
              {translation.logout}
            </button>
          </div>
        )}
      </header>
      <NewProjectModal
        open={isProjectModalOpen}
        setOpen={setProjectModalOpen}
      />
      <ConfirmModal
        message={translation.logoutWarning}
        onConfirm={tryLogout}
        open={isConfirmModalOpen}
        setOpen={setConfirmModalOpen}
      />
    </>
  );
};

export default Header;
