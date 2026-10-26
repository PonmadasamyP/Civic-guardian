# 🛡️ Civic Guardian

> **Tagline:** *"Report the problem. Empower the community. Track the solution."*

Civic Guardian is a full-stack, mobile-first community civic problem reporting and resolution platform. It empowers citizens to identify and report local public infrastructure issues (damaged roads, broken streetlights, blocked drainage, overflowing garbage) with **cryptographic EXIF GPS verification**, preserves **complete citizen anonymity**, automatically **calculates priority scores & merges nearby duplicates**, and provides a **dual resolution pathway**: community citizen action (with 50m geotag proof) and government municipal authority dispatch.

---

## 🚀 Key Features

1. **Issue Reporting with EXIF Geotag Verification (`exifr` library)**:
   - Embedded GPS metadata is extracted directly from the uploaded photo using `exifr`.
   - Rejects photos with missing GPS metadata to prevent fake or downloaded images.
   - Compares photo GPS with the device's live browser location via the **Haversine formula**. If distance is $> 100\text{ m}$, flags the report as `"Unverified Location"`. If $\le 100\text{ m}$, awards the `"Verified Location"` badge.

2. **100% Citizen Anonymity & Privacy**:
   - Neither names, email addresses, phone numbers, nor user UUIDs are ever displayed or exposed in the UI or public API.
   - Public identity is anonymized with aliases (e.g., `Citizen #4821`).
   - Backed by **Supabase Row-Level Security (RLS)** and public sanitized views so even authorities and database queries cannot see the citizen's true identity.

3. **Dynamic Priority System & Duplicate Merging**:
   - Automatic mathematical priority score:
     $$\text{Priority Score} = (\text{reports within } 100\text{m radius of same category} \times 3) + \text{severity weight} + (\text{days pending} \times 0.5)$$
     where severity weights: $\text{Low} = 1$, $\text{Medium} = 2$, $\text{High} = 3$.
   - Duplicates within 100 meters are automatically detected and merged into one issue with a `"Reported by N citizens"` count.
   - Visual priority labels: `High Priority` ($\ge 8.0$), `Medium Priority` ($4.0 - 7.9$), `Low Priority` ($< 4.0$).

4. **Community Action ("I'll solve this")**:
   - For manageable civic problems, community members can step up without waiting for municipal intervention.
   - Status transitions from `Pending` $\to$ `In Progress`.

5. **Proof of Resolution (< 50m GPS verification)**:
   - Solver uploads an "after" photo.
   - Photo is verified using `exifr` and must be taken within **50 meters** of the original problem spot.
   - Interactive Before & After comparison slider with side-by-side mode.
   - Issue transitions to `Resolved`.

6. **Credit Points & Gamified Leaderboard**:
   - Verified report: $+15\text{ pts}$
   - Nearby duplicate confirmation: $+5\text{ to }+10\text{ pts}$
   - Verified community resolution: $+50\text{ pts}$
   - Hall of Fame leaderboard and unlockable badges (`First Step`, `Eagle Eye`, `Community Hero`, `Master Guardian`, `Eco Champion`).

7. **Government Authority Command Dashboard**:
   - Hotspot / Heatmap cluster overlay on OpenStreetMap (Leaflet).
   - Priority filters, ward search, and work order dispatch.
   - Official municipal status updates with public remarks.

8. **End-to-End Tracking Timeline**:
   - Audit trail capturing each state transition (`REPORTED` $\to$ `LOCATION_VERIFIED` $\to$ `NEARBY_MERGED` $\to$ `CLAIMED_BY_CITIZEN` $\to$ `PROOF_SUBMITTED` $\to$ `RESOLVED`).

---

## 🛠️ Tech Stack

- **Frontend**: Vite + React 18 (TypeScript) + Tailwind CSS
- **Maps**: Leaflet.js + OpenStreetMap tiles
- **Metadata Extraction**: `exifr` (Exchangeable Image File Format parser)
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Row-Level Security)
- **Icons & Animation**: Lucide React + Canvas Confetti

---

## ⚙️ Setup & Installation

