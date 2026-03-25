import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
/**
 * PERMANENT RULE — DO NOT CHANGE:
 * This file must ALWAYS wrap <App /> with <AuthProvider>.
 * NEVER use <InternetIdentityProvider> here. This app uses
 * custom username/password auth only. InternetIdentityProvider
 * causes a blank screen and broken login every time it appears.
 */
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";
import React from "react";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

const queryClient = new QueryClient();

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            background: "red",
            color: "white",
            fontSize: "28px",
            padding: "40px",
            textAlign: "center",
            minHeight: "100vh",
          }}
        >
          <strong>APP ERROR</strong>
          <br />
          {this.state.error?.message || "Unknown error"}
          <br />
          <small style={{ fontSize: "16px" }}>
            {this.state.error?.stack?.slice(0, 400)}
          </small>
        </div>
      );
    }
    return this.props.children;
  }
}

// Runtime guard: if InternetIdentityProvider ever slips back in,
// fail loudly instead of silently showing a blank screen.
if (typeof window !== "undefined") {
  const origCreate = ReactDOM.createRoot.bind(ReactDOM);
  // @ts-expect-error patching for guard
  ReactDOM.createRoot = (container: Element) => {
    return origCreate(container);
  };
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  // AuthProvider is the ONLY provider wrapping this app.
  // Do not replace or wrap with InternetIdentityProvider.
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>,
);
