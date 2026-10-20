# LinkPulse — Every Link, a Living Signal ⚡

> **Presented by Team Brocoderz** · Graphic Era Hill University (Haldwani Campus)  
> **Team Members:**  
> - **Mohit Dubey** — Frontend · UI/UX (B.Tech 4th Year CSE)  
> - **Raj Rai** — Backend (B.Tech 3rd Year ECE)  
> - **Vageesh Raj** — Data & Analytics (B.Tech 3rd Year ECE)  
> - **Shivanshu Mishra** — DevOps · Testing (MCA 2nd Year)  
> - **Sanchay Naresh Gupta** — Team Leader (B.Tech 4th Year)

---

## 🎯 What Evaluators Must Notice & Inspect

LinkPulse is not just a URL shortener (`code → URL`). It is an end-to-end **URL Lifecycle, Analytics, and Governance Platform**.

Here is what the evaluator should test in order:

### 1. The Interactive Slide 8 Guided Tour (Top Bar)
- **Scenario A (Creation → Analytics)**:
  1. Click **1: Festive Campaign** → Automatically initializes the "Festive Sale 2026" campaign with full UTM parameters.
  2. Click **2: Alias Collision** → Opens the Creation Wizard with alias `festive26` taken, immediately displaying smart AI suggestions (`festive-89`, `go-festive`, `festive-link`).
  3. Click **3: Cap + QR** → Deploys the link with a strict 500-click cap and renders a downloadable mobile QR code.
  4. Click **4: Traffic + Bot** → Generates simulated desktop traffic, mobile traffic, and a **WhatsApp Preview Bot** visit.
  5. Click **5: Clean Analytics** → The dashboard updates live: human clicks increase, but the WhatsApp preview scraper is classified as a preview and **excluded from the human click count**.
- **Scenario B (Bulk Import → Takedown)**:
  1. Click **1: 50-Row CSV** → Loads a 50-row payload into the dry-run inspection engine.
  2. Click **2: Flag Issues** → Instantly isolates **3 duplicate aliases** and **2 unsafe/phishing URLs** (`paypa1.com`).
  3. Click **3: Commit 45 Valid** → Commits the 45 valid links in a single atomic batch.
  4. Click **4: Traffic Spike** → Simulates viral burst traffic, triggering an automated **Pulse Spike Alert**.
  5. Click **5: 1s Kill-Switch** → Admin disables the link. The Redis routing cache is evicted, delivering `HTTP 410 Blocked` instantly while **100% of historical analytics are kept intact**.

---

