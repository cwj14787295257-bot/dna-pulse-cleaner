# DNA Pulse Cleaner — Project Architecture & Codex Handover Specification

> **Target Audience**: AI Agents (Codex / Copilot / Claude / GPT) & Human Software Engineers  
> **Repository Name**: `dna-pulse-cleaner`  
> **Project Type**: Zero-dependency, pure static single-page Web application (SPA)  
> **Live Target**: GitHub Pages (HTTPS root hosting)  
> **Last Updated**: 2026-11-17  

---

## 1. Executive Summary & Domain Fundamentals

### 1.1 Project Purpose
**DNA Pulse Cleaner** is a specialized, zero-driver web application engineered for electronic rebuildable atomizers (specifically Genesis-style stainless steel mesh and high-precision Ni80/SS micro-coils) powered by **Evolv DNA** chipsets. It automates and monitors high-frequency pulse firing at **15.0W** tailored for **Hydrogen Peroxide ($H_2O_2$) quenching and cavitation de-carbonization (双氧水微爆淬火除积碳)**.

### 1.2 Domain Physics & Chemical Cleaning Kinetics
1. **The Carbon Deposition Problem**: Over continuous use, e-liquid caramelization produces non-conductive carbonaceous crusts, leading to inter-turn shorting, hot spots, and erratic coil resistance.
2. **$H_2O_2$ Thermal Cavitation Reaction**:
   - The coil is pulsed at **15.0W** to reach a moderate annealing/dark-red thermal zone.
   - Droplets of 3% medical-grade Hydrogen Peroxide ($H_2O_2$) are dripped onto the red-hot wire.
   - The catalytic thermal decomposition $2H_2O_2 \xrightarrow{\Delta} 2H_2O + O_2 \uparrow + [O]$ generates nascent atomic oxygen and violent micro-steam vapor explosions.
   - This physically fractures and chemically oxidizes carbon crusts without mechanical abrasive scraping.
3. **The Thermodynamic Duty Cycle**:
   - **Liquid Cooling Effect**: Evaporating $H_2O_2$ acts as an intense latent heat sink, rapidly dropping coil temperature.
   - **Fast Pulse Cadence**: The system uses a continuous cycle of **600ms firing** followed by an **ultra-short 200ms pause**. The short pause maintains the boiling reaction zone without thermal dissipation or filament burnout.
   - **Settlement & Thermal Recovery**: Upon stopping, a 1000ms delay is enforced to allow residual liquid evaporation before polling cold resistance $R_{\text{cold}}$ to measure cleaning efficacy ($\Delta R$).

---

## 2. System Architecture & File Tree

The project is intentionally structured as a **self-contained static application** with zero build steps (no Webpack, Vite, or npm bundle required). This guarantees instant deployment to GitHub Pages and offline portability.

```
dna-pulse-cleaner/
├── index.html                 # Complete Single-Page Application (HTML5 + CSS3 + ES6 JS)
├── README.md                  # Bilingual (EN/ZH) user documentation, science guide & setup
├── LICENSE                    # MIT License
├── CODEX_HANDOVER.md          # This architecture specification for Codex / developers
├── preview.js                 # Zero-dependency local Node.js HTTP server (port 8080)
├── verify_syntax.js           # Node.js VM syntax check on inline scripts
├── verify_dom_elements.js     # DOM ID and function signature regression test
├── test_e2e_simulation.js     # 14-phase comprehensive browser sandbox test suite
└── .gitignore                 # Standard Git ignore rules
```

---

## 3. Hardware & Serial Communication Protocol (Evolv DNA)

### 3.1 USB Topology & Endpoints
- **Vendor ID (VID)**: `0x268B` (Dimension Engineering LLC / Evolv LLC)
- **Supported Chips**: Evolv DNA 60, DNA 75, DNA 200, DNA 250, DNA 75C, DNA 250C, DNA 100C, DNA 60C, DNA 80C.
- **USB Composite Interface**:
  - `Interface 0`: USB HID (Report IDs `0xA0`/`0xA4`) for EEPROM and firmware flashing.
  - `Interface 1`: **USB CDC-ACM Virtual Serial** (115200 bps, 8-N-1) for live telemetry and real-time firing commands.

### 3.2 Wire-Level ASCII Command Set
Communication is executed over Web Serial (`navigator.serial`) using newline-delimited ASCII strings:

