import { useState } from "react";
import { useRouter } from "next/router";
import api from "../lib/api";

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/api/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      router.push("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        fontFamily: "'Inter',sans-serif",
      }}
    >
      <div
        style={{
          flex: 1,
          background: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "60px",
          color: "white",
        }}
      >
        <div
          style={{
            fontSize: "42px",
            fontWeight: "800",
            letterSpacing: "-1px",
            marginBottom: "16px",
          }}
        >
          Link<span style={{ color: "#a78bfa" }}>Forge</span>
        </div>
        <p
          style={{
            fontSize: "20px",
            fontWeight: "300",
            opacity: 0.9,
            textAlign: "center",
            lineHeight: 1.6,
            maxWidth: "320px",
          }}
        >
          Shorten, share and track your links with powerful analytics
        </p>
        <div
          style={{
            marginTop: "48px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            width: "100%",
            maxWidth: "320px",
          }}
        >
          {[
            "⚡ Instant URL shortening",
            "📊 Real-time click analytics",
            "🔒 Secure with JWT auth",
            "🚀 Redis-powered fast redirects",
          ].map((f) => (
            <div
              key={f}
              style={{
                background: "rgba(255,255,255,0.15)",
                borderRadius: "12px",
                padding: "12px 16px",
                fontSize: "14px",
                backdropFilter: "blur(10px)",
              }}
            >
              {f}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fafafa",
          padding: "40px",
        }}
      >
        <div style={{ width: "100%", maxWidth: "420px" }}>
          <h2
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#1a1a2e",
              marginBottom: "8px",
            }}
          >
            Welcome back 👋
          </h2>
          <p
            style={{ color: "#6b7280", fontSize: "15px", marginBottom: "32px" }}
          >
            Sign in to your LinkForge account
          </p>

          {error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#dc2626",
                padding: "12px 16px",
                borderRadius: "10px",
                fontSize: "14px",
                marginBottom: "20px",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "6px",
                }}
              >
                Email address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: "1.5px solid #e5e7eb",
                  fontSize: "14px",
                  outline: "none",
                  background: "white",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
            </div>
            <div style={{ marginBottom: "28px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "6px",
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: "1.5px solid #e5e7eb",
                  fontSize: "14px",
                  outline: "none",
                  background: "white",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px",
                background: "linear-gradient(135deg,#667eea,#764ba2)",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: "pointer",
                opacity: loading ? 0.7 : 1,
                transition: "transform 0.1s",
              }}
              onMouseDown={(e) => (e.target.style.transform = "scale(0.98)")}
              onMouseUp={(e) => (e.target.style.transform = "scale(1)")}
            >
              {loading ? "Signing in..." : "Sign in →"}
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              marginTop: "24px",
              fontSize: "14px",
              color: "#6b7280",
            }}
          >
            No account?{" "}
            <a
              href="/register"
              style={{
                color: "#667eea",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              Create one free
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
