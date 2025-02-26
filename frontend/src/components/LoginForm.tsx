import { useState, FormEvent, useEffect } from 'react';
import useAppUser from '../hooks/useAppUser';
import { fetchJWT } from '../api/authorization';
import { useNavigate } from 'react-router';
// import { EyeIcon, EyeSlashIcon, LockClosedIcon, UserIcon } from "@heroicons/react/24/solid";

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

    // TODO: Automatic login with saved token? 
    // useEffect(() => {
    //     const savedToken = sessionStorage.getItem("loginToken");
    //     if (savedToken) {
    //         setSessionToken(savedToken);
    //         setLoggedIn(true);
    //     }
    // }, []);

    useEffect(() => {
        if (loggedIn) {
            navigate("/"); //TODO to main page!
        }
    }, [loggedIn]);

    return (
        <div className="flex justify-center items-center h-screen bg-[#c6e5ff]">
            <form onSubmit={login} className="max-w-sm w-full mx-auto p-4 border-2 border-gray-400 shadow-md bg-white flex flex-col">
                <h1 className="text-2xl text-gray-700 font-bold mb-4 text-center">Kirjaudu sisään</h1>
                
                <div className="h-8 mb-4 flex items-center justify-center">
                    {loginError && (
                        <label className={`text-sm text-red-700 bg-red-100 border border-red-400 p-1 rounded transition-opacity duration-500 ease-in-out ${showLoginError ? 'opacity-100' : 'opacity-0'}`}>
                            {loginError}
                        </label>
                    )}
                </div>

                <div className="mb-4 relative">
                    {/*                 <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" /> */}
                    <input
                        type="text"
                        placeholder="Käyttäjänimi"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="w-full p-2 pl-10 border-2 border-gray-400 bg-grey-700"
                    />
                </div>

                <div className="mb-4 relative">
                    {/*<LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />*/}
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
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                        {/*{showPassword ? <EyeSlashIcon className="w-6 h-6" /> : <EyeIcon className="w-6 h-6" />}*/}
                    </button>
                </div>

                <div className="flex justify-between items-center mb-4 text-gray-700">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="mr-2"
                        />
                        Muista minut
                    </label>
                    <a href="#" className="text-blue-500 text-sm hover:underline">Unohditko salasanan?</a>
                </div>

                <button
                    type="submit"
                    className="w-full bg-sky-600 text-white p-2 hover:bg-zinc-600 flex justify-center items-center"
                    disabled={loading}
                >
                    {loading? (
                        <svg className="animate-spin h-5 w-5 mr-2 border-white border-2 rounded-full" viewBox="0 0 24 24">
                             <circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="4" strokeDasharray="31.4" strokeLinecap="round"></circle>
                        </svg>
                    ): "Kirjaudu"}
                </button>
            </form>
        </div>
    );
}