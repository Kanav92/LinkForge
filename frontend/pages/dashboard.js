import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import api from "../lib/api";

export default function Dashboard() {
  const router = useRouter();
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    originalUrl: "",
    alias: "",
    expiresAt: "",
  });
  const [formError, setFormError] = useState("");
  const [copied, setCopied] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (!token) {
      router.push("/login");
      return;
    }
    if (u) setUser(JSON.parse(u));
    fetchUrls();
  }, []);

  const fetchUrls = async (q = "") => {
    try {
      const res = await api.get(`/api/urls${q ? `?search=${q}` : ""}`);
      setUrls(res.data);
    } catch (err) {
      if (err.response?.status === 401) router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      const body = { originalUrl: form.originalUrl };
      if (form.alias) body.alias = form.alias;
      if (form.expiresAt)
        body.expiresAt = new Date(form.expiresAt).toISOString();
      await api.post("/api/urls", body);
      setForm({ originalUrl: "", alias: "", expiresAt: "" });
      setShowForm(false);
      fetchUrls();
    } catch (err) {
      setFormError(err.response?.data?.error || "Failed to create URL");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this URL?")) return;
    await api.delete(`/api/urls/${id}`);
    fetchUrls();
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(`http://localhost:8000/${code}`);
    setCopied(code);
    setTimeout(() => setCopied(""), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const filtered = urls.filter(
    (u) =>
      u.original_url.toLowerCase().includes(search.toLowerCase()) ||
      u.short_code.toLowerCase().includes(search.toLowerCase()),
  );

  const totalClicks = urls.reduce((sum, u) => sum + (u.click_count || 0), 0);

  const s = {
    page: {
      minHeight: "100vh",
      background: "#f8f7ff",
      fontFamily: "'Inter',sans-serif",
    },
    nav: {
      background: "white",
      borderBottom: "1px solid #ede9fe",
      padding: "0 32px",
      height: "64px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 10,
      boxShadow: "0 1px 3px rgba(102,126,234,0.08)",
    },
    logo: {
      fontSize: "22px",
      fontWeight: "800",
      background: "linear-gradient(135deg,#667eea,#764ba2)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    btn: {
      background: "linear-gradient(135deg,#667eea,#764ba2)",
      color: "white",
      border: "none",
      padding: "9px 20px",
      borderRadius: "10px",
      fontSize: "13px",
      fontWeight: "600",
      cursor: "pointer",
    },
    card: {
      background: "white",
      borderRadius: "16px",
      border: "1px solid #ede9fe",
      padding: "24px",
      boxShadow: "0 1px 3px rgba(102,126,234,0.08)",
    },
  };

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <div style={s.logo}>LinkForge</div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {user && (
            <span style={{ fontSize: "13px", color: "#6b7280" }}>
              👋 {user.email}
            </span>
          )}
          <button onClick={() => setShowForm(!showForm)} style={s.btn}>
            + New URL
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "1px solid #e5e7eb",
              padding: "8px 16px",
              borderRadius: "10px",
              fontSize: "13px",
              color: "#6b7280",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div
        style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 24px" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: "16px",
            marginBottom: "28px",
          }}
        >
          {[
            {
              label: "Total Links",
              value: urls.length,
              icon: "🔗",
              color: "#667eea",
            },
            {
              label: "Total Clicks",
              value: totalClicks,
              icon: "👆",
              color: "#764ba2",
            },
            {
              label: "Active Links",
              value: urls.filter(
                (u) => !u.expires_at || new Date(u.expires_at) > new Date(),
              ).length,
              icon: "✅",
              color: "#10b981",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                ...s.card,
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div style={{ fontSize: "32px" }}>{stat.icon}</div>
              <div>
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "700",
                    color: stat.color,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#9ca3af",
                    marginTop: "2px",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {showForm && (
          <div
            style={{
              ...s.card,
              marginBottom: "24px",
              border: "1.5px solid #c4b5fd",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "#1a1a2e",
                marginBottom: "16px",
              }}
            >
              🔗 Shorten a new URL
            </h3>
            {formError && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#dc2626",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  marginBottom: "14px",
                }}
              >
                {formError}
              </div>
            )}
            <form onSubmit={handleCreate}>
              <input
                type="url"
                placeholder="https://your-very-long-url.com/that/needs/shortening"
                value={form.originalUrl}
                onChange={(e) =>
                  setForm({ ...form, originalUrl: e.target.value })
                }
                required
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: "10px",
                  border: "1.5px solid #e5e7eb",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                  marginBottom: "12px",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <input
                  type="text"
                  placeholder="Custom alias (optional)"
                  value={form.alias}
                  onChange={(e) => setForm({ ...form, alias: e.target.value })}
                  style={{
                    padding: "11px 14px",
                    borderRadius: "10px",
                    border: "1.5px solid #e5e7eb",
                    fontSize: "14px",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
                <input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(e) =>
                    setForm({ ...form, expiresAt: e.target.value })
                  }
                  style={{
                    padding: "11px 14px",
                    borderRadius: "10px",
                    border: "1.5px solid #e5e7eb",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit" style={s.btn}>
                  Shorten URL
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    background: "none",
                    border: "1px solid #e5e7eb",
                    padding: "9px 18px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    color: "#6b7280",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div style={s.card}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <h3
              style={{ fontSize: "16px", fontWeight: "700", color: "#1a1a2e" }}
            >
              Your URLs
            </h3>
            <input
              type="text"
              placeholder="🔍 Search URLs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: "8px 14px",
                borderRadius: "10px",
                border: "1.5px solid #e5e7eb",
                fontSize: "13px",
                outline: "none",
                width: "220px",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#667eea")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
          </div>

          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "48px",
                color: "#9ca3af",
                fontSize: "14px",
              }}
            >
              Loading your URLs...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔗</div>
              <p
                style={{
                  color: "#6b7280",
                  fontSize: "15px",
                  fontWeight: "500",
                }}
              >
                No URLs yet
              </p>
              <p
                style={{ color: "#9ca3af", fontSize: "13px", marginTop: "4px" }}
              >
                Click "+ New URL" to shorten your first link
              </p>
            </div>
          ) : (
            <div>
              {filtered.map((url, i) => (
                <div
                  key={url.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "16px 0",
                    borderBottom:
                      i < filtered.length - 1 ? "1px solid #f3f0ff" : "none",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg,#667eea20,#764ba220)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                      flexShrink: 0,
                    }}
                  >
                    🔗
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "4px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          color: "#667eea",
                          fontFamily: "monospace",
                          fontSize: "14px",
                          fontWeight: "600",
                        }}
                      >
                        localhost:8000/{url.short_code}
                      </span>
                      {url.is_custom && (
                        <span
                          style={{
                            background: "#ede9fe",
                            color: "#7c3aed",
                            fontSize: "11px",
                            padding: "2px 8px",
                            borderRadius: "20px",
                            fontWeight: "600",
                          }}
                        >
                          custom
                        </span>
                      )}
                      {url.expires_at &&
                        new Date(url.expires_at) < new Date() && (
                          <span
                            style={{
                              background: "#fef2f2",
                              color: "#dc2626",
                              fontSize: "11px",
                              padding: "2px 8px",
                              borderRadius: "20px",
                              fontWeight: "600",
                            }}
                          >
                            expired
                          </span>
                        )}
                    </div>
                    <p
                      style={{
                        color: "#9ca3af",
                        fontSize: "12px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "400px",
                      }}
                    >
                      {url.original_url}
                    </p>
                    <p
                      style={{
                        color: "#c4b5fd",
                        fontSize: "11px",
                        marginTop: "3px",
                        fontWeight: "500",
                      }}
                    >
                      👆 {url.click_count} clicks · 📅{" "}
                      {new Date(url.created_at).toLocaleDateString()}
                      {url.expires_at &&
                        ` · ⏰ expires ${new Date(url.expires_at).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                    <button
                      onClick={() => handleCopy(url.short_code)}
                      style={{
                        padding: "7px 14px",
                        borderRadius: "8px",
                        border: "1px solid #ede9fe",
                        background:
                          copied === url.short_code ? "#ede9fe" : "white",
                        color:
                          copied === url.short_code ? "#7c3aed" : "#6b7280",
                        fontSize: "12px",
                        fontWeight: "500",
                        cursor: "pointer",
                      }}
                    >
                      {copied === url.short_code ? "✓ Copied" : "Copy"}
                    </button>
                    <button
                      onClick={() => router.push(`/analytics/${url.id}`)}
                      style={{
                        padding: "7px 14px",
                        borderRadius: "8px",
                        border: "1px solid #ede9fe",
                        background: "white",
                        color: "#667eea",
                        fontSize: "12px",
                        fontWeight: "500",
                        cursor: "pointer",
                      }}
                    >
                      Analytics
                    </button>
                    <button
                      onClick={() => handleDelete(url.id)}
                      style={{
                        padding: "7px 14px",
                        borderRadius: "8px",
                        border: "1px solid #fee2e2",
                        background: "white",
                        color: "#ef4444",
                        fontSize: "12px",
                        fontWeight: "500",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