| Command | Direction | Payload Example | Purpose |
|---|---|---|---|
| `P=` | Host $\to$ Device | `P=15.0W\r\n` | Sets target firing wattage. |
| `F=` | Host $\to$ Device | `F=0.60S\r\n` | Triggers timed pulse fire in seconds. |
| `F=OFF` | Host $\to$ Device | `F=OFF\r\n` | **Emergency Cutoff**: Immediately shuts down power output. |
| `R=GET` | Host $\to$ Device | `R=GET\r\n` | Queries instantaneous coil cold/hot resistance. |
| `R=` | Device $\to$ Host | `R=0.245\r\n` | Device response reporting resistance in Ohms ($\Omega$). |
| `B=GET` | Host $\to$ Device | `B=GET\r\n` | Queries battery cell voltage and total pack voltage. |
| `T=GET` | Host $\to$ Device | `T=GET\r\n` | Queries coil temperature ($^\circ\text{F}$) and board temp. |
| `R=RESAMPLE` | Host $\to$ Device | `R=RESAMPLE\r\n` | Forces DNA chip to sample a fresh base resistance. |

### 3.3 Priority Dispatch & Urgent Serial Bypass
In `index.html`, the function `sendSerialCmd(cmd, isUrgent)` implements an **Urgent Priority Queue**:
- **Normal Telemetry (`R=GET`, `B=GET`)**: Appended sequentially to `serialWriteQueue` Promise chain to avoid colliding with device read buffers.
- **Urgent Abort (`F=OFF`, `isUrgent = true`)**: Bypasses pending queue items immediately by writing directly to the underlying `serialWriter`, guaranteeing **sub-millisecond shutoff** upon manual pause or safety timeout trip.

---

## 4. Finite State Machine (FSM) & Control Loop

### 4.1 FSM State Diagram

```
       +-------------------------------------------------------+
       |                                                       |
       v                                                       |
  [ IDLE_STANDBY ] --- (Click "单次测试") ------------------> [ ONESHOT_PULSE ]
       |                                                       |
       | (Click "启动清洁" / Spacebar)                          | Pulse Finished
       v                                                       v
  [ MEASURE_PRE_R ]                                       [ IDLE_STANDBY ]
       |
       v
+--> [ FIRING_PHASE ] (P=15.0W, F=0.60S, 25ms timer updates)
|      |
|      v (Pulse Complete or Mid-Pulse Timeout)
|    [ COOLDOWN_PHASE ] (Pause 200ms, query R=GET, stream to Canvas)
|      |
+------+ (While elapsed < timeoutSec && !abortRequested)
       |
       | (Stop Requested / Timeout Tripped)
       v
  [ URGENT_SHUTOFF ] (sendSerialCmd('F=OFF', true))
       |
       v
  [ SETTLE_PHASE ] (Wait 1000ms for droplet vaporization & thermal decay)
       |
       v
  [ MEASURE_POST_R ] (Query R=GET -> Compute Delta R -> Render Settle Card)
       |
       v
  [ IDLE_STANDBY ] (Optional: Adopt Post R as new benchmark)
```

### 4.2 Mutex Locks & Safety Constraints
- `isCleaningRunning`: Set `true` during continuous loop.
- `isCleaningOneShotRunning`: Set `true` during single pulse; prevents re-entrant clicks.
- `isCleaningSettling`: Set `true` during the 1.0s settle window; prevents re-starting until thermal recovery completes.
- **Safety Timeout**: Default 30.0s (options: 15s, 30s, 60s, continuous). Checked every 25ms inside firing pulse and during cooldown pauses.
- **Input Boundary Clamping**:
  - `Power`: `[10.0W, 25.0W]` (step: 0.5W)
  - `Pulse Width`: `[300ms, 1200ms]` (step: 50ms)
  - `Pause Duration`: `[100ms, 500ms]` (step: 50ms)

---

## 5. UI Architecture & Canvas Rendering Pipeline

### 5.1 Design System Tokens
Strictly adheres to Apple Dark/Light Adaptive Minimalism:
- **Dark Mode**: Background `#000000`, Secondary Card `#141416` / `#1D1D1F`, Border `rgba(255,255,255,0.08)`.
- **Light Mode**: Background `#F5F5F7`, Secondary Card `#FFFFFF`, Border `rgba(0,0,0,0.08)`.
- **Accent Color**: `#0071E3` (Apple System Blue).
- **Typography**: `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif`.

