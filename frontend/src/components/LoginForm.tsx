import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { fetchJWT } from "../api/authorization";
import useAppUser from "../hooks/useAppUser";
import { useError } from "../hooks/useError";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faKey,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import useTranslations from "../hooks/useTranslations";
import DotLoadingSpinner from "./DotLoadingSpinner";
import { decodeJWT } from "../lib/jwtUtils";

export default function LoginForm() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  //const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const { setSessionToken, setLoggedIn, setAppUser, loggedIn } = useAppUser();
  const { showError } = useError();
  const navigate = useNavigate();
  const translation = useTranslations().loginForm;

  const login = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const loginToken = await fetchJWT(username, password);

      // Decode JWT to extract user ID
      const decodedToken = decodeJWT(loginToken);
      const userId = decodedToken?.userId;

      sessionStorage.setItem("loginToken", loginToken);
      sessionStorage.setItem("userInfo", username);
      if (userId != null) {
        sessionStorage.setItem("userId", userId.toString());
      }

      setSessionToken(loginToken);
      setAppUser({ id: userId, username: username });
      setLoggedIn(true);
    } catch (err) {
      if (err instanceof Error) {
        console.error("Login failed:", err.message);
        // Display the actual error message via modal
        showError(err.message);
      } else {
        console.error("Unknown error");
        showError(translation.errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loggedIn) {
      navigate("/");
    }
  }, [loggedIn, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form
        onSubmit={login}
        className="max-w-sm w-full p-4 shadow-md bg-fisma-blue flex flex-col"
      >
        <h1 className="text-2xl text-center text-white font-medium mb-4 bg-fisma-dark-blue -mx-4 -mt-4 px-4 py-2">
          {translation.header}
        </h1>

        <div className="mb-4 relative">
          <FontAwesomeIcon
            icon={faUser}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-fisma-dark-blue"
          />
          <input
            type="text"
            placeholder={translation.username}
            value={username}
            onChange={(e) => setUsername(e.target.value.trim())}
            required
            className="w-full p-2 pl-10 border-2 border-fisma-dark-blue bg-white focus:outline-none"
          />
        </div>

        <div className="mb-4 relative">
          <FontAwesomeIcon
            icon={faKey}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-fisma-dark-blue"
          />
          <input
            type={showPassword ? "text" : "password"}
            placeholder={translation.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 pl-10 border-2 border-fisma-dark-blue bg-white focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-fisma-light-gray hover:brightness-50"
          >
            {showPassword ? (
              <FontAwesomeIcon icon={faEyeSlash} className="w-6 h-6" />
            ) : (
              <FontAwesomeIcon icon={faEye} className="w-6 h-6" />
            )}
          </button>
        </div>

        <button
          type="submit"
          className="w-full min-h-[42px] p-2 text-white bg-fisma-dark-blue hover:brightness-70 flex justify-center items-center cursor-pointer"
          disabled={loading}
        >
          {loading ? <DotLoadingSpinner /> : translation.login}
        </button>
      </form>
    </div>
  );
}
