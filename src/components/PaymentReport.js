// src/components/PaymentReport.js
import React, { useState } from "react";
import { MEMBERS } from "../data/initialData";

function fmt(n) {
  return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
    " · " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs  < 24) return `${hrs}h ago`;
  if (days < 30) return `${days}d ago`;
  return formatDate(ts);
}

const MEMBER_COLORS = { Leonel: "#1F3864", Mpofu: "#0070C0", Leroy: "#7030A0", Mom: "#C00000" };

export default function PaymentReport({ store }) {
  const { projects, paymentHistory, currentMember, isAdmin } = store;
  const [filterMember, setFilterMember]   = useState("All");
  const [filterProject, setFilterProject] = useState("All");
  const [filterType, setFilterType]       = useState("All"); // All, Payments, Edits

  // Build flat list of all history entries across all projects
  const allEntries = [];
  projects.forEach(project => {
    const hist = paymentHistory?.[project.id] || {};
    Object.values(hist).forEach(entry => {
      allEntries.push({ ...entry, projectId: project.id, projectName: project.name, projectIcon: project.icon, projectColor: project.color });
    });
  });

  // Sort newest first
  allEntries.sort((a, b) => b.timestamp - a.timestamp);

  // Apply filters
  const filtered = allEntries.filter(e => {
    if (filterMember !== "All" && e.member !== filterMember) return false;
    if (filterProject !== "All" && e.projectId !== filterProject) return false;
    if (filterType === "Payments" && e.isAdminEdit) return false;
    if (filterType === "Edits" && !e.isAdminEdit) return false;
    return true;
  });

  // Summary stats
  const totalAdded = filtered.filter(e => e.delta > 0).reduce((s, e) => s + e.delta, 0);
  const totalCorrected = filtered.filter(e => e.isAdminEdit).length;
  const memberTotals = {};
  MEMBERS.forEach(m => {
    memberTotals[m] = filtered.filter(e => e.member === m && !e.isAdminEdit && e.delta > 0).reduce((s, e) => s + e.delta, 0);
  });

  return (
    <div>
      <div className="section-title">Payment Report 📋</div>
      <div className="section-sub">Full history across all projects</div>

      {/* Summary cards */}
      <div className="kpi-grid" style={{ marginBottom: 12 }}>
        <div className="kpi-tile" style={{ background: "var(--navy)" }}>
          <div className="kpi-label">TOTAL ENTRIES</div>
          <div className="kpi-value">{filtered.length}</div>
          <div className="kpi-sub">payments logged</div>
        </div>
        <div className="kpi-tile" style={{ background: "var(--green)" }}>
          <div className="kpi-label">TOTAL ADDED</div>
          <div className="kpi-value" style={{ fontSize: 18 }}>{fmt(totalAdded)}</div>
          <div className="kpi-sub">across all projects</div>
        </div>
      </div>

      {/* Per member summary */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-title">BY MEMBER</div>
        {MEMBERS.map(m => {
          const total = memberTotals[m] || 0;
          const max = Math.max(...Object.values(memberTotals), 1);
          return (
            <div key={m} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: m === currentMember ? MEMBER_COLORS[m] : "var(--text)" }}>
                  {m}{m === currentMember ? " (you)" : ""}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{fmt(total)}</span>
              </div>
              <div style={{ height: 6, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: (total / max * 100) + "%", background: MEMBER_COLORS[m], borderRadius: 99, transition: "width 0.5s" }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-title">FILTER</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Member filter */}
          <div>
            <div className="form-label" style={{ marginBottom: 6 }}>MEMBER</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["All", ...MEMBERS].map(m => (
                <button key={m} onClick={() => setFilterMember(m)}
                  style={{
                    padding: "5px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600,
                    border: "1.5px solid", cursor: "pointer",
                    borderColor: filterMember === m ? (MEMBER_COLORS[m] || "var(--navy)") : "var(--border)",
                    background: filterMember === m ? (MEMBER_COLORS[m] || "var(--navy)") : "#fff",
                    color: filterMember === m ? "#fff" : "var(--text-2)"
                  }}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Project filter */}
          <div>
            <div className="form-label" style={{ marginBottom: 6 }}>PROJECT</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[{ id: "All", name: "All Projects", icon: "📋" }, ...projects].map(p => (
                <button key={p.id} onClick={() => setFilterProject(p.id)}
                  style={{
                    padding: "5px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600,
                    border: "1.5px solid", cursor: "pointer",
                    borderColor: filterProject === p.id ? "var(--navy)" : "var(--border)",
                    background: filterProject === p.id ? "var(--navy)" : "#fff",
                    color: filterProject === p.id ? "#fff" : "var(--text-2)"
                  }}>
                  {p.icon} {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Type filter — admin only */}
          {isAdmin && (
            <div>
              <div className="form-label" style={{ marginBottom: 6 }}>TYPE</div>
              <div style={{ display: "flex", gap: 6 }}>
                {["All", "Payments", "Edits"].map(t => (
                  <button key={t} onClick={() => setFilterType(t)}
                    style={{
                      padding: "5px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600,
                      border: "1.5px solid", cursor: "pointer",
                      borderColor: filterType === t ? "var(--purple)" : "var(--border)",
                      background: filterType === t ? "var(--purple)" : "#fff",
                      color: filterType === t ? "#fff" : "var(--text-2)"
                    }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History list */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div className="card-title" style={{ margin: 0 }}>
            ALL ENTRIES {filtered.length > 0 ? `(${filtered.length})` : ""}
          </div>
          {totalCorrected > 0 && isAdmin && (
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
              background: "#FFF3E0", color: "var(--amber)"
            }}>
              {totalCorrected} admin edit{totalCorrected > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-text">No payment history yet.<br />Payments will appear here once logged.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map((entry, i) => (
              <div key={i} style={{
                padding: "10px 12px", borderRadius: 10,
                background: entry.isAdminEdit ? "#FFF8F0" : "var(--bg)",
                border: `1.5px solid ${entry.isAdminEdit ? "#FFE0B2" : "var(--border)"}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {/* Member avatar */}
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                    background: MEMBER_COLORS[entry.member] || "#999",
                    color: "#fff", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 13, fontWeight: 700
                  }}>{entry.member?.[0]}</div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Top row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: entry.member === currentMember ? MEMBER_COLORS[entry.member] : "var(--text)" }}>
                        {entry.member}
                        {entry.isAdminEdit && (
                          <span style={{ fontSize: 10, fontWeight: 600, color: "var(--amber)", marginLeft: 6 }}>
                            ✏️ admin edit
                          </span>
                        )}
                      </span>
                      <span style={{
                        fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 15,
                        color: entry.delta >= 0 ? "var(--green)" : "var(--red)"
                      }}>
                        {entry.delta >= 0 ? "+" : ""}{fmt(entry.delta)}
                      </span>
                    </div>

                    {/* Project + time */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
                      <span style={{ fontSize: 11, color: "var(--text-2)" }}>
                        {entry.projectIcon} {entry.projectName}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text-3)" }}>{timeAgo(entry.timestamp)}</span>
                    </div>

                    {/* Running total */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
                      <span style={{ fontSize: 11, color: "var(--text-3)" }}>
                        {fmt(entry.prevAmount)} → <strong>{fmt(entry.amount)}</strong>
                      </span>
                      {entry.note ? (
                        <span style={{ fontSize: 10, color: "var(--text-3)", fontStyle: "italic", maxWidth: 140, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          "{entry.note}"
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
