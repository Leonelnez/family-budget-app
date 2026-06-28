// src/components/ContribSummary.js
import React, { useState } from "react";
import { CATEGORIES, MONTHS, MEMBERS } from "../data/initialData";

function fmt(n) {
  return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const MEMBER_COLORS = { Leonel: "#1F3864", Mpofu: "#0070C0", Leroy: "#7030A0", Mom: "#C00000" };

export default function ContribSummary({ store }) {
  const { contributions, currentMember } = store;
  const [view, setView] = useState("monthly"); // monthly | category

  // Monthly totals per member
  const monthlyTotals = MONTHS.map(month => {
    const row = { month };
    let rowTotal = 0;
    MEMBERS.forEach(m => {
      const total = CATEGORIES.reduce((s, cat) => s + (contributions[month]?.[cat.id]?.[m] || 0), 0);
      row[m] = total;
      rowTotal += total;
    });
    row.total = rowTotal;
    return row;
  });

  // Annual totals
  const annualTotals = { total: 0 };
  MEMBERS.forEach(m => { annualTotals[m] = 0; });
  monthlyTotals.forEach(row => {
    MEMBERS.forEach(m => { annualTotals[m] += row[m]; });
    annualTotals.total += row.total;
  });

  // Category totals per member
  const catTotals = CATEGORIES.map(cat => {
    const row = { cat };
    let rowTotal = 0;
    MEMBERS.forEach(m => {
      const total = MONTHS.reduce((s, month) => s + (contributions[month]?.[cat.id]?.[m] || 0), 0);
      row[m] = total;
      rowTotal += total;
    });
    row.total = rowTotal;
    return row;
  });

  return (
    <div>
      <div className="section-title">Contributions 👥</div>
      <div className="section-sub">Full family breakdown</div>

      {/* View toggle */}
      <div className="member-chips" style={{ marginBottom: 14 }}>
        <button className={`member-chip ${view === "monthly" ? "active" : ""}`} onClick={() => setView("monthly")}>By Month</button>
        <button className={`member-chip ${view === "category" ? "active" : ""}`} onClick={() => setView("category")}>By Category</button>
      </div>

      {/* Annual summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        {MEMBERS.map(m => (
          <div key={m} className="kpi-tile" style={{ background: MEMBER_COLORS[m] }}>
            <div className="kpi-label">{m.toUpperCase()}{m === currentMember ? " (YOU)" : ""}</div>
            <div className="kpi-value" style={{ fontSize: 18 }}>{fmt(annualTotals[m])}</div>
            <div className="kpi-sub">
              {annualTotals.total > 0 ? Math.round((annualTotals[m] / annualTotals.total) * 100) : 0}% of family total
            </div>
          </div>
        ))}
      </div>

      {view === "monthly" && (
        <div className="card" style={{ overflowX: "auto" }}>
          <div className="card-title">Monthly breakdown</div>
          <table className="summary-table">
            <thead>
              <tr>
                <th>Month</th>
                {MEMBERS.map(m => (
                  <th key={m} style={{ color: m === currentMember ? MEMBER_COLORS[m] : undefined }}>
                    {m.slice(0,3)}
                  </th>
                ))}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {monthlyTotals.map(row => {
                const hasData = row.total > 0;
                return (
                  <tr key={row.month} style={{ opacity: hasData ? 1 : 0.4 }}>
                    <td>{row.month.slice(0,3)}</td>
                    {MEMBERS.map(m => (
                      <td key={m} style={{ color: m === currentMember ? MEMBER_COLORS[m] : undefined, fontWeight: m === currentMember ? 700 : 400 }}>
                        {row[m] > 0 ? fmt(row[m]) : "—"}
                      </td>
                    ))}
                    <td style={{ fontWeight: 700 }}>{row.total > 0 ? fmt(row.total) : "—"}</td>
                  </tr>
                );
              })}
              <tr className="total-row">
                <td>TOTAL</td>
                {MEMBERS.map(m => (
                  <td key={m} style={{ color: MEMBER_COLORS[m], fontWeight: 700 }}>{fmt(annualTotals[m])}</td>
                ))}
                <td style={{ color: "var(--navy)", fontWeight: 700 }}>{fmt(annualTotals.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {view === "category" && (
        <div className="card" style={{ overflowX: "auto" }}>
          <div className="card-title">By category (annual)</div>
          <table className="summary-table">
            <thead>
              <tr>
                <th>Category</th>
                {MEMBERS.map(m => (
                  <th key={m} style={{ color: m === currentMember ? MEMBER_COLORS[m] : undefined }}>
                    {m.slice(0,3)}
                  </th>
                ))}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {catTotals.map(row => (
                <tr key={row.cat.id}>
                  <td>{row.cat.icon} {row.cat.label.split(" ")[0]}</td>
                  {MEMBERS.map(m => (
                    <td key={m} style={{ color: m === currentMember ? MEMBER_COLORS[m] : undefined, fontWeight: m === currentMember ? 700 : 400 }}>
                      {row[m] > 0 ? fmt(row[m]) : "—"}
                    </td>
                  ))}
                  <td style={{ fontWeight: 700 }}>{row.total > 0 ? fmt(row.total) : "—"}</td>
                </tr>
              ))}
              <tr className="total-row">
                <td>TOTAL</td>
                {MEMBERS.map(m => (
                  <td key={m} style={{ color: MEMBER_COLORS[m], fontWeight: 700 }}>{fmt(annualTotals[m])}</td>
                ))}
                <td style={{ color: "var(--navy)", fontWeight: 700 }}>{fmt(annualTotals.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