### 5.2 60 FPS Real-Time Canvas Oscilloscope (`startOscilloscopeLoop`)
- **Memory Thrashing Optimization**: Unlike naive implementations, `canvas.width` and `canvas.height` are **never** reassigned inside the 60 FPS loop. Container dimensions are cached (`lastCanvasW`, `lastCanvasH`), and resize events trigger backing store updates only when bounding rectangles actually change.
- **Rendering Layers**:
  1. Subtle dark grid lines with micro-scale amplitude ticks.
  2. Baseline cold resistance dashed line.
  3. Real-time dynamic resistance curve ($R_{\text{live}}$) showing droplet quenching drops.
  4. Semi-transparent filled wattage step waveform ($P_{\text{live}}$).

---

## 6. Verification & Automated Testing Suite

The repository contains three regression test scripts that run in Node.js:

### 6.1 Running the Test Suite
```bash
# 1. Syntax compilation check
node verify_syntax.js

# 2. DOM ID & function signature integrity check
node verify_dom_elements.js

# 3. Full 14-phase E2E sandbox simulation
node test_e2e_simulation.js
```

### 6.2 Test Coverage Matrix
| Suite | Target | Asserts | Description |
|---|---|---|---|
| `verify_syntax.js` | `index.html` inline script | 0 syntax errors | Uses Node.js `vm.Script` to parse 42KB+ JS payload. |
| `verify_dom_elements.js` | Element & Function IDs | 50 DOM IDs, 40 Functions | Asserts all control buttons, tiles, inputs, and functions exist. |
| `test_e2e_simulation.js` | Full Sandbox Workflow | 14 test phases | Validates connection, pulses, settlement card, $\Delta R$ math, boundary clamping, urgent queue bypass, and thermal zones. |

---

## 7. Deployment & GitHub Pages Operation Manual

### 7.1 Security Requirement: Web Serial HTTPS
The Web Serial API (`navigator.serial`) **strictly requires** a Secure Context:
- Permitted in `https://...` or `http://localhost:...`.
- **Forbidden** on standard unencrypted `http://...` IP addresses or `file://` protocols in certain browsers.
- **GitHub Pages** natively provides free, automated SSL/TLS certificates (`https://<user>.github.io/<repo>/`), satisfying all browser security requirements out of the box.

### 7.2 Step-by-Step GitHub Push & Pages Activation
When you are ready to publish:

```bash
# Step 1: Navigate to the standalone project directory
cd /Users/kali/Documents/rea/dna-pulse-cleaner

# Step 2: Create a new blank public repo on GitHub named "dna-pulse-cleaner"
# Step 3: Link remote origin and push main branch
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/dna-pulse-cleaner.git
git push -u origin main
```

**Activate GitHub Pages in GitHub Web UI**:
1. Open repository `https://github.com/<YOUR_GITHUB_USERNAME>/dna-pulse-cleaner`.
2. Navigate to **Settings** $\to$ **Pages**.
3. Under **Build and deployment** $\to$ **Branch**, select **`main`** and **`/ (root)`**.
4. Click **Save**.
5. Within 60 seconds, your live public HTTPS web station will be active at:  
   👉 `https://<YOUR_GITHUB_USERNAME>.github.io/dna-pulse-cleaner/`

---

## 8. Guidance & Actionable Roadmap for Codex

When Codex takes over this repository, here are recommended entry points for future enhancements:

1. **WebHID EEPROM Profile Integration**:
   - The CDC serial connection handles firing; Codex can incorporate WebHID (`0x268B`) to automatically sync the newly adopted cold ohms directly into DNA onboard EEPROM profiles 1–8.
2. **Exportable Cleaning Audit Logs (CSV / JSON)**:
   - Allow users to export historical timestamps, total pulse counts, energy consumed (J), and $\Delta R$ drops to track coil lifespan over months.
3. **Multi-Coil Profile Presets**:
   - Add dropdown presets for specific mesh gauges (e.g., #300 mesh, #400 mesh, #500 mesh, Ni80 28G alien) with pre-tuned pulse widths (400ms vs 800ms).
4. **PWA (Progressive Web App) Manifest**:
   - Add `manifest.json` and a lightweight service worker to enable "Install App" on Chromium Android tablets and macOS desktop.
