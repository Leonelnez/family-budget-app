# 🏠 Family Budget App

A mobile-first React app for the family to track monthly expenses and project contributions.

**Members:** Leonel · Mpofu · Leroy · Mom

---

## Features

- **Login screen** — each member picks their name to log under their account
- **Dashboard** — KPI tiles, monthly progress, family contribution bars
- **Log Expenses** — pick month + category, enter amount, save
- **Projects** — Water Bill ($1,000 target) + Solar Panel (set your own target)
- **Summary** — full breakdown by month or by category, annual totals
- **Offline-ready** — all data saved to localStorage (no backend needed)

---

## Quick Start (local)

```bash
cd family-budget-app
npm install
npm start
```

Opens at http://localhost:3000 — works on any phone on the same WiFi.

---

## Deploy Free on Vercel (recommended)

Vercel gives you a public URL the whole family can bookmark on their phones.

### Step 1 — Push to GitHub
1. Create a free account at https://github.com
2. Create a new repository called `family-budget-app`
3. In your terminal:
```bash
cd family-budget-app
git init
git add .
git commit -m "Initial family budget app"
git remote add origin https://github.com/YOUR_USERNAME/family-budget-app.git
git push -u origin main
```

### Step 2 — Deploy on Vercel
1. Go to https://vercel.com and sign up (free) with your GitHub account
2. Click **"Add New Project"**
3. Import your `family-budget-app` repository
4. Leave all settings as default — Vercel auto-detects React
5. Click **Deploy**

Your app will be live at: `https://family-budget-app-xxxx.vercel.app`

Share that URL with Leonel, Mpofu, Leroy, and Mom — they can bookmark it on their phones and use it like an app.

---

## Deploy Free on Netlify (alternative)

1. Run `npm run build` locally
2. Go to https://netlify.com → "Add new site" → "Deploy manually"
3. Drag the `build/` folder into the Netlify drop zone
4. Done — you get a URL instantly

---

## Add to Home Screen (mobile app feel)

**Android (Chrome):**
1. Open the URL in Chrome
2. Tap the 3-dot menu → "Add to Home screen"
3. Tap "Add"

**iPhone (Safari):**
1. Open the URL in Safari
2. Tap the Share icon (box with arrow)
3. Tap "Add to Home Screen"
4. Tap "Add"

The app icon will appear on the home screen just like a regular app.

---

## Data & Privacy

- All data is stored **locally in the browser** (localStorage)
- No server, no cloud, no account needed
- Each device maintains its own copy — family members log on their own phones
- To share data between devices, use the Excel file as the source of truth

---

## Customise

Edit `src/data/initialData.js` to change:
- `MEMBERS` — family member names
- `CATEGORIES` — expense categories and budgets
- `PROJECTS` — project names and targets

---

## Tech Stack

- React 18
- CSS custom properties (no UI framework)
- localStorage for persistence
- Deployable on Vercel / Netlify for free
