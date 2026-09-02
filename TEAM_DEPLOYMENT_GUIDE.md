# 🚀 ThermalWatch AI — Team Frontend & Deployment Guide

Welcome to the **ThermalWatch AI** frontend repository! This document covers everything you need to run the app locally, develop new features, and deploy updates to the live production website.

---

## 🌐 1. Live Websites & Dashboards

* **Primary Production URL:** [https://sih26ekaant.web.app](https://sih26ekaant.web.app)
* **Mirror Production URL:** [https://thermalwatch-india-3591.web.app](https://thermalwatch-india-3591.web.app)
* **Firebase Console (Monitoring & Rollbacks):** [https://console.firebase.google.com/project/thermalwatch-india-3591/hosting](https://console.firebase.google.com/project/thermalwatch-india-3591/hosting)
* **GitHub Repository:** [https://github.com/Vex-15/SIH26](https://github.com/Vex-15/SIH26)

---

## 💻 2. Local Development (Getting Started)

All website code is located inside the `frontend/` directory.

### Step 1: Clone the Repo
```bash
git clone https://github.com/Vex-15/SIH26.git
cd SIH26/frontend
```

### Step 2: Install & Run
```bash
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view the live local app.

---

## 🌿 3. Collaboration & Git Workflow

To prevent conflicts, we follow a standard feature-branch workflow:

1. **Create your feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Make your changes** inside `frontend/src/` or `frontend/public/`.
3. **Commit and push:**
   ```bash
   git add frontend/
   git commit -m "feat: added new telemetry feature"
   git push origin feature/your-feature-name
   ```
4. **Open a Pull Request (PR):**
   * Go to GitHub and open a PR from `feature/your-feature-name` into `main`.
   * Once reviewed, click **Merge**.

---

## 🚀 4. How Deployment Works

There are **two ways** to update the live website:

### Method A: Automated GitHub Actions (Push to `main`)
Whenever a PR is merged into `main`, GitHub Actions will automatically build the `frontend/` code and push the release to Firebase Hosting.

> **Note on Initial GitHub Action:**
> For the GitHub Action to connect to Firebase, the repo admin adds the Firebase key once under `GitHub Settings → Secrets → Actions` as `FIREBASE_SERVICE_ACCOUNT_THERMALWATCH_INDIA_3591`.

---

### Method B: Direct Terminal Deployment (Manual)
If you want to deploy your changes directly from your own computer:

1. **Log in to Firebase (one-time):**
   ```bash
   npx firebase-tools login
   ```
2. **Deploy directly to live site:**
   ```bash
   cd frontend
   npx firebase-tools deploy --only hosting:sih26ekaant
   ```

---

## 📁 5. Directory Structure Overview

```text
SIH26/
├── frontend/
│   ├── src/                 # All React + TypeScript UI components, hooks, map engines
│   ├── public/              # Static assets, GeoJSON data, and Favicons
│   ├── dist/                # Production build bundle
│   ├── package.json         # Frontend dependencies and scripts
│   └── vite.config.ts       # Vite configuration
├── .github/
│   └── workflows/
│       └── deploy.yml       # Automated CI/CD deployment pipeline
└── README.md
```

---

## ❓ 6. FAQ & Troubleshooting

* **Q: I deployed, but I still see the old version or old icon in my browser?**
  * *A:* Chrome aggressively caches static assets and favicons. Press **`Cmd + Shift + R`** (Mac) or **`Ctrl + Shift + R`** (Windows) to do a hard refresh, or test in an Incognito window.
* **Q: A GitHub Actions run failed. Did it break the live website?**
  * *A:* **No.** If a build or deployment job fails, Firebase Hosting never touches the live site. The existing live production site remains 100% active and safe.
