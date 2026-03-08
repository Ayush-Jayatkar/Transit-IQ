import React from "react";

export default function Footer() {
  return (
    <footer
      style={{
        background: "#ffffff",
        padding: "24px 48px",
        textAlign: "center",
        borderTop: "1px solid rgba(15,40,90,0.08)",
        fontSize: 12,
        color: "#4a5f80",
        fontFamily: "Inter, sans-serif",
      }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <span>© {new Date().getFullYear()} Transit‑IQ · PMPML Pune</span>
        <span style={{ margin: "0 8px" }}>•</span>
        <a href="#" style={{ color: "#1a6cf5", textDecoration: "none" }}>
          Privacy
        </a>
        <span style={{ margin: "0 8px" }}>•</span>
        <a href="#" style={{ color: "#1a6cf5", textDecoration: "none" }}>
          Terms
        </a>
        <div style={{ marginTop: 8 }}>Built with ❤️ by Sync</div>
      </div>
    </footer>
  );
}
