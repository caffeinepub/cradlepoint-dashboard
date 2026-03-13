const AUTH_KEY = "cp_auth_v1";

export function validateCredentials(
  username: string,
  password: string,
): boolean {
  return username.toLowerCase() === "admin" && password === "Adams2014!";
}

export function isLoggedIn(): boolean {
  try {
    return localStorage.getItem(AUTH_KEY) === "true";
  } catch {
    return false;
  }
}

export function setLoggedIn(value: boolean): void {
  try {
    if (value) {
      localStorage.setItem(AUTH_KEY, "true");
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  } catch {
    // ignore
  }
}

export function getCredentials(): { username: string; password: string } {
  return { username: "Admin", password: "Adams2014!" };
}
