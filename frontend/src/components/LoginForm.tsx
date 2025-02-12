import { useState, FormEvent } from 'react';
// import { EyeIcon, EyeSlashIcon, LockClosedIcon, UserIcon } from "@heroicons/react/24/solid";

export default function LoginForm() {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [rememberMe, setRememberMe] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log({ username, password, rememberMe });
        //TODO: Add authentication logic
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-sm mx-auto p-4 border-2 border-gray-400 shadow-md ">
            <h1 className="text-2xl text-gray-700 font-bold mb-4">Kirjaudu sisään</h1>

            <div className="mb-4 relative">
                {/*<UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />*/}
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
                className="w-full bg-sky-600 text-white p-2 hover:bg-zinc-600"
            >
                Kirjaudu
            </button>
        </form>
    );
}