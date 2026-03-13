import { isLoggedIn, setLoggedIn, validateCredentials } from "@/lib/auth";
import { useCallback, useState } from "react";

export function useAuth() {
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

  return { isAuthenticated, username: "Admin", login, logout };
}
