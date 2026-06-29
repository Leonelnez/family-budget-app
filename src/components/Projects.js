// src/components/Projects.js
import React, { useState } from "react";
import { MEMBERS } from "../data/initialData";

function fmt(n) {
  return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs  < 24) return `${hrs}h ago`;
  return `${days}d ago`;
}

const MEMBER_COLORS = { Leonel: "#1F3864", Mpofu: "#0070C0", Leroy: "#7030A0", Mom: "#C00000" };

function payStatus(paid, share) {
  if (paid <= 0) return { label: "Unpaid", cls: "status-unpaid" };
  if (paid >= share) return { label: "Paid ✓", cls: "status-paid" };
  return { label: "Partial", cls: "status-partial" };
}

export default function Projects({ store }) {
  const {
    projects, currentMember, paymentHistory,
    logProjectContribution, adminEditProjectPayment,
    updateProjectTarget, updateProjectDescription, isAdmin
  } = store;

  const [amounts, setAmounts]           = useState({});
  const [targetEdits, setTargetEdits]   = useState({});
  const [toast, setToast]               = useState(null);
  const [editingEntry, setEditingEntry] = useState(null); // { projectId, member }
  const [editValue, setEditValue]       = useState("");
  const [editNote, setEditNote]         = useState("");
  const [editingDesc, setEditingDesc]   = useState(null); // projectId
  const [descValue, setDescValue]       = useState("");
  const [showHistory, setShowHistory]   = useState({}); // { projectId: bool }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  // Member adds to their own total
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
  function handleAdminSave(projectId) {
    const val = parseFloat(editValue);
    if (isNaN(val) || val < 0) return;
    adminEditProjectPayment(projectId, editingEntry.member, val, "Leonel", editNote);
    setEditingEntry(null);
    setEditValue("");
    setEditNote("");
    showToast(`✅ ${editingEntry.member}'s payment set to ${fmt(val)}`);
  }

  function handleTargetSave(projectId) {
    const val = parseFloat(targetEdits[projectId] || 0);
    if (!val || val < 0) return;
    updateProjectTarget(projectId, val);
    setTargetEdits(t => ({ ...t, [projectId]: "" }));
    showToast("✅ Target updated");
  }

  function handleDescSave(projectId) {
    updateProjectDescription(projectId, descValue);
    setEditingDesc(null);
    setDescValue("");
    showToast("✅ Description updated");
  }

  return (
    <div>
      <div className="section-title">Projects 🎯</div>
      <div className="section-sub">{projects.length} family projects</div>

      {projects.map(project => {
        const totalPaid = Object.values(project.contributions || {}).reduce((a, b) => a + b, 0);
        const pct = project.target > 0 ? Math.min(100, (totalPaid / project.target) * 100) : 0;

        // Get last 3 history entries for this project
        const historyRaw = paymentHistory?.[project.id] || {};
        const historyList = Object.values(historyRaw)
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 3);

        const isHistoryOpen = showHistory[project.id];
        const isDescEditing = editingDesc === project.id;

        return (
          <div key={project.id} className="project-card">
            {/* Header */}
            <div className="project-header" style={{ background: project.color }}>
              <span className="project-icon">{project.icon}</span>
              <div style={{ flex: 1 }}>
                <div className="project-title">{project.name}</div>
                {project.target > 0 && (
                  <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>Target: {fmt(project.target)}</div>
                )}
              </div>
              <div className="project-status">{project.status.toUpperCase()}</div>
            </div>

            <div className="project-body">

              {/* ── Description — admin can edit inline ── */}
              {isDescEditing ? (
                <div style={{ marginBottom: 14 }}>
                  <textarea
                    value={descValue}
                    onChange={e => setDescValue(e.target.value)}
                    rows={3}
                    autoFocus
                    style={{
                      width: "100%", padding: "10px 12px", borderRadius: 8,
                      border: "1.5px solid var(--navy-mid)", fontSize: 13,
                      fontFamily: "inherit", resize: "vertical", lineHeight: 1.5
                    }}
                  />
                  <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                    <button onClick={() => handleDescSave(project.id)} style={{
                      padding: "7px 16px", borderRadius: 8, border: "none",
                      background: "var(--green)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer"
                    }}>Save</button>
                    <button onClick={() => setEditingDesc(null)} style={{
                      padding: "7px 14px", borderRadius: 8,
                      border: "1px solid var(--border)", background: "#fff", fontSize: 13, cursor: "pointer"
                    }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 14 }}>
                  <div className="project-desc" style={{ flex: 1, margin: 0 }}>{project.description}</div>
                  {isAdmin && (
                    <button
                      onClick={() => { setEditingDesc(project.id); setDescValue(project.description); }}
                      title="Edit description"
                      style={{
                        flexShrink: 0, width: 28, height: 28, borderRadius: 6,
                        border: "1px solid var(--border)", background: "#fff",
                        cursor: "pointer", fontSize: 13,
                        display: "flex", alignItems: "center", justifyContent: "center"
                      }}
                    >✏️</button>
                  )}
                </div>
              )}

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
              <div style={{ marginBottom: 14 }}>
                {MEMBERS.map(m => {
                  const paid = project.contributions?.[m] || 0;
                  const share = project.equalShare || 0;
                  const memPct = share > 0 ? Math.min(100, (paid / share) * 100) : 0;
                  const status = payStatus(paid, share);
                  const isEditing = editingEntry?.projectId === project.id && editingEntry?.member === m;

                  return (
                    <div key={m} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: share > 0 ? 6 : 0 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                          background: MEMBER_COLORS[m], color: "#fff",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12, fontWeight: 700
                        }}>{m[0]}</div>
                        <span style={{
                          fontSize: 13, fontWeight: 600, flex: 1,
                          color: m === currentMember ? MEMBER_COLORS[m] : "var(--text)"
                        }}>
                          {m}{m === currentMember ? " (you)" : ""}
                        </span>

                        {isEditing ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 5, alignItems: "flex-end" }}>
                            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                              <input
                                type="number" min="0" step="0.01"
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleAdminSave(project.id)}
                                autoFocus
                                placeholder="New total..."
                                style={{
                                  width: 100, padding: "5px 8px", borderRadius: 6,
                                  border: "1.5px solid var(--navy-mid)", fontSize: 13,
                                  fontFamily: "inherit", textAlign: "center"
                                }}
                              />
                              <button onClick={() => handleAdminSave(project.id)} style={{
                                padding: "5px 10px", borderRadius: 6, border: "none",
                                background: "var(--green)", color: "#fff",
                                fontSize: 12, fontWeight: 700, cursor: "pointer"
                              }}>✓</button>
                              <button onClick={() => { setEditingEntry(null); setEditNote(""); }} style={{
                                padding: "5px 8px", borderRadius: 6,
                                border: "1px solid var(--border)", background: "#fff",
                                fontSize: 12, cursor: "pointer"
                              }}>✕</button>
                            </div>
                            <input
                              type="text" placeholder="Note (optional)..."
                              value={editNote}
                              onChange={e => setEditNote(e.target.value)}
                              style={{
                                width: "100%", padding: "4px 8px", borderRadius: 6,
                                border: "1px solid var(--border)", fontSize: 11,
                                fontFamily: "inherit", color: "var(--text-2)"
                              }}
                            />
                          </div>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{
                              fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 14,
                              color: paid > 0 ? "var(--text)" : "var(--text-3)"
                            }}>{fmt(paid)}</span>
                            <span className={`status-pill ${status.cls}`}>{status.label}</span>
                            {isAdmin && (
                              <button onClick={() => {
                                setEditingEntry({ projectId: project.id, member: m });
                                setEditValue(String(paid));
                                setEditNote("");
                              }} style={{
                                width: 28, height: 28, borderRadius: 6,
                                border: "1px solid var(--border)", background: "#fff",
                                cursor: "pointer", fontSize: 13,
                                display: "flex", alignItems: "center", justifyContent: "center"
                              }}>✏️</button>
                            )}
                          </div>
                        )}
                      </div>
                      {share > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 36 }}>
                          <div style={{ flex: 1, height: 5, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: memPct + "%", background: MEMBER_COLORS[m], borderRadius: 99, transition: "width 0.4s" }} />
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

              {/* ── Payment History ── */}
              {historyList.length > 0 && (
                <div style={{ marginTop: 14, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                  <button
                    onClick={() => setShowHistory(h => ({ ...h, [project.id]: !h[project.id] }))}
                    style={{
                      width: "100%", display: "flex", justifyContent: "space-between",
                      alignItems: "center", background: "none", border: "none",
                      cursor: "pointer", padding: 0, marginBottom: isHistoryOpen ? 10 : 0
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)", letterSpacing: "0.05em" }}>
                      🕒 RECENT PAYMENTS ({historyList.length})
                    </span>
                    <span style={{
                      fontSize: 13, color: "var(--text-3)",
                      transform: isHistoryOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s"
                    }}>▾</span>
                  </button>

                  {isHistoryOpen && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {historyList.map((entry, i) => (
                        <div key={i} style={{
                          display: "flex", alignItems: "center", gap: 8,
                          padding: "8px 10px", borderRadius: 8,
                          background: entry.isAdminEdit ? "#FFF3E0" : "var(--bg)",
                          border: `1px solid ${entry.isAdminEdit ? "#FFE0B2" : "var(--border)"}`
                        }}>
                          {/* Avatar */}
                          <div style={{
                            width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                            background: MEMBER_COLORS[entry.member] || "#999",
                            color: "#fff", display: "flex", alignItems: "center",
                            justifyContent: "center", fontSize: 11, fontWeight: 700
                          }}>{entry.member?.[0]}</div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600 }}>
                              {entry.member}
                              {entry.isAdminEdit && (
                                <span style={{ fontSize: 10, color: "var(--amber)", marginLeft: 6 }}>
                                  ✏️ admin edit
                                </span>
                              )}
                            </div>
                            {entry.note ? (
                              <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 1 }}>{entry.note}</div>
                            ) : null}
                          </div>

                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif" }}>
                              <span style={{ color: entry.delta >= 0 ? "var(--green)" : "var(--red)" }}>
                                {entry.delta >= 0 ? "+" : ""}{fmt(entry.delta)}
                              </span>
                            </div>
                            <div style={{ fontSize: 10, color: "var(--text-3)" }}>
                              → {fmt(entry.amount)} · {timeAgo(entry.timestamp)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Add payment */}
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
                    className="form-input" type="number" min="0" step="0.01"
                    placeholder="Amount to add..."
                    value={amounts[project.id] || ""}
                    onChange={e => setAmounts(a => ({ ...a, [project.id]: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && handleContrib(project.id)}
                    style={{ flex: 1 }}
                  />
                  <button className="btn-primary" style={{ width: "auto", padding: "0 20px" }}
                    onClick={() => handleContrib(project.id)}>
                    + Add
                  </button>
                </div>
              </div>

              {/* Set target */}
              {project.id !== "water_bill" && (
                <div style={{ marginTop: 12 }}>
                  <div className="form-label" style={{ marginBottom: 8 }}>SET TARGET ($)</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input className="form-input" type="number" min="0" step="100"
                      placeholder={project.target > 0 ? `Current: ${fmt(project.target)}` : "Enter target..."}
                      value={targetEdits[project.id] || ""}
                      onChange={e => setTargetEdits(t => ({ ...t, [project.id]: e.target.value }))}
                      style={{ flex: 1 }}
                    />
                    <button className="btn-secondary" onClick={() => handleTargetSave(project.id)}>Set</button>
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
