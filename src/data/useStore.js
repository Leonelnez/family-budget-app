// src/data/useStore.js
import { useState, useEffect } from "react";
import { buildEmptyContributions, PROJECTS, CATEGORIES } from "./initialData";

const STORAGE_KEY = "family_budget_v1";
export const ADMIN_PIN = "1794";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function useStore() {
  const [state, setState] = useState(() => {
    const saved = loadState();
    if (saved) return saved;
    return {
      contributions: buildEmptyContributions(),
      projects: PROJECTS,
      categories: CATEGORIES,
      currentMember: null,
      isAdmin: false,
    };
  });

  useEffect(() => { saveState(state); }, [state]);

  function logContribution(month, categoryId, member, amount) {
    setState(prev => ({
      ...prev,
      contributions: {
        ...prev.contributions,
        [month]: {
          ...prev.contributions[month],
          [categoryId]: {
            ...prev.contributions[month][categoryId],
            [member]: Number(amount),
          },
        },
      },
    }));
  }

  function logProjectContribution(projectId, member, amount) {
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p =>
        p.id === projectId
          ? { ...p, contributions: { ...p.contributions, [member]: Number(amount) } }
          : p
      ),
    }));
  }

  function updateProjectTarget(projectId, target) {
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p =>
        p.id === projectId
          ? { ...p, target: Number(target), equalShare: Number(target) / 4 }
          : p
      ),
    }));
  }

  // ADMIN: update project status
  function updateProjectStatus(projectId, status) {
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p =>
        p.id === projectId ? { ...p, status } : p
      ),
    }));
  }

  // ADMIN: update project name
  function updateProjectName(projectId, name) {
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p =>
        p.id === projectId ? { ...p, name } : p
      ),
    }));
  }

  // ADMIN: update project description
  function updateProjectDescription(projectId, description) {
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p =>
        p.id === projectId ? { ...p, description } : p
      ),
    }));
  }

  // ADMIN: add a new project
  function addProject(project) {
    setState(prev => ({
      ...prev,
      projects: [...prev.projects, {
        id: "proj_" + Date.now(),
        name: project.name,
        icon: project.icon || "📋",
        color: project.color || "#1F3864",
        colorLight: "#DEEAF1",
        target: Number(project.target) || 0,
        status: "planning",
        description: project.description || "",
        contributions: { Leonel: 0, Mpofu: 0, Leroy: 0, Mom: 0 },
        equalShare: Number(project.target) / 4 || 0,
      }],
    }));
  }

  // ADMIN: delete a project
  function deleteProject(projectId) {
    setState(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== projectId),
    }));
  }

  // ADMIN: update category budget
  function updateCategoryBudget(categoryId, budget) {
    setState(prev => ({
      ...prev,
      categories: (prev.categories || CATEGORIES).map(c =>
        c.id === categoryId ? { ...c, budget: Number(budget) } : c
      ),
    }));
  }

  // ADMIN: reset all data
  function resetData() {
    const fresh = {
      contributions: buildEmptyContributions(),
      projects: PROJECTS,
      categories: CATEGORIES,
      currentMember: null,
      isAdmin: false,
    };
    setState(fresh);
    saveState(fresh);
  }

  function setCurrentMember(member) {
    setState(prev => ({ ...prev, currentMember: member, isAdmin: false }));
  }

  function setAdmin(val) {
    setState(prev => ({ ...prev, isAdmin: val, currentMember: val ? "Leonel" : null }));
  }

  return {
    ...state,
    categories: state.categories || CATEGORIES,
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
