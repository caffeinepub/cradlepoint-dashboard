import { isLoggedIn, setLoggedIn, validateCredentials } from "@/lib/auth";
import { createContext, useCallback, useState } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  username: string;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  username: "",
  login: () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    isLoggedIn(),
  );

  const login = useCallback((username: string, password: string): boolean => {
    if (validateCredentials(username, password)) {
      setLoggedIn(true);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setLoggedIn(false);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, username: "Admin", login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
