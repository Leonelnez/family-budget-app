// src/App.js
import React, { useState } from "react";
import { useStore } from "./data/useStore";
import { MEMBERS } from "./data/initialData";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import MonthlyLog from "./components/MonthlyLog";
import Projects from "./components/Projects";
import ContribSummary from "./components/ContribSummary";
import AdminPanel from "./components/AdminPanel";
import PaymentReport from "./components/PaymentReport";
import "./App.css";

export default function App() {
  const store = useStore();
  const [view, setView] = useState("dashboard");

  if (store.loading) {
    return (
      <div style={{
        minHeight: "100dvh", background: "#1F3864",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 16
      }}>
        <div style={{ fontSize: 48 }}>🏠</div>
        <div style={{ color: "#fff", fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 700 }}>Family Budget</div>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Connecting...</div>
        <div className="spinner" />
      </div>
    );
  }

  if (!store.currentMember) {
    return (
      <Login
        members={MEMBERS}
        onSelect={store.setCurrentMember}
        onAdminLogin={() => store.setAdmin(true)}
      />
    );
  }

  const nav = store.isAdmin
    ? [
        { id: "dashboard", label: "Dashboard", icon: "📊" },
        { id: "admin",     label: "Admin",     icon: "🔐" },
        { id: "projects",  label: "Projects",  icon: "🎯" },
        { id: "report",    label: "Report",    icon: "📋" },
      ]
    : [
        { id: "dashboard", label: "Dashboard", icon: "📊" },
        { id: "monthly",   label: "Expenses",  icon: "✏️" },
        { id: "projects",  label: "Projects",  icon: "🎯" },
        { id: "report",    label: "Report",    icon: "📋" },
      ];

  return (
    <div className="app">
      <header className="app-header" style={store.isAdmin ? { background: "linear-gradient(90deg,#1F3864,#7030A0)" } : {}}>
        <div className="header-left">
          <span className="app-logo">🏠</span>
          <div>
            <div className="app-title">Family Budget</div>
            <div className="app-sub">{store.isAdmin ? "🔐 Admin Mode" : "Nezira Family · Bulawayo"}</div>
          </div>
        </div>
        <button className="member-badge" onClick={() => store.setAdmin(false)} title="Switch member">
          <div className="initial" style={{ background: store.isAdmin ? "#7030A0" : undefined }}>
            {store.currentMember?.[0]?.toUpperCase()}
          </div>
          <span className="member-name">{store.isAdmin ? "Admin" : store.currentMember}</span>
        </button>
      </header>

      <main className="app-main">
        {view === "dashboard" && <Dashboard store={store} />}
        {view === "monthly"   && <MonthlyLog store={store} />}
        {view === "projects"  && <Projects store={store} />}
        {view === "summary"   && <ContribSummary store={store} />}
        {view === "admin"     && <AdminPanel store={store} />}
        {view === "report"    && <PaymentReport store={store} />}
      </main>

      <nav className="bottom-nav">
        {nav.map(n => (
          <button key={n.id}
            className={`nav-btn ${view === n.id ? "active" : ""}`}
            onClick={() => setView(n.id)}
            style={n.id === "admin" && view === n.id ? { color: "#7030A0" } : {}}
          >
            <span className="nav-icon">{n.icon}</span>
            <span className="nav-label">{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
