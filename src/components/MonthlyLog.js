// src/components/MonthlyLog.js
import React, { useState } from "react";
import { CATEGORIES, MONTHS, MEMBERS } from "../data/initialData";

function fmt(n) {
  return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function MonthlyLog({ store }) {
  const { contributions, currentMember, logContribution } = store;
  const currentMonthIdx = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[currentMonthIdx]);
  const [selectedCat, setSelectedCat] = useState(CATEGORIES[0].id);
  const [amount, setAmount] = useState("");
  const [toast, setToast] = useState(null);

  function handleLog() {
    const val = parseFloat(amount);
    if (!val || val < 0) return;
    logContribution(selectedMonth, selectedCat, currentMember, val);
    setAmount("");
    setToast(`✅ Logged ${fmt(val)} for ${CATEGORIES.find(c=>c.id===selectedCat)?.label}`);
    setTimeout(() => setToast(null), 2500);
  }

  // Totals for selected month
  const monthData = contributions[selectedMonth] || {};

  return (
    <div>
      <div className="section-title">Log Expenses ✏️</div>
      <div className="section-sub">Recording as {currentMember}</div>

      {/* Month picker */}
      <div className="month-tabs">
        {MONTHS.map(m => (
          <button
            key={m}
            className={`month-tab ${selectedMonth === m ? "active" : ""}`}
            onClick={() => setSelectedMonth(m)}
          >
            {m.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Log form */}
      <div className="card">
        <div className="card-title">Add contribution</div>
        <div className="log-form">
          <div className="form-group">
            <label className="form-label">CATEGORY</label>
            <select className="form-select" value={selectedCat} onChange={e => setSelectedCat(e.target.value)}>
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">AMOUNT (USD)</label>
            <input
              className="form-input"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLog()}
            />
          </div>
          <button className="btn-primary" onClick={handleLog} disabled={!amount || parseFloat(amount) <= 0}>
            Save Contribution
          </button>
        </div>
      </div>

      {/* Month breakdown table */}
      <div className="card">
        <div className="card-title">{selectedMonth} — all categories</div>
        {CATEGORIES.map(cat => {
          const row = monthData[cat.id] || {};
          const total = MEMBERS.reduce((s, m) => s + (row[m] || 0), 0);
          const myAmt = row[currentMember] || 0;
          const overBudget = total > cat.budget && total > 0;
          return (
            <div key={cat.id} className="cat-row">
              <div className="cat-icon">{cat.icon}</div>
              <div className="cat-info">
                <div className="cat-label">{cat.label}</div>
                <div className="cat-budget" style={{ color: overBudget ? "var(--red)" : undefined }}>
                  Budget: {fmt(cat.budget)}{overBudget ? " ⚠️" : ""}
                </div>
                {myAmt > 0 && (
                  <div style={{ fontSize: 11, color: "var(--navy-mid)", fontWeight: 600 }}>
                    Your share: {fmt(myAmt)}
                  </div>
                )}
              </div>
              <div>
                <div className="cat-total" style={{ color: overBudget ? "var(--red)" : undefined }}>
                  {fmt(total)}
                </div>
                <div style={{ fontSize: 10, color: "var(--text-3)", textAlign: "right" }}>family</div>
              </div>
            </div>
          );
        })}

        {/* Month totals row */}
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, marginTop: 4, borderTop: "2px solid var(--border)" }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>TOTAL</span>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: "var(--navy)" }}>
              {fmt(CATEGORIES.reduce((s, cat) => s + MEMBERS.reduce((ss, m) => ss + (monthData[cat.id]?.[m] || 0), 0), 0))}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-3)" }}>
              Your share: {fmt(CATEGORIES.reduce((s, cat) => s + (monthData[cat.id]?.[currentMember] || 0), 0))}
            </div>
          </div>
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
