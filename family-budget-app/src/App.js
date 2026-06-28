// src/App.js
import React, { useState } from "react";
import { useStore } from "./data/useStore";
import { MEMBERS } from "./data/initialData";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import MonthlyLog from "./components/MonthlyLog";
import Projects from "./components/Projects";
import ContribSummary from "./components/ContribSummary";
import "./App.css";

export default function App() {
  const store = useStore();
  const [view, setView] = useState("dashboard");

  if (!store.currentMember) {
    return <Login members={MEMBERS} onSelect={store.setCurrentMember} />;
  }

  const nav = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "monthly",   label: "Log Expenses", icon: "✏️" },
    { id: "projects",  label: "Projects", icon: "🎯" },
    { id: "summary",   label: "Summary", icon: "👥" },
  ];

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <span className="app-logo">🏠</span>
          <div>
            <div className="app-title">Family Budget</div>
            <div className="app-sub">Cairns · Bulawayo</div>
          </div>
        </div>
        <button
          className="member-badge"
          onClick={() => store.setCurrentMember(null)}
          title="Switch member"
        >
          {memberInitial(store.currentMember)}
          <span className="member-name">{store.currentMember}</span>
        </button>
      </header>

      <main className="app-main">
        {view === "dashboard" && <Dashboard store={store} />}
        {view === "monthly"   && <MonthlyLog store={store} />}
        {view === "projects"  && <Projects store={store} />}
        {view === "summary"   && <ContribSummary store={store} />}
      </main>

      <nav className="bottom-nav">
        {nav.map(n => (
          <button
            key={n.id}
            className={`nav-btn ${view === n.id ? "active" : ""}`}
            onClick={() => setView(n.id)}
          >
            <span className="nav-icon">{n.icon}</span>
            <span className="nav-label">{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function memberInitial(name) {
  return name ? name[0].toUpperCase() : "?";
}
