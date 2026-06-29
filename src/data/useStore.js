// src/data/useStore.js
import { useState, useEffect, useRef } from "react";
import { ref, onValue, set, update, push } from "firebase/database";
import { db } from "../firebase";
import { buildEmptyContributions, PROJECTS, CATEGORIES } from "./initialData";

export const ADMIN_PIN = "1794";
const DB_ROOT = "family_budget";

function buildDefaultState() {
  return {
    contributions: buildEmptyContributions(),
    projects: PROJECTS,
    categories: CATEGORIES,
    paymentHistory: {},
  };
}

export function useStore() {
  const [dbState, setDbState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentMember, setCurrentMemberLocal] = useState(null);
  const [isAdmin, setIsAdminLocal] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    const rootRef = ref(db, DB_ROOT);
    const unsub = onValue(rootRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        setDbState({
          contributions: val.contributions || buildEmptyContributions(),
          projects: val.projects ? Object.values(val.projects) : PROJECTS,
          categories: val.categories ? Object.values(val.categories) : CATEGORIES,
          paymentHistory: val.paymentHistory || {},
        });
      } else if (!initialized.current) {
        const defaults = buildDefaultState();
        const toWrite = {
          contributions: defaults.contributions,
          projects: Object.fromEntries(defaults.projects.map(p => [p.id, p])),
          categories: Object.fromEntries(defaults.categories.map(c => [c.id, c])),
          paymentHistory: {},
        };
        set(rootRef, toWrite);
        initialized.current = true;
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const state = dbState || buildDefaultState();

  function logContribution(month, categoryId, member, amount) {
    set(ref(db, `${DB_ROOT}/contributions/${month}/${categoryId}/${member}`), Number(amount));
  }

  // Log project payment + record history entry
  function logProjectContribution(projectId, member, amount, note = "") {
    const prevAmount = state.projects.find(p => p.id === projectId)?.contributions?.[member] || 0;
    // Save the new total
    set(ref(db, `${DB_ROOT}/projects/${projectId}/contributions/${member}`), Number(amount));
    // Record history entry
    const historyRef = ref(db, `${DB_ROOT}/paymentHistory/${projectId}`);
    push(historyRef, {
      member,
      amount: Number(amount),
      prevAmount: Number(prevAmount),
      delta: Number(amount) - Number(prevAmount),
      note: note || "",
      timestamp: Date.now(),
      by: member,
    });
  }

  // Admin override — records who made the change
  function adminEditProjectPayment(projectId, member, amount, adminName, note = "") {
    const prevAmount = state.projects.find(p => p.id === projectId)?.contributions?.[member] || 0;
    set(ref(db, `${DB_ROOT}/projects/${projectId}/contributions/${member}`), Number(amount));
    const historyRef = ref(db, `${DB_ROOT}/paymentHistory/${projectId}`);
    push(historyRef, {
      member,
      amount: Number(amount),
      prevAmount: Number(prevAmount),
      delta: Number(amount) - Number(prevAmount),
      note: note || `Edited by Admin (${adminName})`,
      timestamp: Date.now(),
      by: adminName,
      isAdminEdit: true,
    });
  }

  function updateProjectTarget(projectId, target) {
    update(ref(db), {
      [`${DB_ROOT}/projects/${projectId}/target`]: Number(target),
      [`${DB_ROOT}/projects/${projectId}/equalShare`]: Number(target) / 4,
    });
  }

  function updateProjectStatus(projectId, status) {
    set(ref(db, `${DB_ROOT}/projects/${projectId}/status`), status);
  }

  function updateProjectName(projectId, name) {
    set(ref(db, `${DB_ROOT}/projects/${projectId}/name`), name);
  }

  function updateProjectDescription(projectId, description) {
    set(ref(db, `${DB_ROOT}/projects/${projectId}/description`), description);
  }

  function addProject(project) {
    const id = "proj_" + Date.now();
    set(ref(db, `${DB_ROOT}/projects/${id}`), {
      id,
      name: project.name,
      icon: project.icon || "📋",
      color: project.color || "#1F3864",
      colorLight: "#DEEAF1",
      target: Number(project.target) || 0,
      status: "planning",
      description: project.description || "",
      contributions: { Leonel: 0, Mpofu: 0, Leroy: 0, Mom: 0 },
      equalShare: Number(project.target) / 4 || 0,
    });
  }

  function deleteProject(projectId) {
    set(ref(db, `${DB_ROOT}/projects/${projectId}`), null);
    set(ref(db, `${DB_ROOT}/paymentHistory/${projectId}`), null);
  }

  function updateCategoryBudget(categoryId, budget) {
    set(ref(db, `${DB_ROOT}/categories/${categoryId}/budget`), Number(budget));
  }

  function resetData() {
    const defaults = buildDefaultState();
    set(ref(db, DB_ROOT), {
      contributions: defaults.contributions,
      projects: Object.fromEntries(defaults.projects.map(p => [p.id, p])),
      categories: Object.fromEntries(defaults.categories.map(c => [c.id, c])),
      paymentHistory: {},
    });
    setCurrentMemberLocal(null);
    setIsAdminLocal(false);
  }

  function setCurrentMember(member, keepAdmin = false) {
    setCurrentMemberLocal(member);
    if (!keepAdmin) setIsAdminLocal(false);
  }

  function setAdmin(val) {
    setIsAdminLocal(val);
    setCurrentMemberLocal(val ? "Leonel" : null);
  }

  return {
    ...state,
    loading,
    currentMember,
    isAdmin,
    logContribution,
    logProjectContribution,
    adminEditProjectPayment,
    updateProjectTarget,
    updateProjectStatus,
    updateProjectName,
    updateProjectDescription,
    addProject,
    deleteProject,
    updateCategoryBudget,
    setCurrentMember,
    setAdmin,
    resetData,
  };
}
