import useAppUser from "../hooks/useAppUser";

const Header = () => {

  const { appUser, loggedIn, setAppUser, setLoggedIn, setSessionToken } = useAppUser();

  const logout = () => {
    sessionStorage.removeItem("loginToken");
    sessionStorage.removeItem("userInfo");
    setSessionToken(null);
    setAppUser(null);
    setLoggedIn(false);
    //TODO: Information about logging out? 
  }

  return (
    <header className="fixed top-0 w-full bg-sky-600 text-white flex ">
      <img src="../../public/Fisma_logo.png" alt="FISMA Logo" className="h-15 w-auto mb-2 ml-2" />
      <h1 className="text-lg flex items-end pb-1.5">Toimintopistelaskuri</h1>
      <div className='absolute top-0 right-0 h-full flex items-center'>
        {loggedIn &&
          <>
            <button className='h-full text-lg px-10 hover:bg-zinc-600'>{appUser?.username}</button>
            <button className='h-full text-lg px-10 hover:bg-zinc-600'>Projektit</button>
            <button className='h-full text-lg px-10 hover:bg-zinc-600'>TP-laskuri</button>
            <button className='h-full text-lg px-10 hover:bg-zinc-600' onClick={logout}>Kirjaudu ulos</button>
          </>
        }
      </div>
    </header>
  )
}

export default Header