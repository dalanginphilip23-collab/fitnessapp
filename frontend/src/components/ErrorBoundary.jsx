import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error("[ErrorBoundary]", error, info);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) this.props.onReset();
    else window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          style={{
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            textAlign: "center",
            background: "var(--bg-primary)",
            color: "var(--text-primary)",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "var(--accent-bg)",
              border: "1px solid var(--accent-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <span className="material-symbols-outlined" style={{ color: "var(--accent)" }}>
              error
            </span>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Something went wrong</h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", maxWidth: 360, marginBottom: 16 }}>
            {this.state.error?.message || "An unexpected error occurred. Please try again."}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            style={{
              padding: "10px 20px",
              borderRadius: 999,
              border: "none",
              background: "var(--accent)",
              color: "#0e0e0e",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
