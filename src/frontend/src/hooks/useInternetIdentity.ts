/**
 * DISABLED STUB — Internet Identity is NOT used in this app.
 *
 * This file exists only to prevent import errors from any stale
 * references. If anything calls useInternetIdentity() or renders
 * <InternetIdentityProvider>, it will throw a visible error
 * instead of causing a silent blank screen.
 *
 * DO NOT restore the original implementation.
 * DO NOT use this hook or provider anywhere in the app.
 */

export function useInternetIdentity(): never {
  throw new Error(
    "PROVIDER CONFLICT DETECTED: useInternetIdentity() was called, " +
      "but this app uses custom username/password auth (AuthProvider) only. " +
      "Remove all calls to useInternetIdentity() and InternetIdentityProvider.",
  );
}

export function InternetIdentityProvider(_props: {
  children: React.ReactNode;
}): never {
  throw new Error(
    "PROVIDER CONFLICT DETECTED: InternetIdentityProvider was rendered, " +
      "but this app uses AuthProvider only. " +
      "Remove InternetIdentityProvider from main.tsx.",
  );
}
