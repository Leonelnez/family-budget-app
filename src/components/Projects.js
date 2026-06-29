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
  const { projects, currentMember, logProjectContribution, updateProjectTarget, isAdmin } = store;
  const [amounts, setAmounts] = useState({});
  const [targetEdits, setTargetEdits] = useState({});
  const [toast, setToast] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null); // { projectId, member }
  const [editValue, setEditValue] = useState("");

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  // ADD to existing — accumulates payments
  function handleContrib(projectId) {
    const val = parseFloat(amounts[projectId] || 0);
    if (!val || val < 0) return;
    const project = projects.find(p => p.id === projectId);
    const existing = project?.contributions?.[currentMember] || 0;
    const newTotal = existing + val;
    logProjectContribution(projectId, currentMember, newTotal);
    setAmounts(a => ({ ...a, [projectId]: "" }));
    showToast(`✅ Added ${fmt(val)} — your total is now ${fmt(newTotal)}`);
  }

  // Admin sets exact amount for any member
  function handleAdminSaveEdit(projectId) {
    const val = parseFloat(editValue);
    if (isNaN(val) || val < 0) return;
    logProjectContribution(projectId, editingEntry.member, val);
    setEditingEntry(null);
    setEditValue("");
    showToast(`✅ ${editingEntry.member}'s payment set to ${fmt(val)}`);
  }

  function handleTargetSave(projectId) {
    const val = parseFloat(targetEdits[projectId] || 0);
    if (!val || val < 0) return;
    updateProjectTarget(projectId, val);
    setTargetEdits(t => ({ ...t, [projectId]: "" }));
    showToast("✅ Target updated");
  }

  return (
    <div>
      <div className="section-title">Projects 🎯</div>
      <div className="section-sub">{projects.length} family projects</div>

      {projects.map(project => {
        const totalPaid = Object.values(project.contributions || {}).reduce((a, b) => a + b, 0);
        const pct = project.target > 0 ? Math.min(100, (totalPaid / project.target) * 100) : 0;

        return (
          <div key={project.id} className="project-card">
            {/* Header */}
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
              <div className="project-status">{project.status.toUpperCase()}</div>
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
              <div className="project-members" style={{ marginBottom: 14 }}>
                {MEMBERS.map(m => {
                  const paid = project.contributions?.[m] || 0;
                  const share = project.equalShare || 0;
                  const memPct = share > 0 ? Math.min(100, (paid / share) * 100) : 0;
                  const status = payStatus(paid, share);
                  const isEditing = editingEntry?.projectId === project.id && editingEntry?.member === m;

                  return (
                    <div key={m} style={{
                      padding: "8px 0",
                      borderBottom: "1px solid var(--border)",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        {/* Avatar */}
                        <div style={{
                          width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                          background: MEMBER_COLORS[m], color: "#fff",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12, fontWeight: 700
                        }}>{m[0]}</div>

                        {/* Name */}
                        <span style={{
                          fontSize: 13, fontWeight: 600, flex: 1,
                          color: m === currentMember ? MEMBER_COLORS[m] : "var(--text)"
                        }}>
                          {m}{m === currentMember ? " (you)" : ""}
                        </span>

                        {/* Amount + status */}
                        {isEditing ? (
                          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                            <input
                              type="number" min="0" step="0.01"
                              value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              onKeyDown={e => e.key === "Enter" && handleAdminSaveEdit(project.id)}
                              autoFocus
                              style={{
                                width: 90, padding: "5px 8px", borderRadius: 6,
                                border: "1.5px solid var(--navy-mid)", fontSize: 13,
                                fontFamily: "inherit", textAlign: "center"
                              }}
                            />
                            <button onClick={() => handleAdminSaveEdit(project.id)} style={{
                              padding: "5px 10px", borderRadius: 6, border: "none",
                              background: "var(--green)", color: "#fff",
                              fontSize: 12, fontWeight: 700, cursor: "pointer"
                            }}>✓</button>
                            <button onClick={() => setEditingEntry(null)} style={{
                              padding: "5px 8px", borderRadius: 6,
                              border: "1px solid var(--border)", background: "#fff",
                              fontSize: 12, cursor: "pointer"
                            }}>✕</button>
                          </div>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{
                              fontFamily: "'Space Grotesk',sans-serif",
                              fontWeight: 700, fontSize: 14,
                              color: paid > 0 ? "var(--text)" : "var(--text-3)"
                            }}>
                              {fmt(paid)}
                            </span>
                            <span className={`status-pill ${status.cls}`}>{status.label}</span>
                            {/* Admin edit button */}
                            {isAdmin && (
                              <button
                                onClick={() => {
                                  setEditingEntry({ projectId: project.id, member: m });
                                  setEditValue(String(paid));
                                }}
                                style={{
                                  width: 28, height: 28, borderRadius: 6,
                                  border: "1px solid var(--border)", background: "#fff",
                                  cursor: "pointer", fontSize: 13,
                                  display: "flex", alignItems: "center", justifyContent: "center"
                                }}
                              >✏️</button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Progress bar per member */}
                      {share > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 36 }}>
                          <div style={{ flex: 1, height: 5, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
                            <div style={{
                              height: "100%", width: memPct + "%",
                              background: MEMBER_COLORS[m], borderRadius: 99, transition: "width 0.4s"
                            }} />
                          </div>
                          <span style={{ fontSize: 10, color: "var(--text-3)", whiteSpace: "nowrap" }}>
                            {fmt(paid)} / {fmt(share)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
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

              {/* Log MY payment — adds to existing */}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, marginTop: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div className="form-label">ADD PAYMENT</div>
                  <div style={{ fontSize: 11, color: "var(--text-3)" }}>
                    Your total: <strong style={{ color: MEMBER_COLORS[currentMember] }}>
                      {fmt(project.contributions?.[currentMember] || 0)}
                    </strong>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    className="form-input"
                    type="number" min="0" step="0.01" placeholder="Amount to add..."
                    value={amounts[project.id] || ""}
                    onChange={e => setAmounts(a => ({ ...a, [project.id]: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && handleContrib(project.id)}
                    style={{ flex: 1 }}
                  />
                  <button
                    className="btn-primary"
                    style={{ width: "auto", padding: "0 20px" }}
                    onClick={() => handleContrib(project.id)}
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Set target (non-water-bill projects) */}
              {project.id !== "water_bill" && (
                <div style={{ marginTop: 12 }}>
                  <div className="form-label" style={{ marginBottom: 8 }}>SET TARGET ($)</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      className="form-input"
                      type="number" min="0" step="100"
                      placeholder={project.target > 0 ? `Current: ${fmt(project.target)}` : "Enter target..."}
                      value={targetEdits[project.id] || ""}
                      onChange={e => setTargetEdits(t => ({ ...t, [project.id]: e.target.value }))}
                      style={{ flex: 1 }}
                    />
                    <button className="btn-secondary" onClick={() => handleTargetSave(project.id)}>
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
