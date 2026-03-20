import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { InternetIdentityProvider } from "./hooks/useInternetIdentity";
import "./index.css";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            color: "red",
            fontSize: "24px",
            padding: "30px",
            textAlign: "center",
            fontFamily: "sans-serif",
          }}
        >
          <strong>APP ERROR:</strong>{" "}
          {this.state.error.message || "Unknown error"}
        </div>
      );
    }
    return this.props.children;
  }
}

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <InternetIdentityProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </InternetIdentityProvider>
    </QueryClientProvider>
  </ErrorBoundary>,
);
