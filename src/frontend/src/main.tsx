import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// ============================================================
// CRITICAL: This file MUST use AuthProvider from context/AuthContext.
// NEVER replace AuthProvider with InternetIdentityProvider here.
// Doing so breaks ALL logins because App.tsx reads AuthContext,
// not InternetIdentityContext. This comment must stay forever.
// ============================================================
import ReactDOM from "react-dom/client";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      {/* AuthProvider MUST wrap App — never swap this for InternetIdentityProvider */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>,
);