### 1. Prerequisites
- Node.js (v18 or higher)
- npm

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the project root (see `.env.example`):
```env
# Supabase Project Credentials
VITE_SUPABASE_URL=https://your-supabase-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Leaflet Tile Provider (OpenStreetMap by default)
VITE_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```
> **Note for Viva & Demo:** The application is architected with a resilient local persistence engine and pre-seeded realistic civic problems. If Supabase keys are not set, it operates seamlessly in local demo mode so presentations are 100% immune to network drops or setup delays!

### 4. Database Schema Setup (Supabase)
1. Open your Supabase Dashboard: [https://supabase.com](https://supabase.com)
2. Go to the **SQL Editor** tab.
3. Paste and run the contents of [`schema.sql`](./schema.sql).
4. The schema creates:
   - `profiles` table (anonymized aliases & credit points)
   - `issues` table (geotags, duplicate counters, priority score triggers)
   - `issue_timeline` table (audit milestones)
   - `haversine_distance()` PL/pgSQL function
   - `calculate_issue_priority()` trigger
   - Row-Level Security policies ensuring total citizen anonymity.

### 5. Run Development Server
```bash
npm run dev
```
Open your browser at: `http://localhost:5173`

---

## 🎓 College Viva Preparation Guide

### Q1: How does the Geotag Verification work in Civic Guardian?
**Answer:**
When an image is selected, the application uses the `exifr` library (`exifr.gps(file)`) to parse the binary EXIF metadata header embedded by digital cameras or smartphone sensors. It extracts `latitude` and `longitude`. If no GPS tags exist, the upload is rejected. Next, the app invokes `navigator.geolocation.getCurrentPosition()` to get the reporter's live coordinates. It applies the **Haversine formula** to measure the distance in meters. If the distance is $\le 100\text{ m}$, the report receives the green `"Verified Location"` badge; otherwise, it is flagged as unverified.

### Q2: What is the Haversine Formula and why is it used?
**Answer:**
The Haversine formula determines the great-circle distance between two points on a sphere given their longitudes and latitudes:
$$a = \sin^2\left(\frac{\Delta \varphi}{2}\right) + \cos(\varphi_1) \cdot \cos(\varphi_2) \cdot \sin^2\left(\frac{\Delta \lambda}{2}\right)$$
$$c = 2 \cdot \text{atan2}\left(\sqrt{a}, \sqrt{1-a}\right)$$
$$d = R \cdot c$$
where $R = 6,371,000\text{ meters}$. We use it in two critical stages:
1. Verifying that the reporter is within $100\text{ m}$ of the incident.
2. Verifying that the solver's "after" resolution photo is within $50\text{ m}$ of the original problem spot.

### Q3: How is Citizen Anonymity guaranteed with Supabase?
**Answer:**
1. The frontend never accepts or renders personal identifiers (name, email, phone). Each citizen is represented by a random pseudonym (e.g. `Citizen #4821`).
2. In Supabase, the `public_issues_feed` view and Row-Level Security (RLS) policies omit `reporter_id` and `solver_id` from public and authority queries. Even municipal officers only see `reporter_alias`.

### Q4: Explain the Priority Scoring Formula.
**Answer:**
$$\text{Priority Score} = (\text{reports within 100m} \times 3) + \text{severity weight} + (\text{days pending} \times 0.5)$$
- **Cluster Multiplier ($\times 3$):** If 3 citizens report potholes on the same stretch, $(3 \times 3) = 9$ points, reflecting high community distress.
- **Severity Weight:** Low $= 1$, Medium $= 2$, High $= 3$.
- **Aging Factor ($0.5/\text{day}$):** Unresolved issues accumulate $+0.5$ score every day to ensure neglected tickets naturally rise in priority.
- Issues with score $\ge 8.0$ are classified as **High Priority** and flagged on authority heatmaps.

### Q5: How does duplicate detection work?
**Answer:**
When a user submits a report, the system queries active issues of the same category. For each issue, it computes the Haversine distance from the new photo's GPS coordinates. If an issue is found within $100\text{ m}$, the system automatically merges the report, increments the `duplicate_count` by $1$, recalculates the priority score, appends a `NEARBY_MERGED` event to the timeline, and awards credit points to the confirming citizen.
