// src/components/Projects.js
import React, { useState } from "react";
import { MEMBERS } from "../data/initialData";

function fmt(n) {
  return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const MEMBER_COLORS = { Leonel: "#1F3864", Mpofu: "#0070C0", Leroy: "#7030A0", Mom: "#C00000" };

function payStatus(paid, share) {
  if (paid <= 0) return { label: "Unpaid", cls: "status-unpaid" };
  if (paid >= share) return { label: "Paid ✓", cls: "status-paid" };
  return { label: "Partial", cls: "status-partial" };
}

export default function Projects({ store }) {
  const { projects, currentMember, logProjectContribution, updateProjectTarget } = store;
  const [amounts, setAmounts] = useState({});
  const [targetEdits, setTargetEdits] = useState({});
  const [toast, setToast] = useState(null);

  function handleContrib(projectId) {
    const val = parseFloat(amounts[projectId] || 0);
    if (!val || val < 0) return;
    logProjectContribution(projectId, currentMember, val);
    setAmounts(a => ({ ...a, [projectId]: "" }));
    setToast(`✅ Logged ${fmt(val)} for project`);
    setTimeout(() => setToast(null), 2500);
  }

  function handleTargetSave(projectId) {
    const val = parseFloat(targetEdits[projectId] || 0);
    if (!val || val < 0) return;
    updateProjectTarget(projectId, val);
    setTargetEdits(t => ({ ...t, [projectId]: "" }));
  }

  return (
    <div>
      <div className="section-title">Projects 🎯</div>
      <div className="section-sub">2 pending family projects</div>

      {projects.map(project => {
        const totalPaid = Object.values(project.contributions).reduce((a, b) => a + b, 0);
        const target = project.target || 1;
        const pct = project.target > 0 ? Math.min(100, (totalPaid / project.target) * 100) : 0;

        return (
          <div key={project.id} className="project-card">
            <div className="project-header" style={{ background: project.color }}>
              <span className="project-icon">{project.icon}</span>
              <div>
                <div className="project-title">{project.name}</div>
                {project.target > 0 && (
                  <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
                    Target: {fmt(project.target)}
                  </div>
                )}
              </div>
              <div className="project-status">
                {project.status.toUpperCase()}
              </div>
            </div>

            <div className="project-body">
              <div className="project-desc">{project.description}</div>

              {/* Progress bar */}
              {project.target > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                    <span style={{ color: "var(--text-2)", fontWeight: 600 }}>Progress</span>
                    <span style={{ fontWeight: 700 }}>{fmt(totalPaid)} / {fmt(project.target)} ({Math.round(pct)}%)</span>
                  </div>
                  <div style={{ height: 10, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: pct + "%", background: project.color, borderRadius: 99, transition: "width 0.5s" }} />
                  </div>
                </div>
              )}

              {/* Member rows */}
              <div className="project-members">
                {MEMBERS.map(m => {
                  const paid = project.contributions[m] || 0;
                  const share = project.equalShare || 0;
                  const memPct = share > 0 ? Math.min(100, (paid / share) * 100) : 0;
                  const status = payStatus(paid, share);
                  return (
                    <div key={m} className="proj-member-row">
                      <div className="proj-member-name" style={{ color: m === currentMember ? MEMBER_COLORS[m] : "var(--text)" }}>
                        {m}{m === currentMember ? " 👤" : ""}
                      </div>
                      <div className="proj-member-bar-bg">
                        <div className="proj-member-bar-fill" style={{ width: memPct + "%", background: MEMBER_COLORS[m] || project.color }} />
                      </div>
                      <div className="proj-member-amount">{fmt(paid)}</div>
                      <span className={`status-pill ${status.cls}`}>{status.label}</span>
                    </div>
                  );
                })}
              </div>

              <div className="proj-totals">
                <div className="proj-total-item">
                  <div className="proj-total-label">RAISED</div>
                  <div className="proj-total-value" style={{ color: project.color }}>{fmt(totalPaid)}</div>
                </div>
                <div className="proj-total-item">
                  <div className="proj-total-label">TARGET</div>
                  <div className="proj-total-value">{project.target > 0 ? fmt(project.target) : "TBD"}</div>
                </div>
                <div className="proj-total-item">
                  <div className="proj-total-label">REMAINING</div>
                  <div className="proj-total-value" style={{ color: "var(--red)" }}>
                    {project.target > 0 ? fmt(Math.max(0, project.target - totalPaid)) : "—"}
                  </div>
                </div>
              </div>

              {/* Log contribution */}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, marginTop: 14 }}>
                <div className="form-label" style={{ marginBottom: 8 }}>LOG MY PAYMENT</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    className="form-input"
                    type="number" min="0" step="0.01" placeholder="Amount..."
                    value={amounts[project.id] || ""}
                    onChange={e => setAmounts(a => ({ ...a, [project.id]: e.target.value }))}
                    style={{ flex: 1 }}
                  />
                  <button
                    className="btn-primary"
                    style={{ width: "auto", padding: "0 20px" }}
                    onClick={() => handleContrib(project.id)}
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Set target (solar only) */}
              {project.id === "solar" && (
                <div style={{ marginTop: 12 }}>
                  <div className="form-label" style={{ marginBottom: 8 }}>SET PROJECT TARGET ($)</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      className="form-input"
                      type="number" min="0" step="100" placeholder="Enter total cost estimate..."
                      value={targetEdits[project.id] || ""}
                      onChange={e => setTargetEdits(t => ({ ...t, [project.id]: e.target.value }))}
                      style={{ flex: 1 }}
                    />
                    <button
                      className="btn-secondary"
                      onClick={() => handleTargetSave(project.id)}
                    >
                      Set
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
