// Login storage shared by all tabs (localStorage), so a new tab is already
// logged in and logging out in one tab is seen by the others.
//
// Keys are prefixed with the deployment's base path. The two testing
// frontends (/benefit-app-testing/testing/ and /benefit-app-testing/scalingo-testing/)
// share one GitHub Pages origin, so without the prefix they would read each
// other's login (#679).
const PREFIX = import.meta.env.BASE_URL;

export const TOKEN_KEY = `${PREFIX}loginToken`;
const USER_INFO_KEY = `${PREFIX}userInfo`;
const USER_ID_KEY = `${PREFIX}userId`;

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  getUserInfo: () => localStorage.getItem(USER_INFO_KEY),
  getUserId: () => localStorage.getItem(USER_ID_KEY),

  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),

  setLogin: (token: string, username: string, userId?: number) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_INFO_KEY, username);
    if (userId != null) {
      localStorage.setItem(USER_ID_KEY, userId.toString());
    }
  },

  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_INFO_KEY);
    localStorage.removeItem(USER_ID_KEY);
  },
};
