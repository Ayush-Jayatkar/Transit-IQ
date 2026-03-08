import React from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer.jsx";

const stats = [
  { value: "2.5M", label: "Daily Commuters", icon: "👥" },
  { value: "2,100+", label: "PMPML Buses", icon: "🚌" },
  { value: "500+", label: "Routes Covered", icon: "🗺️" },
  { value: "₹0", label: "Tool Cost", icon: "💰" },
];

const features = [
  {
    icon: "🧠",
    title: "Demand Forecasting",
    desc: "Facebook Prophet predicts passenger demand per route per 15-minute slot — up to 4 hours ahead.",
  },
  {
    icon: "⚡",
    title: "Fleet Optimization",
    desc: "Google OR-Tools computes optimal bus frequency per route based on live demand signals.",
  },
  {
    icon: "🌧️",
    title: "Rain-to-Bus Model",
    desc: "Pune-specific: rain forecast shifts 2-wheeler commuters to buses — system pre-positions fleet.",
  },
  {
    icon: "🎭",
    title: "Event-Aware AI",
    desc: "Ganpati, IPL, college exams — model integrates Pune event calendar as input features.",
  },
  {
    icon: "🔍",
    title: "Anomaly Detection",
    desc: "IsolationForest flags routes deviating >30% from forecast for immediate operator review.",
  },
  {
    icon: "🗺️",
    title: "Multi-Modal Planner",
    desc: "Bus + Metro + Yulu treated as one unified network for seamless journey planning.",
  },
];

// footer component will handle any branding links etc. (no tech stack here)

export default function LandingPage() {
  return (
    <div
      style={{
        height: "100vh",
        overflowY: "auto",
        overflowX: "hidden",
        background: "#f0f4f9",
        fontFamily: "Inter, sans-serif",
      }}>
      {/* Nav */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 48px",
          height: 64,
          background: "#ffffff",
          borderBottom: "1px solid rgba(15,40,90,0.10)",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 2px 12px rgba(15,40,90,0.07)",
        }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              fontSize: 20,
              fontFamily: "Orbitron, sans-serif",
              fontWeight: 900,
              color: "#1a6cf5",
              letterSpacing: "0.04em",
            }}>
            TRANSIT-IQ
          </span>
          <span
            style={{
              fontSize: 10,
              color: "#1a6cf5",
              fontWeight: 700,
              letterSpacing: "0.12em",
              padding: "3px 9px",
              background: "#e8f0fe",
              border: "1px solid rgba(26,108,245,0.25)",
              borderRadius: 5,
            }}>
            BlueBit 4.0 · PS4
          </span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link to="/operator">
            <button className="btn btn-ghost">🛰️ Operator</button>
          </Link>
          <Link to="/passenger">
            <button className="btn btn-primary">🚌 Passenger App</button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          background:
            "linear-gradient(135deg, #1a6cf5 0%, #0f4bb0 60%, #6c3acb 100%)",
          padding: "80px 48px 72px",
          textAlign: "center",
          color: "#fff",
        }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 28,
            padding: "6px 16px",
            background: "rgba(255,255,255,0.18)",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: 99,
          }}>
          <span className="live-dot" style={{ background: "#6fffb8" }} />
          <span style={{ fontSize: 12, fontWeight: 600 }}>
            Live Demo — Pune Transit Intelligence
          </span>
        </div>

        <h1
          style={{
            fontSize: "clamp(34px,5vw,64px)",
            fontWeight: 900,
            lineHeight: 1.1,
            fontFamily: "Orbitron, sans-serif",
            marginBottom: 24,
            letterSpacing: "0.01em",
          }}>
          Intelligent Brain
          <br />
          for Pune's Buses
        </h1>

        <p
          style={{
            fontSize: 17,
            lineHeight: 1.75,
            maxWidth: 650,
            margin: "0 auto 40px",
            color: "rgba(255,255,255,0.85)",
          }}>
          Every morning,{" "}
          <strong style={{ color: "#fff" }}>2.5 million Pune commuters</strong>{" "}
          don't know if their bus is 5 minutes away or 45. Transit-IQ changes
          that — with ML demand forecasting, OR-Tools fleet optimization, and
          real-time operator intelligence.
        </p>

        <div
          style={{
            display: "flex",
            gap: 14,
            justifyContent: "center",
            flexWrap: "wrap",
          }}>
          <Link to="/operator">
            <button
              style={{
                padding: "14px 34px",
                fontSize: 15,
                fontWeight: 700,
                background: "#fff",
                color: "#1a6cf5",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-2px)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}>
              🛰️ Open Operator Dashboard
            </button>
          </Link>
          <Link to="/passenger">
            <button
              style={{
                padding: "14px 34px",
                fontSize: 15,
                fontWeight: 700,
                background: "rgba(255,255,255,0.18)",
                color: "#fff",
                borderRadius: 10,
                border: "2px solid rgba(255,255,255,0.45)",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.28)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.18)")
              }>
              🚌 Plan My Journey
            </button>
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 20,
          padding: "52px 48px 40px",
          flexWrap: "wrap",
          maxWidth: 900,
          margin: "0 auto",
        }}>
        {stats.map((s) => (
          <div
            key={s.label}
            className="metric-card"
            style={{
              minWidth: 170,
              alignItems: "center",
              textAlign: "center",
              gap: 6,
              flex: 1,
            }}>
            <span style={{ fontSize: 30 }}>{s.icon}</span>
            <span className="metric-value">{s.value}</span>
            <span className="metric-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* Features */}
      <section
        style={{ padding: "0 48px 60px", maxWidth: 1100, margin: "0 auto" }}>
        <h2
          style={{
            textAlign: "center",
            fontSize: 26,
            fontWeight: 800,
            color: "#0d1b3e",
            marginBottom: 32,
          }}>
          What Makes Transit-IQ Different
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 16,
          }}>
          {features.map((f) => (
            <div
              key={f.title}
              className="metric-card"
              style={{ padding: "22px 20px", gap: 10 }}>
              <span style={{ fontSize: 28 }}>{f.icon}</span>
              <strong style={{ fontSize: 14, color: "#1a6cf5" }}>
                {f.title}
              </strong>
              <span
                style={{ fontSize: 13, color: "#4a5f80", lineHeight: 1.65 }}>
                {f.desc}
              </span>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
