import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
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
            fontSize: "24px",
            padding: "40px",
            textAlign: "center",
            minHeight: "100vh",
          }}
        >
          <strong>APP ERROR:</strong>{" "}
          {this.state.error?.message || "Unknown error"}
          <br />
          <br />
          <small style={{ fontSize: "14px", wordBreak: "break-all" }}>
            {this.state.error?.stack?.slice(0, 400)}
          </small>
        </div>
      );
    }
    return this.props.children;
  }
}
