import { createContext, useContext, useMemo } from "react";
import { useLocalStorage } from "../utilities/useLocalStorage";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useLocalStorage("user", null);

  // call this function when you want to authenticate the user
  const Login = async (email, password) => {
    // TODO: actually authentication user, for now just let it pass if email contains "admin@intncity.com" and password is "admin"
    console.log(`login user: ${email}, ${password}`);
    let authenticated = (email === "admin@intncity.com" || email === "admin@intn.city") && password === "IntnCity2@22";
    if (authenticated) {
      setUser(email);
      return true;
    } else {
      return false;
    }
  };

  // call this function to sign out logged in user
  const Logout = () => {
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      Login,
      Logout
    }),
    [user]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};