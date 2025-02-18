import useAppUser from "../hooks/useAppUser"

const Header = () => {

  const { appUser, loggedIn, setAppUser, setLoggedIn, setSessionToken } = useAppUser();

  const logout = () => {
    sessionStorage.removeItem("loginToken");
    sessionStorage.removeItem("userInfo");
    setSessionToken(null);
    setAppUser(null);
    setLoggedIn(false);
    //automatically navigates to login page due to routing logic see app.tsx
  }

  return (
    <header className="fixed top-0 w-full bg-sky-600 text-white shadow-md flex items-stretch z-1">
      {/* FISMA Logo on the upper left*/}
      <img src="/Fisma_logo.png" alt="FISMA Logo" className="h-15 w-auto mb-2 ml-2" />
      <h1 className="text-lg flex items-end pb-1.5">Toimintopistelaskuri</h1>
      <div className='absolute top-0 right-0 h-full flex items-center'>
        <button className='h-full text-lg px-10 hover:bg-zinc-600 flex items-center'>{appUser?.username}</button>
        {loggedIn &&
          <>
            <button className='h-full text-lg px-10 hover:bg-zinc-600 flex items-center' onClick={logout}>Kirjaudu ulos</button>
            <button className='h-full text-lg px-10 hover:bg-zinc-600 flex items-center'>Projektit</button>
            <button className='h-full text-lg px-10 hover:bg-zinc-600 flex items-center'>TP-laskuri</button>
          </>
        }
      </div>
    </header>
  )
}

export default Header