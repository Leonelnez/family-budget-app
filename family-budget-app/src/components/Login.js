// src/components/Login.js
import React from "react";

const COLORS = {
  Leonel: "#1F3864",
  Mpofu:  "#0070C0",
  Leroy:  "#7030A0",
  Mom:    "#C00000",
};

export default function Login({ members, onSelect }) {
  return (
    <div className="login-screen">
      <div className="login-logo">🏠</div>
      <div className="login-title">Family Budget</div>
      <div className="login-sub">Nezira FamilY</div>
      <div className="login-label">WHO ARE YOU?</div>
      <div className="login-grid">
        {members.map(m => (
          <button key={m} className="login-btn" onClick={() => onSelect(m)}>
            <div
              className="login-btn-initial"
              style={{ background: COLORS[m] || "#1F3864" }}
            >
              {m[0]}
            </div>
            <div className="login-btn-name">{m}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
