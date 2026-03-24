// THIS FILE IS INTENTIONALLY DISABLED.
// The app uses username/password auth only — not Internet Identity.
// Any import of this file will cause a runtime error to prevent silent failures.

import type { ReactNode } from "react";

export function useInternetIdentity(): never {
  throw new Error(
    "useInternetIdentity is disabled. Use useAuth() from @/hooks/useAuth instead.",
  );
}

// biome-ignore lint/correctness/noUnusedVariables: intentional stub
export function InternetIdentityProvider(_props: {
  children: ReactNode;
}): ReactNode {
  throw new Error(
    "InternetIdentityProvider is disabled. Use AuthProvider from @/context/AuthContext instead.",
  );
}
