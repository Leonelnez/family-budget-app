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
  const [editingEntry, setEditingEntry] = useState(null); // { catId, member, value }
  const [editValue, setEditValue] = useState("");

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function handleLog() {
    const val = parseFloat(amount);
    if (!val || val < 0) return;
    logContribution(selectedMonth, selectedCat, currentMember, val);
    setAmount("");
    showToast(`✅ Logged ${fmt(val)} for ${categories.find(c => c.id === selectedCat)?.label}`);
  }

  function handleEdit(catId, member, currentVal) {
    setEditingEntry({ catId, member });
    setEditValue(String(currentVal));
  }

  function handleSaveEdit() {
    const val = parseFloat(editValue);
    if (val < 0 || isNaN(val)) return;
    logContribution(selectedMonth, editingEntry.catId, editingEntry.member, val);
    setEditingEntry(null);
    setEditValue("");
    showToast("✅ Contribution updated");
  }

  function handleDelete(catId, member) {
    logContribution(selectedMonth, catId, member, 0);
    showToast("🗑️ Contribution removed");
  }

  function canEdit(member) {
    return isAdmin || member === currentMember;
  }

  const monthData = contributions[selectedMonth] || {};

  return (
    <div>
      <div className="section-title">Log Expenses ✏️</div>
      <div className="section-sub">Recording as {isAdmin ? "Admin" : currentMember}</div>

      {/* Month picker */}
      <div className="month-tabs">
        {MONTHS.map(m => (
          <button key={m} className={`month-tab ${selectedMonth === m ? "active" : ""}`} onClick={() => setSelectedMonth(m)}>
            {m.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Log form */}
      <div className="card">
        <div className="card-title">Add contribution</div>
        <div className="log-form">
          {/* Admin can log for any member */}
          {isAdmin && (
            <div className="form-group">
              <label className="form-label">LOGGING FOR</label>
              <select className="form-select" value={currentMember} onChange={e => store.setCurrentMember(e.target.value)}>
                {MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">CATEGORY</label>
            <select className="form-select" value={selectedCat} onChange={e => setSelectedCat(e.target.value)}>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">AMOUNT (USD)</label>
            <input
              className="form-input" type="number" min="0" step="0.01" placeholder="0.00"
              value={amount} onChange={e => setAmount(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLog()}
            />
          </div>
          <button className="btn-primary" onClick={handleLog} disabled={!amount || parseFloat(amount) <= 0}>
            Save Contribution
          </button>
        </div>
      </div>

      {/* Breakdown with edit/delete */}
      <div className="card">
        <div className="card-title">{selectedMonth} — contributions</div>
        {categories.map(cat => {
          const row = monthData[cat.id] || {};
          const catTotal = MEMBERS.reduce((s, m) => s + (row[m] || 0), 0);
          const overBudget = catTotal > cat.budget && catTotal > 0;
          const hasAnyEntry = MEMBERS.some(m => (row[m] || 0) > 0);

          return (
            <div key={cat.id} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
              {/* Category header */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 18 }}>{cat.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{cat.label}</div>
                  <div style={{ fontSize: 11, color: overBudget ? "var(--red)" : "var(--text-3)" }}>
                    Budget: {fmt(cat.budget)} {overBudget ? "⚠️ Over budget" : ""}
                  </div>
                </div>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 15, color: overBudget ? "var(--red)" : "var(--navy)" }}>
                  {fmt(catTotal)}
                </div>
              </div>

              {/* Member entries */}
              {MEMBERS.map(m => {
                const val = row[m] || 0;
                const isEditing = editingEntry?.catId === cat.id && editingEntry?.member === m;
                const editable = canEdit(m);

                if (!hasAnyEntry && !editable) return null;

                return (
                  <div key={m} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "7px 10px", marginBottom: 4, borderRadius: 8,
                    background: m === currentMember ? "var(--bg)" : "#fff",
                    border: "1px solid var(--border)"
                  }}>
                    {/* Member dot + name */}
                    <div style={{
                      width: 26, height: 26, borderRadius: "50%",
                      background: MEMBER_COLORS[m], color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700, flexShrink: 0
                    }}>
                      {m[0]}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, flex: 1, color: m === currentMember ? MEMBER_COLORS[m] : "var(--text)" }}>
                      {m}{m === currentMember ? " (you)" : ""}
                    </div>

                    {/* Editing state */}
                    {isEditing ? (
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <input
                          type="number" min="0" step="0.01"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && handleSaveEdit()}
                          autoFocus
                          style={{
                            width: 90, padding: "5px 8px", borderRadius: 6,
                            border: "1.5px solid var(--navy-mid)", fontSize: 13,
                            fontFamily: "inherit", textAlign: "center"
                          }}
                        />
                        <button onClick={handleSaveEdit} style={{
                          padding: "5px 10px", borderRadius: 6, border: "none",
                          background: "var(--green)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer"
                        }}>Save</button>
                        <button onClick={() => setEditingEntry(null)} style={{
                          padding: "5px 10px", borderRadius: 6, border: "1px solid var(--border)",
                          background: "#fff", fontSize: 12, cursor: "pointer"
                        }}>✕</button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{
                          fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 14,
                          color: val > 0 ? "var(--text)" : "var(--text-3)"
                        }}>
                          {val > 0 ? fmt(val) : "—"}
                        </span>
                        {editable && (
                          <>
                            <button onClick={() => handleEdit(cat.id, m, val)} style={{
                              padding: "4px 8px", borderRadius: 6,
                              border: "1px solid var(--border)", background: "#fff",
                              fontSize: 11, cursor: "pointer", color: "var(--navy)", fontWeight: 600
                            }}>✏️</button>
                            {val > 0 && (
                              <button onClick={() => handleDelete(cat.id, m)} style={{
                                padding: "4px 8px", borderRadius: 6,
                                border: "1px solid #FDECEA", background: "#FDECEA",
                                fontSize: 11, cursor: "pointer", color: "var(--red)", fontWeight: 600
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
          );
        })}

        {/* Month total */}
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 4, fontWeight: 700, fontSize: 14 }}>
          <span>TOTAL</span>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 18, fontWeight: 700, color: "var(--navy)" }}>
              {fmt(categories.reduce((s, cat) => s + MEMBERS.reduce((ss, m) => ss + (monthData[cat.id]?.[m] || 0), 0), 0))}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-3)" }}>
              Your share: {fmt(categories.reduce((s, cat) => s + (monthData[cat.id]?.[currentMember] || 0), 0))}
            </div>
          </div>
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
