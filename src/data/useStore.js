// src/data/useStore.js
import { useState, useEffect, useRef } from "react";
import { ref, onValue, set, update } from "firebase/database";
import { db } from "../firebase";
import { buildEmptyContributions, PROJECTS, CATEGORIES } from "./initialData";

export const ADMIN_PIN = "1794";
const DB_ROOT = "family_budget";

function buildDefaultState() {
  return {
    contributions: buildEmptyContributions(),
    projects: PROJECTS,
    categories: CATEGORIES,
  };
}

export function useStore() {
  const [dbState, setDbState] = useState(null); // data from Firebase
  const [loading, setLoading] = useState(true);
  const [currentMember, setCurrentMemberLocal] = useState(null);
  const [isAdmin, setIsAdminLocal] = useState(false);
  const initialized = useRef(false);

  // ── Listen to Firebase in real time ──────────────
  useEffect(() => {
    const rootRef = ref(db, DB_ROOT);
    const unsub = onValue(rootRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        // Merge with defaults to ensure all keys exist
        setDbState({
          contributions: val.contributions || buildEmptyContributions(),
          projects: val.projects
            ? Object.values(val.projects)
            : PROJECTS,
          categories: val.categories
            ? Object.values(val.categories)
            : CATEGORIES,
        });
      } else if (!initialized.current) {
        // First time — seed the database
        const defaults = buildDefaultState();
        const toWrite = {
          contributions: defaults.contributions,
          projects: Object.fromEntries(defaults.projects.map(p => [p.id, p])),
          categories: Object.fromEntries(defaults.categories.map(c => [c.id, c])),
        };
        set(rootRef, toWrite);
        initialized.current = true;
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // ── Helpers ───────────────────────────────────────
  const state = dbState || buildDefaultState();

  function logContribution(month, categoryId, member, amount) {
    const path = `${DB_ROOT}/contributions/${month}/${categoryId}/${member}`;
    set(ref(db, path), Number(amount));
  }

  function logProjectContribution(projectId, member, amount) {
    const path = `${DB_ROOT}/projects/${projectId}/contributions/${member}`;
    set(ref(db, path), Number(amount));
  }

  function updateProjectTarget(projectId, target) {
    const updates = {};
    updates[`${DB_ROOT}/projects/${projectId}/target`] = Number(target);
    updates[`${DB_ROOT}/projects/${projectId}/equalShare`] = Number(target) / 4;
    update(ref(db), updates);
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
    const newProject = {
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
    };
    set(ref(db, `${DB_ROOT}/projects/${id}`), newProject);
  }

  function deleteProject(projectId) {
    set(ref(db, `${DB_ROOT}/projects/${projectId}`), null);
  }

  function updateCategoryBudget(categoryId, budget) {
    set(ref(db, `${DB_ROOT}/categories/${categoryId}/budget`), Number(budget));
  }

  function resetData() {
    const defaults = buildDefaultState();
    const toWrite = {
      contributions: defaults.contributions,
      projects: Object.fromEntries(defaults.projects.map(p => [p.id, p])),
      categories: Object.fromEntries(defaults.categories.map(c => [c.id, c])),
    };
    set(ref(db, DB_ROOT), toWrite);
    setCurrentMemberLocal(null);
    setIsAdminLocal(false);
  }

  function setCurrentMember(member) {
    setCurrentMemberLocal(member);
    setIsAdminLocal(false);
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
