import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import api from "../../lib/api";

export default function Analytics() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchAnalytics();
  }, [id]);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get(`/api/analytics/${id}`);
      setData(res.data);
    } catch (err) {
      if (err.response?.status === 401) router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const chartData =
    data?.clicksByDay.map((d) => ({
      date: new Date(d.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      clicks: d.clicks,
    })) || [];

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
      gap: "16px",
      boxShadow: "0 1px 3px rgba(102,126,234,0.08)",
    },
    logo: {
      fontSize: "22px",
      fontWeight: "800",
      background: "linear-gradient(135deg,#667eea,#764ba2)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    card: {
      background: "white",
      borderRadius: "16px",
      border: "1px solid #ede9fe",
      padding: "24px",
      boxShadow: "0 1px 3px rgba(102,126,234,0.08)",
    },
  };

  if (loading)
    return (
      <div
        style={{
          ...s.page,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
          <p style={{ color: "#6b7280", fontSize: "15px" }}>
            Loading analytics...
          </p>
        </div>
      </div>
    );

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            background: "none",
            border: "1px solid #ede9fe",
            padding: "8px 14px",
            borderRadius: "8px",
            fontSize: "13px",
            color: "#667eea",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          ← Back
        </button>
        <div style={s.logo}>LinkForge</div>
        <span style={{ fontSize: "13px", color: "#9ca3af" }}>Analytics</span>
      </nav>

      <div
        style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 24px" }}
      >
        <div
          style={{
            ...s.card,
            marginBottom: "20px",
            background: "linear-gradient(135deg,#667eea,#764ba2)",
            border: "none",
            color: "white",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              opacity: 0.8,
              marginBottom: "6px",
              fontWeight: "500",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Short URL
          </p>
          <p
            style={{
              fontFamily: "monospace",
              fontSize: "20px",
              fontWeight: "700",
              marginBottom: "6px",
            }}
          >
            localhost:8000/{data?.url.short_code}
          </p>
          <p
            style={{
              fontSize: "13px",
              opacity: 0.75,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            → {data?.url.original_url}
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          {[
            {
              icon: "👆",
              label: "Total clicks",
              value: data?.totalClicks,
              color: "#667eea",
            },
            {
              icon: "📅",
              label: "Created",
              value: new Date(data?.url.created_at).toLocaleDateString(),
              color: "#764ba2",
            },
            {
              icon: "⏰",
              label: "Expires",
              value: data?.url.expires_at
                ? new Date(data.url.expires_at).toLocaleDateString()
                : "Never",
              color: "#10b981",
            },
          ].map((stat) => (
            <div key={stat.label} style={s.card}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>
                {stat.icon}
              </div>
              <div
                style={{
                  fontSize: "26px",
                  fontWeight: "700",
                  color: stat.color,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div style={s.card}>
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "700",
              color: "#1a1a2e",
              marginBottom: "24px",
            }}
          >
            📈 Clicks over time — last 30 days
          </h3>
          {chartData.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>📭</div>
              <p style={{ color: "#6b7280", fontSize: "14px" }}>
                No clicks yet. Share your link to start tracking.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#667eea" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f0ff" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 13,
                    borderRadius: 10,
                    border: "1px solid #ede9fe",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stroke="#667eea"
                  strokeWidth={2.5}
                  fill="url(#colorClicks)"
                  dot={{ r: 4, fill: "#667eea", strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#764ba2" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
