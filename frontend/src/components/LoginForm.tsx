import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { fetchJWT } from '../api/authorization';
import useAppUser from '../hooks/useAppUser';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faKey, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

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

    const login = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoginError(null);
        setLoading(true);

        const loginToken = await fetchJWT(username, password);

        if (!loginToken) {
            setLoginError('Kirjautuminen epäonnistui! Tarkista käyttäjänimi ja salasana.');
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
    }, [loggedIn]);

    return (//TODO: Change background!
        <div className="flex justify-center items-center h-screen bg-[#c6e5ff]"> 
            <form onSubmit={login} className="max-w-sm w-full mx-auto p-4 border-2 border-gray-400 shadow-md bg-white flex flex-col">
                <h1 className="text-2xl text-fisma-dark-blue font-extrabold mb-4 text-center">Kirjaudu sisään</h1>

                <div className="h-8 mb-4 flex items-center justify-center">
                    {loginError && (
                        <label className={`text-sm text-fisma-red bg-red-100 border border-fisma-red p-1 rounded transition-opacity duration-500 ease-in-out ${showLoginError ? 'opacity-100' : 'opacity-0'}`}>
                            {loginError}
                        </label>
                    )}
                </div>

                <div className="mb-4 relative">
                    <FontAwesomeIcon icon={faUser} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Käyttäjänimi"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="w-full p-2 pl-10 border-2 border-gray-400"
                    />
                </div>

                <div className="mb-4 relative">
                    <FontAwesomeIcon icon={faKey} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Salasana"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full p-2 pl-10 border-2 border-gray-400 pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    >
                        {showPassword ? <FontAwesomeIcon icon={faEyeSlash} className="w-6 h-6" /> : <FontAwesomeIcon icon={faEye} className="w-6 h-6" />}
                    </button>
                </div>

                <div className="flex justify-between items-center mb-4 text-fisma-dark-blue">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="mr-2 cursor-pointer"
                        />
                        Muista minut
                    </label>
                    <a href="#" className="text-fisma-blue text-sm hover:underline">Unohditko salasanan?</a>
                </div>

                <button
                    type="submit"
                    className="w-full bg-fisma-blue text-white p-2 hover:bg-fisma-gray flex justify-center items-center cursor-pointer"
                    disabled={loading}
                >
                    {loading ? (
                        <svg className="animate-spin h-5 w-5 mr-2 border-white border-2 rounded-full" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="4" strokeDasharray="31.4" strokeLinecap="round"></circle>
                        </svg>
                    ) : "Kirjaudu"}
                </button>
            </form>
        </div>
    );
}