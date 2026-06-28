// src/components/Login.js
import React, { useState } from "react";
import { ADMIN_PIN } from "../data/useStore";

const COLORS = {
  Leonel: "#1F3864",
  Mpofu:  "#0070C0",
  Leroy:  "#7030A0",
  Mom:    "#C00000",
};

export default function Login({ members, onSelect, onAdminLogin }) {
  const [showPIN, setShowPIN] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  function handlePinDigit(digit) {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    setError("");
    if (newPin.length === 4) {
      if (newPin === ADMIN_PIN) {
        onAdminLogin();
      } else {
        setShake(true);
        setError("Incorrect PIN");
        setTimeout(() => { setPin(""); setShake(false); }, 600);
      }
    }
  }

  function handleDelete() {
    setPin(p => p.slice(0, -1));
    setError("");
  }

  if (showPIN) {
    return (
      <div className="login-screen">
        <div className="login-logo">🔐</div>
        <div className="login-title">Admin Access</div>
        <div className="login-sub">Enter your 4-digit PIN</div>

        {/* PIN dots */}
        <div className={`pin-dots ${shake ? "shake" : ""}`}>
          {[0,1,2,3].map(i => (
            <div key={i} className={`pin-dot ${pin.length > i ? "filled" : ""}`} />
          ))}
        </div>

        {error && <div className="pin-error">{error}</div>}

        {/* Numpad */}
        <div className="numpad">
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <button key={n} className="numpad-btn" onClick={() => handlePinDigit(String(n))}>
              {n}
            </button>
          ))}
          <button className="numpad-btn numpad-clear" onClick={() => { setPin(""); setError(""); }}>C</button>
          <button className="numpad-btn" onClick={() => handlePinDigit("0")}>0</button>
          <button className="numpad-btn numpad-del" onClick={handleDelete}>⌫</button>
        </div>

        <button className="pin-back-btn" onClick={() => { setShowPIN(false); setPin(""); setError(""); }}>
          ← Back to family login
        </button>
      </div>
    );
  }

  return (
    <div className="login-screen">
      <div className="login-logo">🏠</div>
      <div className="login-title">Family Budget</div>
      <div className="login-sub">Nezira Family · Bulawayo</div>
      <div className="login-label">WHO ARE YOU?</div>
      <div className="login-grid">
        {members.map(m => (
          <button key={m} className="login-btn" onClick={() => onSelect(m)}>
            <div className="login-btn-initial" style={{ background: COLORS[m] || "#1F3864" }}>
              {m[0]}
            </div>
            <div className="login-btn-name">{m}</div>
          </button>
        ))}
      </div>

      {/* Hidden admin entry */}
      <button className="admin-entry-btn" onClick={() => setShowPIN(true)}>
        ⚙️ Admin
      </button>
    </div>
  );
}
