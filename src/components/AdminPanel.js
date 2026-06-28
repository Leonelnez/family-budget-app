// src/components/AdminPanel.js
import React, { useState } from "react";
import { CATEGORIES } from "../data/initialData";

const STATUS_OPTIONS = ["planning", "pending", "active", "completed", "cancelled"];
const STATUS_COLORS = {
  planning:  { bg: "#FFF3E0", color: "#FF8C00" },
  pending:   { bg: "#FDECEA", color: "#C00000" },
  active:    { bg: "#E2EFDA", color: "#375623" },
  completed: { bg: "#DEEAF1", color: "#0070C0" },
  cancelled: { bg: "#F2F2F2", color: "#888888" },
};

const PROJECT_ICONS = ["💧","☀️","🏗️","🔌","🛒","🏠","💰","🔧","📦","🎯"];
const PROJECT_COLORS = ["#1F3864","#0070C0","#7030A0","#C00000","#FF8C00","#375623","#2E75B6"];

function fmt(n) {
  return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function AdminPanel({ store }) {
  const {
    projects, categories,
    updateProjectStatus, updateProjectTarget, updateProjectName,
    updateProjectDescription, addProject, deleteProject,
    updateCategoryBudget, setAdmin, resetData,
  } = store;

  const [activeTab, setActiveTab] = useState("projects");
  const [editingProject, setEditingProject] = useState(null);
  const [newProject, setNewProject] = useState({ name: "", icon: "📋", color: "#1F3864", target: "", description: "" });
  const [showNewProject, setShowNewProject] = useState(false);
  const [toast, setToast] = useState(null);
  const [showReset, setShowReset] = useState(false);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function handleStatusChange(projectId, status) {
    updateProjectStatus(projectId, status);
    showToast(`✅ Status updated to ${status}`);
  }

  function handleTargetChange(projectId, target) {
    updateProjectTarget(projectId, target);
    showToast("✅ Target updated");
  }

  function handleSaveProject(project) {
    if (editingProject?.id === project.id) {
      updateProjectName(project.id, editingProject.name);
      updateProjectDescription(project.id, editingProject.description);
      updateProjectTarget(project.id, editingProject.target);
      setEditingProject(null);
      showToast("✅ Project saved");
    }
  }

  function handleAddProject() {
    if (!newProject.name) return;
    addProject(newProject);
    setNewProject({ name: "", icon: "📋", color: "#1F3864", target: "", description: "" });
    setShowNewProject(false);
    showToast("✅ Project added");
  }

  function handleBudgetChange(categoryId, budget) {
    updateCategoryBudget(categoryId, budget);
    showToast("✅ Budget updated");
  }

  const tabs = [
    { id: "projects", label: "Projects", icon: "🎯" },
    { id: "budgets",  label: "Budgets",  icon: "💰" },
    { id: "danger",   label: "Settings", icon: "⚙️" },
  ];

  return (
    <div>
      {/* Admin header */}
      <div style={{
        background: "linear-gradient(135deg, #1F3864, #7030A0)",
        borderRadius: 14, padding: "16px", marginBottom: 14,
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>ADMIN MODE</div>
          <div style={{ color: "#fff", fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 700 }}>
            🔐 Leonel
          </div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>Full control enabled</div>
        </div>
        <button
          onClick={() => setAdmin(false)}
          style={{
            background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)",
            borderRadius: 99, padding: "8px 16px", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer"
          }}
        >
          Exit Admin
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              flex: 1, padding: "10px 8px", borderRadius: 10, border: "1.5px solid",
              borderColor: activeTab === t.id ? "#1F3864" : "var(--border)",
              background: activeTab === t.id ? "#1F3864" : "#fff",
              color: activeTab === t.id ? "#fff" : "var(--text-2)",
              fontWeight: 700, fontSize: 12, cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3
            }}
          >
            <span style={{ fontSize: 16 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── PROJECTS TAB ── */}
      {activeTab === "projects" && (
        <div>
          {projects.map(project => {
            const isEditing = editingProject?.id === project.id;
            const statusStyle = STATUS_COLORS[project.status] || STATUS_COLORS.planning;
            const totalPaid = Object.values(project.contributions).reduce((a,b) => a+b, 0);

            return (
              <div key={project.id} className="card" style={{ marginBottom: 12 }}>
                {/* Project header */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 24 }}>{project.icon}</span>
                  <div style={{ flex: 1 }}>
                    {isEditing ? (
                      <input
                        className="form-input"
                        value={editingProject.name}
                        onChange={e => setEditingProject(p => ({ ...p, name: e.target.value }))}
                        style={{ fontSize: 14, padding: "6px 10px", marginBottom: 4 }}
                      />
                    ) : (
                      <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 15 }}>
                        {project.name}
                      </div>
                    )}
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 99,
                      background: statusStyle.bg, color: statusStyle.color
                    }}>
                      {project.status.toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={() => isEditing ? handleSaveProject(project) : setEditingProject({ ...project })}
                    style={{
                      padding: "6px 14px", borderRadius: 8, border: "none",
                      background: isEditing ? "#375623" : "#1F3864",
                      color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer"
                    }}
                  >
                    {isEditing ? "Save" : "Edit"}
                  </button>
                </div>

                {/* Status selector */}
                <div style={{ marginBottom: 10 }}>
                  <div className="form-label" style={{ marginBottom: 6 }}>STATUS</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {STATUS_OPTIONS.map(s => {
                      const sc = STATUS_COLORS[s];
                      return (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(project.id, s)}
                          style={{
                            padding: "5px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700,
                            border: "2px solid",
                            borderColor: project.status === s ? sc.color : "transparent",
                            background: sc.bg, color: sc.color, cursor: "pointer",
                            transform: project.status === s ? "scale(1.05)" : "scale(1)",
                          }}
                        >
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Target */}
                <div style={{ marginBottom: 10 }}>
                  <div className="form-label" style={{ marginBottom: 6 }}>TARGET AMOUNT</div>
                  {isEditing ? (
                    <input
                      className="form-input"
                      type="number" min="0"
                      value={editingProject.target}
                      onChange={e => setEditingProject(p => ({ ...p, target: e.target.value }))}
                      style={{ fontSize: 14, padding: "8px 12px" }}
                    />
                  ) : (
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        className="form-input"
                        type="number" min="0"
                        placeholder={project.target > 0 ? String(project.target) : "Set target..."}
                        onBlur={e => e.target.value && handleTargetChange(project.id, e.target.value)}
                        style={{ fontSize: 14, padding: "8px 12px" }}
                      />
                      <div style={{
                        padding: "8px 14px", background: "var(--bg)", borderRadius: 8,
                        fontSize: 14, fontWeight: 700, color: "var(--navy)",
                        border: "1.5px solid var(--border)", whiteSpace: "nowrap"
                      }}>
                        {project.target > 0 ? fmt(project.target) : "TBD"}
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                {isEditing && (
                  <div style={{ marginBottom: 10 }}>
                    <div className="form-label" style={{ marginBottom: 6 }}>DESCRIPTION</div>
                    <textarea
                      className="form-input"
                      rows={3}
                      value={editingProject.description}
                      onChange={e => setEditingProject(p => ({ ...p, description: e.target.value }))}
                      style={{ fontSize: 13, padding: "8px 12px", resize: "vertical" }}
                    />
                  </div>
                )}

                {/* Progress */}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-2)", paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                  <span>Collected: <strong>{fmt(totalPaid)}</strong></span>
                  <span>Remaining: <strong style={{ color: "var(--red)" }}>{fmt(Math.max(0, project.target - totalPaid))}</strong></span>
                </div>

                {/* Delete */}
                <button
                  onClick={() => { if (window.confirm(`Delete "${project.name}"?`)) { deleteProject(project.id); showToast("🗑️ Project deleted"); }}}
                  style={{
                    marginTop: 10, width: "100%", padding: "8px", borderRadius: 8,
                    border: "1.5px solid #FDECEA", background: "#FDECEA",
                    color: "#C00000", fontSize: 12, fontWeight: 700, cursor: "pointer"
                  }}
                >
                  🗑️ Delete Project
                </button>
              </div>
            );
          })}

          {/* Add new project */}
          {showNewProject ? (
            <div className="card">
              <div className="card-title">NEW PROJECT</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">PROJECT NAME</label>
                  <input className="form-input" placeholder="e.g. Borehole Installation"
                    value={newProject.name} onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">ICON</label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {PROJECT_ICONS.map(icon => (
                      <button key={icon} onClick={() => setNewProject(p => ({ ...p, icon }))}
                        style={{
                          fontSize: 20, padding: "6px 10px", borderRadius: 8, cursor: "pointer",
                          border: "2px solid", borderColor: newProject.icon === icon ? "#1F3864" : "var(--border)",
                          background: newProject.icon === icon ? "var(--navy-light)" : "#fff"
                        }}>
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">COLOUR</label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {PROJECT_COLORS.map(col => (
                      <button key={col} onClick={() => setNewProject(p => ({ ...p, color: col }))}
                        style={{
                          width: 32, height: 32, borderRadius: "50%", background: col, cursor: "pointer",
                          border: "3px solid", borderColor: newProject.color === col ? "#000" : "transparent"
                        }} />
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">TARGET AMOUNT ($)</label>
                  <input className="form-input" type="number" min="0" placeholder="0.00"
                    value={newProject.target} onChange={e => setNewProject(p => ({ ...p, target: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">DESCRIPTION</label>
                  <textarea className="form-input" rows={2} placeholder="What is this project for?"
                    value={newProject.description} onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))}
                    style={{ resize: "vertical" }} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-primary" onClick={handleAddProject} style={{ flex: 1 }}>Add Project</button>
                  <button className="btn-secondary" onClick={() => setShowNewProject(false)}>Cancel</button>
                </div>
              </div>
            </div>
          ) : (
            <button className="btn-primary" onClick={() => setShowNewProject(true)}
              style={{ background: "#375623" }}>
              + Add New Project
            </button>
          )}
        </div>
      )}

      {/* ── BUDGETS TAB ── */}
      {activeTab === "budgets" && (
        <div className="card">
          <div className="card-title">MONTHLY CATEGORY BUDGETS</div>
          <div style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 14 }}>
            Changes apply to all months. Enter new amount and press Enter or tap away.
          </div>
          {categories.map(cat => (
            <div key={cat.id} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 0", borderBottom: "1px solid var(--border)"
            }}>
              <span style={{ fontSize: 20, width: 30, textAlign: "center" }}>{cat.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{cat.label}</div>
                <div style={{ fontSize: 11, color: "var(--text-3)" }}>Current: {fmt(cat.budget)}/mo</div>
              </div>
              <input
                type="number" min="0"
                defaultValue={cat.budget}
                onBlur={e => handleBudgetChange(cat.id, e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleBudgetChange(cat.id, e.target.value)}
                style={{
                  width: 90, padding: "8px 10px", borderRadius: 8, textAlign: "center",
                  border: "1.5px solid var(--border)", fontSize: 14, fontWeight: 700,
                  color: "#0000FF", fontFamily: "inherit"
                }}
              />
            </div>
          ))}
          <div style={{
            display: "flex", justifyContent: "space-between",
            paddingTop: 12, marginTop: 4, fontWeight: 700, fontSize: 14
          }}>
            <span>TOTAL MONTHLY BUDGET</span>
            <span style={{ color: "var(--navy)", fontFamily: "'Space Grotesk',sans-serif", fontSize: 18 }}>
              {fmt(categories.reduce((s, c) => s + c.budget, 0))}
            </span>
          </div>
        </div>
      )}

      {/* ── SETTINGS TAB ── */}
      {activeTab === "danger" && (
        <div>
          <div className="card">
            <div className="card-title">APP SETTINGS</div>

            <div style={{ padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Admin PIN</div>
              <div style={{ fontSize: 13, color: "var(--text-2)" }}>Current PIN: ••••  (1794)</div>
              <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>To change PIN, edit the ADMIN_PIN value in src/data/useStore.js</div>
            </div>

            <div style={{ padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Data Storage</div>
              <div style={{ fontSize: 13, color: "var(--text-2)" }}>All data is stored locally in this browser. Each device has its own copy.</div>
            </div>

            <div style={{ padding: "14px 0" }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--red)", marginBottom: 8 }}>⚠️ Reset All Data</div>
              <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 12 }}>
                This will delete ALL contributions and reset projects to default. This cannot be undone.
              </div>
              {!showReset ? (
                <button onClick={() => setShowReset(true)}
                  style={{
                    width: "100%", padding: "12px", borderRadius: 8,
                    background: "#FDECEA", border: "1.5px solid #C00000",
                    color: "#C00000", fontWeight: 700, fontSize: 14, cursor: "pointer"
                  }}>
                  Reset All Data
                </button>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => { resetData(); showToast("🗑️ All data reset"); setShowReset(false); }}
                    style={{
                      flex: 1, padding: "12px", borderRadius: 8,
                      background: "#C00000", border: "none",
                      color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer"
                    }}>
                    Yes, Reset Everything
                  </button>
                  <button onClick={() => setShowReset(false)} className="btn-secondary">Cancel</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
