# Keepsafe Web App - Starter Templates Suite

Keepsafe is a community-driven safety platform for Kenyan commuters (geofence alerts, incident reports, SOS emergency dispatch).

This repository contains **3 starter web templates** sharing a unified logic and data model layer so you can compare design paradigms and choose the best layout for your needs.

---

## 🚀 Quick Start (Running Locally)

You can run the web app using any HTTP static server (e.g. Python):

```bash
# Navigate to the /web folder
cd web

# Start Python HTTP server on port 8000
python -m http.server 8000
```

Now open your browser at **`http://localhost:8000`** to view the **Template Switcher Page**.

---

## 🎨 Starter Templates Overview

### 1. **Template A: Minimal & Clean** (`/web/template-a/`)
- **Aesthetic**: Calm, civic & trustworthy (Slate Navy `#0f172a`, Trust Emerald `#059669`, Warm Amber `#d97706`).
- **Layout**: Top header navbar, centered 1200px max-width container, split map and card list.
- **SOS Action**: Sleek floating emergency pill button + header quick trigger.

### 2. **Template B: Command Center Dashboard** (`/web/template-b/`)
- **Aesthetic**: Dark-mode command UI (`#090d16` background, cyan telemetry indicators, high contrast).
- **Layout**: Fixed left navigation sidebar, central live map radar, right-hand live alerts drawer.
- **SOS Action**: Persistent pulsing red SOS emergency widget at top of sidebar.

### 3. **Template C: Bold & Modern Hero** (`/web/template-c/`)
- **Aesthetic**: Obsidian dark theme (`#0f051d`), vibrant crimson red (`#ef4444`) & coral orange (`#f97316`).
- **Layout**: Live danger ticker, full hero banner, giant pulse-animated SOS button, large visual card grids.
- **SOS Action**: Giant hero emergency pulse button + floating action bar.

---

## 📂 Architecture & Directory Structure

```
/web
├── index.html            # Root Template Switcher Page
├── PROGRESS.md           # Progress tracking log & mobile analysis summary
├── README.md             # This guide
├── shared/               # Shared logic & data layer
│   ├── types.js          # Shared types & constants
│   ├── mockData.js       # Kenyan commuter routes & incident mock dataset
│   ├── api.js            # Simulated async API client with LocalStorage persistence
│   ├── state.js          # Global reactive state manager
│   ├── mapComponent.js   # Interactive canvas map component
│   └── shared.css        # Common design tokens & badge styles
├── template-a/           # Minimal & Clean Starter (index.html, styles.css, app.js)
├── template-b/           # Command Center Dashboard Starter (index.html, styles.css, app.js)
└── template-c/           # Bold & Modern Hero Starter (index.html, styles.css, app.js)
```

---

## 🛡️ Core Features Across All Templates

1. **Live Safety Map & Geofences**: Visualizes Nairobi CBD, Thika Superhighway, Mombasa Road, Nakuru Highway fog alerts, and active incident markers.
2. **Report Incident Form**: Categorize hazards (Robbery, Harassment, Scam, Hazard, Weather) with Kenyan city/route taggers.
3. **Incident Verifications & Comments**: Community upvote system (5 upvotes mark an alert as verified) + commuter comment tips.
4. **Global 1-Tap SOS**: Triggers instant emergency location broadcasting to police (999/112) and Red Cross Ambulance (1199).
