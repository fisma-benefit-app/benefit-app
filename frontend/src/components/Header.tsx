import useAppUser from "../hooks/useAppUser";
import { Link, useNavigate } from "react-router";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faPenToSquare, faHome } from '@fortawesome/free-solid-svg-icons';

const Header = () => {

  const navigate = useNavigate();
  const { appUser, loggedIn, setAppUser, setLoggedIn, setSessionToken } = useAppUser();

  const logout = () => {
    sessionStorage.removeItem("loginToken");
    sessionStorage.removeItem("userInfo");
    setSessionToken(null);
    setAppUser(null);
    setLoggedIn(false);
    //TODO: Notify backend about logging out!
  }

  //TODO: Save before redirecting or logging out?
  return (
    <header className="fixed top-0 w-full bg-fisma-blue text-white flex ">
      <Link to="/">
        <img src="../Fisma_logo.png" alt="FISMA Logo" className="h-15 w-auto mb-2 ml-10 hover:brightness-90" />
      </Link>
      <div className='absolute top-0 right-0 h-full flex items-center'>
        {loggedIn &&
          <>
            <button className='h-full text-lg px-5 bg-fisma-chathams-blue hover:bg-fisma-gray' onClick={() => navigate("/")}>
              <FontAwesomeIcon icon={faHome}/>
            </button>
            <button className='h-full text-lg px-5 bg-fisma-dark-blue hover:bg-fisma-gray'>
              <FontAwesomeIcon icon={faPenToSquare}/>
            </button>
            <button className='h-full text-lg px-5 bg-fisma-blue hover:bg-fisma-red' onClick={logout}>
              Kirjaudu ulos
              <FontAwesomeIcon icon={faUser} className="ml-2 mr-2" />
              ( {appUser?.username} )
            </button>
          </>
        }
      </div>
    </header>
  )
}

export default Header