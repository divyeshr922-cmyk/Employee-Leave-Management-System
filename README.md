# Employee Leave Management System (ELMS)

An enterprise-grade workforce leave and attendance management platform with role-based governance, multi-tier approvals, live quota calculations, and tamper-evident audit logging. Built with **React 19**, **TypeScript**, **Tailwind CSS**, and **Vite**.

---

## 🚀 Quick Start

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+ or v20+ recommended)
- npm, yarn, or bun

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📋 Demo Credentials

| Role | User Name | Employee ID | Email / Shortcut | Password |
|---|---|---|---|---|
| **Administrator** | System Administrator | `ADM001` | `admin@elms.com` (or `admin`) | `admin123` |
| **Manager** | Alex Rivera | `MGR101` | `manager@elms.com` (or `manager`) | `manager123` |
| **Employee** | Sarah Jenkins | `EMP1001` | `employee@elms.com` (or `employee`) | `employee123` |

*Note: The login card also features 1-click **Demo Credentials** buttons for instant access without typing.*

---

## 📦 Production Build & Deployment Options

### 1. Build the Production Bundle
```bash
npm run build
```
Compiles and bundles optimized static assets into the `dist/` folder with vendor, icon, and animation code-splitting.

---

### 2. Deployment Targets

#### Option A: Vercel (Recommended Static Hosting)
1. Push this repository to GitHub/GitLab/Bitbucket.
2. Import the project into [Vercel](https://vercel.com).
3. The included [vercel.json](file:///c:/Users/Maa/Desktop/Project/employee-leave-management-system/vercel.json) automatically configures SPA rewrites to `/index.html`.
4. Build command: `npm run build` | Output directory: `dist`.

#### Option B: Netlify
1. Connect the repository to [Netlify](https://netlify.com).
2. The included [netlify.toml](file:///c:/Users/Maa/Desktop/Project/employee-leave-management-system/netlify.toml) and [public/_redirects](file:///c:/Users/Maa/Desktop/Project/employee-leave-management-system/public/_redirects) automatically configure build settings (`dist`) and SPA 200 redirects.

#### Option C: Docker / Container Platforms (Cloud Run, AWS ECS, Render, Railway, Fly.io)
Build and run using the included production [Dockerfile](file:///c:/Users/Maa/Desktop/Project/employee-leave-management-system/Dockerfile):

```bash
# Build the production Docker image
docker build -t elms-workforce .

# Run the container on port 3000
docker run -p 3000:3000 elms-workforce
```

- **Health Check Endpoint**: `GET /health` (returns JSON service status, uptime, and timestamp).
- **Environment Variables**:
  - `PORT`: Server port (defaults to `3000`).
  - `NODE_ENV`: Set to `production`.

#### Option D: Node.js / Express Self-Hosting (VPS, EC2, DigitalOcean)
```bash
npm ci
npm run build
npm start
```
Starts the production Express server at `http://0.0.0.0:3000` with static caching and SPA routing.

---

## 🛠️ Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts Vite development server on port 3000 with HMR |
| `npm run build` | Builds optimized production bundle in `dist/` |
| `npm start` | Launches Node.js / Express production server serving `dist/` |
| `npm run preview` | Previews the production build locally using Vite |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) with 0 errors |

---

## 🔒 Security & Governance
- **Zero Portal Switching UI**: Role-based routing enforces strict portal isolation. Users are routed directly to their authorized portal based on entered credentials.
- **Audit Logging**: Tamper-evident trail tracks system initialization, leave decisions, and credential events.
- **Enterprise Design**: Clean, modern typography (Plus Jakarta Sans), high-contrast accessible layouts, and mobile-first responsive transforms.
