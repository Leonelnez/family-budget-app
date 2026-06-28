// src/data/initialData.js
// Seed data — gets stored in localStorage on first load

export const MEMBERS = ["Leonel", "Mpofu", "Leroy", "Mom"];

export const CATEGORIES = [
  { id: "groceries",  label: "Groceries",           icon: "🛒", budget: 500 },
  { id: "electricity", label: "Electricity",         icon: "⚡", budget: 150 },
  { id: "hardware",   label: "Hardware / Utilities", icon: "🔧", budget: 200 },
  { id: "water",      label: "Water",                icon: "💧", budget: 80  },
  { id: "transport",  label: "Transport",            icon: "🚗", budget: 120 },
  { id: "internet",   label: "Internet",             icon: "📡", budget: 60  },
  { id: "household",  label: "Household Supplies",   icon: "🏠", budget: 100 },
  { id: "medical",    label: "Medical / Pharmacy",   icon: "💊", budget: 80  },
  { id: "entertainment", label: "Entertainment",     icon: "🎬", budget: 50  },
  { id: "other",      label: "Other",                icon: "📦", budget: 100 },
];

export const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

export const PROJECTS = [
  {
    id: "water_bill",
    name: "Water Bill Payment",
    icon: "💧",
    color: "#0070C0",
    colorLight: "#DEEAF1",
    target: 1000,
    status: "pending",
    description: "Outstanding water bill to be cleared as a family. Each member contributes $250.",
    contributions: { Leonel: 0, Mpofu: 0, Leroy: 0, Mom: 0 },
    equalShare: 250,
  },
  {
    id: "solar",
    name: "Solar Panel Installation",
    icon: "☀️",
    color: "#FF8C00",
    colorLight: "#FFF3E0",
    target: 0, // TBD — family fills in
    status: "planning",
    description: "Solar installation project. Update the target once quotes are obtained.",
    contributions: { Leonel: 0, Mpofu: 0, Leroy: 0, Mom: 0 },
    equalShare: 0,
  },
];

// Build empty contribution records for all month/category combos
export function buildEmptyContributions() {
  const data = {};
  MONTHS.forEach(month => {
    data[month] = {};
    CATEGORIES.forEach(cat => {
      data[month][cat.id] = { Leonel: 0, Mpofu: 0, Leroy: 0, Mom: 0 };
    });
  });
  return data;
}
