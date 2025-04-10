import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { fetchJWT } from '../api/authorization';
import useAppUser from '../hooks/useAppUser';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faKey, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import useTranslations from '../hooks/useTranslations';
import DotLoadingSpinner from './DotLoadingSpinner';

export default function LoginForm() {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [rememberMe, setRememberMe] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [loginError, setLoginError] = useState<string | null>(null)
    const [showLoginError, setShowLoginError] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const { setSessionToken, setLoggedIn, setAppUser, loggedIn } = useAppUser();
    const navigate = useNavigate();
    const translation = useTranslations().loginForm;

    const login = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoginError(null);
        setLoading(true);

        const loginToken = await fetchJWT(username, password);

        if (!loginToken) {
            setLoginError(translation.errorMessage);
            setShowLoginError(true);

            setTimeout(() => {
                setShowLoginError(false);
                setTimeout(() => setLoginError(null), 500);
            }, 2500);
            setLoading(false);
            return;
        }

        sessionStorage.setItem("loginToken", loginToken);
        sessionStorage.setItem("userInfo", username);
        setSessionToken(loginToken);
        setAppUser({ username: username });
        setLoggedIn(true);
    };

    useEffect(() => {
        if (loggedIn) {
            navigate("/");
        }
    }, [loggedIn, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <form onSubmit={login} className="max-w-sm w-full p-4 shadow-md bg-fisma-blue flex flex-col">
                <h1 className="text-2xl text-center text-white font-medium mb-4 bg-fisma-dark-blue -mx-4 -mt-4 px-4 py-2">
                    {translation.header}
                </h1>

                <div className="h-8 mb-4 flex items-center justify-center">
                    {loginError && (
                        <label className={`text-sm text-fisma-red bg-red-100 border border-fisma-red p-1 transition-opacity duration-500 ease-in-out ${showLoginError ? 'opacity-100' : 'opacity-0'}`}>
                            {loginError}
                        </label>
                    )}
                </div>

                <div className="mb-4 relative">
                    <FontAwesomeIcon icon={faUser} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-fisma-dark-blue" />
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
                    <FontAwesomeIcon icon={faKey} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-fisma-dark-blue" />
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
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    >
                        {showPassword ? <FontAwesomeIcon icon={faEyeSlash} className="w-6 h-6" /> : <FontAwesomeIcon icon={faEye} className="w-6 h-6" />}
                    </button>
                </div>

                <div className="flex justify-between items-center mb-4 text-white">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="mr-2 cursor-pointer accent-fisma-dark-blue rounded"
                        />
                        {translation.rememberMe}
                    </label>
                    <a href="#" className="text-white text-sm hover:underline">{translation.forgotPassword}</a>
                </div>

                <button
                    type="submit"
                    className="w-full min-h-[42px] p-2 text-white bg-fisma-dark-blue hover:brightness-70 disabled:brightness-70 flex justify-center items-center cursor-pointer"
                    disabled={loading}
                >
                    {loading ? (
                        <DotLoadingSpinner/>
                    ) : translation.login}
                </button>
            </form>
        </div>
    );
}