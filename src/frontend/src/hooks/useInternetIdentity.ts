// ============================================================
// DISABLED — Internet Identity is NOT used in this app.
// This app uses simple username/password auth via AuthContext.
// Any call to useInternetIdentity will throw at runtime.
// ============================================================

export function useInternetIdentity(): never {
  throw new Error(
    "[DISABLED] useInternetIdentity is not used in this app. " +
      "Use useContext(AuthContext) from context/AuthContext instead.",
  );
}

// InternetIdentityProvider stub — throws if anything tries to use it
export function InternetIdentityProvider(_props: {
  children: React.ReactNode;
}): never {
  throw new Error(
    "[DISABLED] InternetIdentityProvider is not used in this app. " +
      "Use AuthProvider from context/AuthContext instead.",
  );
}
