// src/data/useStore.js
import { useState, useEffect } from "react";
import { buildEmptyContributions, PROJECTS } from "./initialData";

const STORAGE_KEY = "family_budget_v1";

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
      currentMember: null,
    };
  });

  useEffect(() => {
    saveState(state);
  }, [state]);

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

  function setCurrentMember(member) {
    setState(prev => ({ ...prev, currentMember: member }));
  }

  function resetData() {
    const fresh = {
      contributions: buildEmptyContributions(),
      projects: PROJECTS,
      currentMember: null,
    };
    setState(fresh);
    saveState(fresh);
  }

  return {
    ...state,
    logContribution,
    logProjectContribution,
    updateProjectTarget,
    setCurrentMember,
    resetData,
  };
}
