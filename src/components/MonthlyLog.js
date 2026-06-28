// src/components/MonthlyLog.js
import React, { useState } from "react";
import { MONTHS, MEMBERS } from "../data/initialData";

function fmt(n) {
  return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const MEMBER_COLORS = { Leonel: "#1F3864", Mpofu: "#0070C0", Leroy: "#7030A0", Mom: "#C00000" };

export default function MonthlyLog({ store }) {
  const { contributions, currentMember, logContribution, categories, isAdmin } = store;
  const currentMonthIdx = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[currentMonthIdx]);
  const [selectedCat, setSelectedCat] = useState(categories[0]?.id || "");
  const [amount, setAmount] = useState("");
  const [toast, setToast] = useState(null);
  const [expandedCats, setExpandedCats] = useState({});
  const [editingEntry, setEditingEntry] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [showForm, setShowForm] = useState(true);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function toggleCat(catId) {
    setExpandedCats(prev => ({ ...prev, [catId]: !prev[catId] }));
  }

  function handleLog() {
    const val = parseFloat(amount);
    if (!val || val < 0) return;
    logContribution(selectedMonth, selectedCat, currentMember, val);
    // Auto-expand the category just logged
    setExpandedCats(prev => ({ ...prev, [selectedCat]: true }));
    setAmount("");
    showToast(`✅ Logged ${fmt(val)} for ${categories.find(c => c.id === selectedCat)?.label}`);
  }

  function handleSaveEdit() {
    const val = parseFloat(editValue);
    if (isNaN(val) || val < 0) return;
    logContribution(selectedMonth, editingEntry.catId, editingEntry.member, val);
    setEditingEntry(null);
    setEditValue("");
    showToast("✅ Updated");
  }

  function handleDelete(catId, member) {
    logContribution(selectedMonth, catId, member, 0);
    showToast("🗑️ Removed");
  }

  function canEdit(member) {
    return isAdmin || member === currentMember;
  }

  const monthData = contributions[selectedMonth] || {};

  const monthTotal = categories.reduce((s, cat) =>
    s + MEMBERS.reduce((ss, m) => ss + (monthData[cat.id]?.[m] || 0), 0), 0);
  const myTotal = categories.reduce((s, cat) =>
    s + (monthData[cat.id]?.[currentMember] || 0), 0);

  return (
    <div>
      <div className="section-title">Log Expenses ✏️</div>

      {/* Month picker */}
      <div className="month-tabs">
        {MONTHS.map(m => (
          <button key={m} className={`month-tab ${selectedMonth === m ? "active" : ""}`}
            onClick={() => setSelectedMonth(m)}>
            {m.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Month summary bar */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "var(--navy)", borderRadius: 12, padding: "12px 16px", marginBottom: 12
      }}>
        <div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em" }}>FAMILY TOTAL</div>
          <div style={{ color: "#fff", fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 700 }}>{fmt(monthTotal)}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em" }}>MY SHARE</div>
          <div style={{ color: "#fff", fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 700 }}>{fmt(myTotal)}</div>
        </div>
      </div>

      {/* Collapsible log form */}
      <div className="card" style={{ marginBottom: 12 }}>
        <button
          onClick={() => setShowForm(f => !f)}
          style={{
            width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "none", border: "none", cursor: "pointer", padding: 0
          }}
        >
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 14, color: "var(--navy)" }}>
            ➕ Add Contribution
          </span>
          <span style={{ fontSize: 18, color: "var(--text-3)", transform: showForm ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
            ▾
          </span>
        </button>

        {showForm && (
          <div className="log-form" style={{ marginTop: 14 }}>
            {isAdmin && (
              <div className="form-group">
                <label className="form-label">LOGGING FOR</label>
                <select className="form-select" value={currentMember}
                  onChange={e => store.setCurrentMember(e.target.value)}>
                  {MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div className="form-group">
                <label className="form-label">CATEGORY</label>
                <select className="form-select" value={selectedCat}
                  onChange={e => setSelectedCat(e.target.value)}>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">AMOUNT ($)</label>
                <input className="form-input" type="number" min="0" step="0.01" placeholder="0.00"
                  value={amount} onChange={e => setAmount(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLog()} />
              </div>
            </div>
            <button className="btn-primary" onClick={handleLog}
              disabled={!amount || parseFloat(amount) <= 0}>
              Save
            </button>
          </div>
        )}
      </div>

      {/* Accordion categories */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {categories.map(cat => {
          const row = monthData[cat.id] || {};
          const catTotal = MEMBERS.reduce((s, m) => s + (row[m] || 0), 0);
          const overBudget = catTotal > cat.budget && catTotal > 0;
          const isExpanded = expandedCats[cat.id];
          const myAmt = row[currentMember] || 0;
          const pct = cat.budget > 0 ? Math.min(100, (catTotal / cat.budget) * 100) : 0;

          return (
            <div key={cat.id} style={{
              background: "#fff", borderRadius: 12,
              border: `1.5px solid ${overBudget ? "#FDECEA" : "var(--border)"}`,
              overflow: "hidden",
              boxShadow: "0 1px 4px rgba(31,56,100,0.06)"
            }}>
              {/* Accordion header — always visible */}
              <button
                onClick={() => toggleCat(cat.id)}
                style={{
                  width: "100%", padding: "12px 14px",
                  display: "flex", alignItems: "center", gap: 10,
                  background: "none", border: "none", cursor: "pointer", textAlign: "left"
                }}
              >
                <span style={{ fontSize: 20, flexShrink: 0 }}>{cat.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{cat.label}</span>
                    <span style={{
                      fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 15,
                      color: overBudget ? "var(--red)" : "var(--navy)", marginLeft: 8
                    }}>
                      {fmt(catTotal)}
                    </span>
                  </div>
                  {/* Mini progress bar */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                    <div style={{ flex: 1, height: 4, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: pct + "%", borderRadius: 99,
                        background: overBudget ? "var(--red)" : pct > 75 ? "var(--amber)" : "var(--green)",
                        transition: "width 0.4s"
                      }} />
                    </div>
                    <span style={{ fontSize: 10, color: "var(--text-3)", whiteSpace: "nowrap" }}>
                      {fmt(cat.budget)} budget
                    </span>
                  </div>
                  {/* My amount pill — only when collapsed */}
                  {!isExpanded && myAmt > 0 && (
                    <div style={{ marginTop: 4 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                        background: MEMBER_COLORS[currentMember] + "18",
                        color: MEMBER_COLORS[currentMember]
                      }}>
                        You: {fmt(myAmt)}
                      </span>
                    </div>
                  )}
                </div>
                <span style={{
                  fontSize: 14, color: "var(--text-3)", flexShrink: 0,
                  transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s"
                }}>▾</span>
              </button>

              {/* Expanded member rows */}
              {isExpanded && (
                <div style={{ borderTop: "1px solid var(--border)", padding: "8px 14px 12px" }}>
                  {MEMBERS.map(m => {
                    const val = row[m] || 0;
                    const isEditing = editingEntry?.catId === cat.id && editingEntry?.member === m;
                    const editable = canEdit(m);

                    return (
                      <div key={m} style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "7px 0",
                        borderBottom: "1px solid var(--border)",
                      }}>
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

                        {/* Edit mode */}
                        {isEditing ? (
                          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                            <input type="number" min="0" step="0.01"
                              value={editValue} onChange={e => setEditValue(e.target.value)}
                              onKeyDown={e => e.key === "Enter" && handleSaveEdit()}
                              autoFocus
                              style={{
                                width: 80, padding: "4px 8px", borderRadius: 6,
                                border: "1.5px solid var(--navy-mid)", fontSize: 13,
                                fontFamily: "inherit", textAlign: "center"
                              }} />
                            <button onClick={handleSaveEdit} style={{
                              padding: "4px 8px", borderRadius: 6, border: "none",
                              background: "var(--green)", color: "#fff",
                              fontSize: 11, fontWeight: 700, cursor: "pointer"
                            }}>✓</button>
                            <button onClick={() => setEditingEntry(null)} style={{
                              padding: "4px 8px", borderRadius: 6,
                              border: "1px solid var(--border)", background: "#fff",
                              fontSize: 11, cursor: "pointer"
                            }}>✕</button>
                          </div>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{
                              fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 14,
                              color: val > 0 ? "var(--text)" : "var(--text-3)", minWidth: 50, textAlign: "right"
                            }}>
                              {val > 0 ? fmt(val) : "—"}
                            </span>
                            {editable && (
                              <>
                                <button onClick={() => { setEditingEntry({ catId: cat.id, member: m }); setEditValue(String(val)); }}
                                  style={{
                                    width: 28, height: 28, borderRadius: 6, border: "1px solid var(--border)",
                                    background: "#fff", cursor: "pointer", fontSize: 13,
                                    display: "flex", alignItems: "center", justifyContent: "center"
                                  }}>✏️</button>
                                {val > 0 && (
                                  <button onClick={() => handleDelete(cat.id, m)}
                                    style={{
                                      width: 28, height: 28, borderRadius: 6,
                                      border: "1px solid #FDECEA", background: "#FDECEA",
                                      cursor: "pointer", fontSize: 13,
                                      display: "flex", alignItems: "center", justifyContent: "center"
                                    }}>🗑️</button>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
