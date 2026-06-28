// src/components/Dashboard.js
import React from "react";
import { MONTHS, MEMBERS } from "../data/initialData";

function fmt(n) {
  return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getCurrentMonth() {
  return MONTHS[new Date().getMonth()];
}

const MEMBER_COLORS = { Leonel: "#1F3864", Mpofu: "#0070C0", Leroy: "#7030A0", Mom: "#C00000" };

export default function Dashboard({ store }) {
  const { contributions, projects, currentMember, categories } = store;
  const month = getCurrentMonth();

  let monthTotal = 0;
  let myMonthTotal = 0;
  let totalBudget = 0;

  categories.forEach(cat => {
    MEMBERS.forEach(m => {
      const v = contributions[month]?.[cat.id]?.[m] || 0;
      monthTotal += v;
      if (m === currentMember) myMonthTotal += v;
    });
    totalBudget += cat.budget;
  });

  const budgetPct = totalBudget > 0 ? Math.min(100, Math.round((monthTotal / totalBudget) * 100)) : 0;

  let annualTotal = 0;
  MONTHS.forEach(mo => {
    categories.forEach(cat => {
      MEMBERS.forEach(m => {
        annualTotal += contributions[mo]?.[cat.id]?.[m] || 0;
      });
    });
  });

  const waterProject = projects.find(p => p.id === "water_bill");
  const waterPaid = Object.values(waterProject?.contributions || {}).reduce((a, b) => a + b, 0);
  const waterTarget = waterProject?.target || 1000;

  const catTotals = categories.map(cat => {
    const total = MEMBERS.reduce((s, m) => s + (contributions[month]?.[cat.id]?.[m] || 0), 0);
    return { ...cat, total };
  }).sort((a, b) => b.total - a.total).slice(0, 5);

  return (
    <div>
      <div className="section-title">Good day, {currentMember} 👋</div>
      <div className="section-sub">{month} overview</div>

      <div className="kpi-grid">
        <div className="kpi-tile" style={{ background: "var(--navy)" }}>
          <div className="kpi-label">MY CONTRIBUTION</div>
          <div className="kpi-value">{fmt(myMonthTotal)}</div>
          <div className="kpi-sub">this month</div>
        </div>
        <div className="kpi-tile" style={{ background: "var(--navy-mid)" }}>
          <div className="kpi-label">FAMILY TOTAL</div>
          <div className="kpi-value">{fmt(monthTotal)}</div>
          <div className="kpi-sub">of {fmt(totalBudget)} budget</div>
          <div className="progress-wrap">
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: budgetPct + "%" }} />
            </div>
          </div>
        </div>
        <div className="kpi-tile" style={{ background: "var(--purple)" }}>
          <div className="kpi-label">ANNUAL TOTAL</div>
          <div className="kpi-value">{fmt(annualTotal)}</div>
          <div className="kpi-sub">all months</div>
        </div>
        <div className="kpi-tile" style={{ background: "var(--blue)" }}>
          <div className="kpi-label">WATER BILL</div>
          <div className="kpi-value">{fmt(waterPaid)}</div>
          <div className="kpi-sub">of {fmt(waterTarget)} target</div>
          <div className="progress-wrap">
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: Math.min(100, (waterPaid / waterTarget) * 100) + "%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Member contributions this month */}
      <div className="card">
        <div className="card-title">Family this month</div>
        {MEMBERS.map(m => {
          const total = categories.reduce((s, cat) => s + (contributions[month]?.[cat.id]?.[m] || 0), 0);
          const pct = monthTotal > 0 ? (total / monthTotal) * 100 : 0;
          return (
            <div key={m} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: m === currentMember ? MEMBER_COLORS[m] : "var(--text)" }}>
                  {m}{m === currentMember ? " (you)" : ""}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{fmt(total)}</span>
              </div>
              <div style={{ height: 6, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: pct + "%", background: MEMBER_COLORS[m] || "var(--navy)", borderRadius: 99, transition: "width 0.5s" }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Top spending categories */}
      <div className="card">
        <div className="card-title">Top categories — {month}</div>
        {catTotals.map(cat => (
          <div key={cat.id} className="cat-row">
            <div className="cat-icon">{cat.icon}</div>
            <div className="cat-info">
              <div className="cat-label">{cat.label}</div>
              <div className="cat-budget">Budget: {fmt(cat.budget)}</div>
            </div>
            <div className="cat-total">{fmt(cat.total)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
