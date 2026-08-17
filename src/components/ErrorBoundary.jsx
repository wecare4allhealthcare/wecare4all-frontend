import { Component } from "react";

/**
 * ErrorBoundary — the app had NO error boundary anywhere, on any page.
 * When a component threw during render (a null token used before
 * localStorage/auth state settled right after login, an admin-dashboard
 * sub-tab reading data that hadn't arrived yet, etc.) React silently
 * unmounted the whole tree — producing exactly the "totally blank page,
 * only fixed by a manual refresh" symptom reported across the admin
 * dashboard and other pages. A full reload "fixed" it only because the
 * second run no longer hit that first-render race.
 *
 * This doesn't chase down every individual race by itself, but it turns
 * every one of those into a visible, recoverable screen with a single
 * "Try again" click (re-mounts the subtree) instead of a dead white page,
 * and logs the real error to the console so it's traceable.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary] caught:", error, info?.componentStack);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{
        minHeight: "70vh", display: "flex", alignItems: "center",
        justifyContent: "center", padding: "24px", background: "#f0f6fc",
      }}>
        <div style={{
          maxWidth: "440px", textAlign: "center", background: "#fff",
          borderRadius: "16px", padding: "36px 30px",
          boxShadow: "0 20px 50px rgba(18,59,74,.12)",
        }}>
          <div style={{ fontSize: "34px", marginBottom: "12px" }}>⚠️</div>
          <h2 style={{
            fontFamily: "'Manrope',sans-serif", fontSize: "22px",
            fontWeight: 700, color: "var(--wc-navy)", margin: "0 0 8px",
          }}>
            Something went wrong loading this page
          </h2>
          <p style={{
            fontFamily: "'Inter',sans-serif", fontSize: "13.5px",
            color: "var(--wc-muted)", margin: "0 0 22px", lineHeight: 1.6,
          }}>
            This is usually a temporary hiccup. Try again — if it keeps
            happening, a full refresh will fix it.
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <button onClick={this.reset} style={{
              padding: "10px 22px", borderRadius: "9px", border: "none",
              background: "linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))",
              color: "#fff", fontFamily: "'Inter',sans-serif",
              fontWeight: 700, fontSize: "13.5px", cursor: "pointer",
            }}>
              Try again
            </button>
            <button onClick={() => window.location.reload()} style={{
              padding: "10px 22px", borderRadius: "9px",
              border: "1.5px solid var(--wc-border)", background: "var(--wc-warm-white)",
              color: "#374151", fontFamily: "'Inter',sans-serif",
              fontWeight: 700, fontSize: "13.5px", cursor: "pointer",
            }}>
              Refresh page
            </button>
          </div>
        </div>
      </div>
    );
  }
}
