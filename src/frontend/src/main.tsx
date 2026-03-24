import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";
// IMPORTANT: This file must ALWAYS use AuthProvider, NEVER InternetIdentityProvider.
// The app uses username/password auth only. Do not import useInternetIdentity.

BigInt.prototype.toJSON = function () {
  return this.toString();
};

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            background: "red",
            color: "white",
            fontSize: "30px",
            padding: "40px",
            textAlign: "center",
            minHeight: "100vh",
          }}
        >
          APP ERROR: {this.state.error?.message || "Unknown error"}
          <br />
          <br />
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("cp_auth_v1");
              window.location.reload();
            }}
            style={{
              fontSize: "20px",
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            Clear Session &amp; Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </AuthProvider>
  </QueryClientProvider>,
);