### 2. The 7-Step Explainable Redirect Pipeline (`/r/[code]`)
Every redirect evaluates through a strict deterministic order:
```
1. Resolve (Cache/DB) 
   ↳ 2. Safety Shield (5-hop & lookalikes) 
      ↳ 3. Status (Active vs Paused) 
         ↳ 4. Expiry (Window check) 
            ↳ 5. Click Cap (Atomic Lua INCR) 
               ↳ 6. Password Gate (Argon2 / Passcode) 
                  ↳ 7. Device Route (Mobile vs Desktop) 
                     ↳ 302 Destination (< 20ms Hot-Path)
```
- **Auditable "Why" Trace**: Every single visit logs an explainable trace: `SUCCESS_DESKTOP`, `SUCCESS_MOBILE`, `CAP_REACHED`, `PASSWORD_REQUIRED`, `SAFETY_BLOCKED`, `EXPIRED`, etc.
- **Dedicated Edge Case Screens**:
  - `http://localhost:3000/r/brocoderz-vault` → Step 6: Cyber Passcode Gate (passcode: `pulse`).
  - `http://localhost:3000/r/vip-launch` → Step 5: Quota Full (`100/100` slots claimed; click #101 rejected).
  - `http://localhost:3000/r/midnight-glitch` → Step 4: Expiration Window Closed screen.
  - `http://localhost:3000/r/paypa1-verify-bill` → Step 2: Safety Shield Quarantine screen (phishing lookalike blocked).

---

### 3. Interactive Redirect Simulator (Top Header)
- Click **Simulator** or **Test Hot-Path** in the top bar.
- Choose any link in the system.
- Switch between real-world visitor profiles:
  - **Desktop Chrome User**
  - **iPhone Mobile Visitor** (tests Step 7 mobile alternate URL)
  - **WhatsApp Link Preview Bot** (tests preview scraper isolation)
  - **Slackbot Link-Expanding Crawler**
  - **Headless Scraper / Bot**
- Click **Run 7-Step Pipeline Simulation** to view the step-by-step execution matrix and live hot-path latency (< 20ms).

---

### 4. Admin 1-Second Kill-Switch
- Switch the user role in the top-right corner to **ADMIN**.
- In the **Links & Governance** tab or inside any link details modal, click **1s Kill-Switch**.
- The link is immediately quarantined:
  - Cache is evicted in `< 1s`.
  - All subsequent visits receive `HTTP 410 Blocked`.
  - **Crucial**: Historical analytics, click graphs, and audit traces remain 100% intact!

---

### 5. Multi-Pillar Pulse Score (0–100)
Every link has a dynamic real-time health score computed across 4 pillars:
- **Safety Rating (30 pts)**
- **Cap Headroom (25 pts)**
- **Expiry Runway (25 pts)**
- **Traffic Health & Bot Ratio (20 pts)**

---

## 💻 Step-by-Step Instructions to Run Locally

### Prerequisites
- **Node.js**: v18.17.0 or higher (v20+ recommended)
- **npm**: v9+ or higher

### Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Mohit-procoder/Link-Shortener-BroCoderz.git
   cd Link-Shortener-BroCoderz
   ```

2. **Install all dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open in your browser:**
   ```
   http://localhost:3000
   ```

5. **Build for production (optional check):**
   ```bash
   npm run build
   npm run start
   ```

---

## 📂 Project Architecture

```
linkshortner/
├── src/
│   ├── app/
│   │   ├── layout.tsx         # App layout with Geist typography & SEO metadata
│   │   ├── globals.css        # Cyber-editorial styling & custom scrollbars
│   │   ├── page.tsx           # Primary dashboard assembling all views & modals
│   │   └── r/[code]/page.tsx  # Dynamic 7-step redirect execution & edge case screens
│   ├── components/
│   │   ├── Navbar.tsx         # Header with Brocoderz team badge & role switcher
│   │   ├── ScenarioBar.tsx    # Slide 8 interactive Scenarios A & B runner
│   │   ├── AnalyticsView.tsx  # Live Recharts, mobile share, and event stream
│   │   ├── LinksTableView.tsx # Links table with Pulse Score rings & kill-switch
│   │   ├── AuditLogView.tsx   # 7-step explainable rule decision ledger
│   │   ├── CampaignsView.tsx  # UTM campaign hubs & attribution
│   │   ├── CreateLinkModal.tsx # 2-step wizard, alias collision & QR studio
│   │   ├── BulkImportModal.tsx# CSV dry-run inspection & batch commit
│   │   ├── RedirectSimulatorModal.tsx # UA & bot testing studio
│   │   ├── LinkDetailsModal.tsx # Detailed view, QR download & kill-switch
│   │   ├── AlertsDrawer.tsx   # Traffic spike anomaly alert feed
│   │   └── PulseScoreRing.tsx # 0-100 circular gauge indicator
│   ├── lib/
│   │   ├── redirectEngine.ts  # 7-step deterministic routing engine
│   │   ├── safety.ts          # 5-hop scanner & lookalike typosquatting detector
│   │   ├── botDetector.ts     # User-Agent parser & preview scraper filter
│   │   ├── pulseScore.ts      # Multi-pillar 0-100 scoring & spike detector
│   │   └── store.ts           # Central reactive state manager & seed data
│   └── types/
│       └── index.ts           # TypeScript interfaces for Link, Rules, Clicks, Alerts
└── package.json
```

---

*“Declare variables, not war.” — Team Brocoderz*
