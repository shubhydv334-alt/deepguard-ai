<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-61dafb?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/Vite-5.4-646cff?style=flat-square&logo=vite" />
  
  <img src="https://img.shields.io/badge/Status-Prototype-c5f82a?style=flat-square" />
</p>

<h1 align="center">🛡️ DeepGuard AI</h1>
<p align="center"><strong>AI-Powered Deepfake Detection & Media Authenticity Platform</strong></p>
<p align="center">Detect manipulated media in real-time using multi-layer AI analysis — facial movements, audio-visual sync, pixel forensics, and more.</p>

---

## 🚀 The Problem

Deepfake content has grown **550%** since 2019 (World Economic Forum). Synthetic identity fraud is projected to cause **$26B in losses by 2027** (Deloitte). Yet **71% of people globally** don't even know what deepfakes are (iProov).

**DeepGuard AI** is a browser-based deepfake detection platform that empowers journalists, legal professionals, educators, and everyday users to verify media authenticity — instantly, privately, and for free.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 📤 **Media Upload Analysis** | Drag & drop images/videos for multi-factor AI analysis with confidence scores & heatmap overlays |
| 🔗 **URL Scanner** | Paste any URL — media is auto-extracted and analyzed for manipulation artifacts |
| 📹 **Live Webcam Detection** | Real-time face tracking with WebRTC + Canvas overlay at 30fps |
| 🔐 **Verification Proof** | SHA-256 hash, confidence range, verdict badge, timestamp — copyable certificate |
| 📊 **Animated Statistics** | Real-world deepfake statistics with animated counters and sourced data |
| ⚡ **6 Detection Techniques** | Facial analysis, audio-visual sync, pixel forensics, metadata scan, temporal coherence, GAN artifact detection |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 + Vite 5 |
| **Styling** | CSS Modules, CSS Variables (custom design system) |
| **Camera** | WebRTC (`getUserMedia`) |
| **Overlays** | Canvas API (face tracking, scan lines, feature mesh) |
| **Typography** | Space Grotesk, Inter, JetBrains Mono (Google Fonts) |
| **Design System** | Custom "Matiks" — Deep Charcoal + Neon Lime palette |

> **No external UI libraries.** Everything is hand-crafted CSS with glassmorphism, micro-animations, and staggered scroll reveals.

---

## 📁 Project Structure

```
deepguard-ai/
├── public/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx / .css        # Navigation with scroll blur
│   │   ├── Hero.jsx / .css          # Animated hero with typing effect
│   │   ├── Features.jsx / .css      # 6 capability cards with shine effect
│   │   ├── HowItWorks.jsx / .css    # 4-step timeline
│   │   ├── UploadAnalysis.jsx / .css # Drag-drop + radial gauge + heatmap
│   │   ├── UrlScanner.jsx / .css    # URL input + progress + results
│   │   ├── LiveDemo.jsx / .css      # WebRTC webcam + canvas overlay
│   │   ├── Stats.jsx / .css         # Animated counters + use cases
│   │   ├── Team.jsx / .css          # Team member cards
│   │   ├── Footer.jsx / .css        # Brand footer
│   │   ├── ParticleCanvas.jsx       # Background particle animation
│   │   └── VerificationProof.jsx / .css # Shared verification panel
│   ├── App.jsx                      # Root component + scroll observer
│   ├── index.css                    # Global design system
│   └── main.jsx                     # Entry point
├── package.json
├── vite.config.js
└── README.md
```

---

## ⚡ Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-username/deepguard-ai.git
cd deepguard-ai

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev

# 4. Open in browser
# → http://localhost:5173
```

### Production Build

```bash
npm run build
npm run preview
```

---

## 🎯 How It Works

```
┌──────────────┐    ┌──────────────────┐    ┌───────────────────┐
│  Upload Media │───▶│  Multi-Layer AI   │───▶│  Visual Results   │
│  or Paste URL │    │  Analysis Pipeline │    │  + Verification   │
│  or Webcam    │    │                    │    │    Certificate    │
└──────────────┘    └──────────────────┘    └───────────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        Facial Mesh   Audio-Visual  Pixel-Level
        Analysis      Sync Check    Forensics
              │            │            │
              ▼            ▼            ▼
        Metadata      Temporal      GAN Artifact
        Scan          Coherence     Detection
```

---

## 🎨 Design Highlights

- **Matiks-Inspired Dark Mode** — Deep Charcoal (`#141414`) + Neon Lime (`#c5f82a`) palette
- **Glassmorphism** — Card backgrounds with `backdrop-filter: blur()` and subtle borders
- **Staggered Scroll Reveals** — Cards animate in one-by-one with `100ms` delays
- **Section Dividers** — Glowing lime gradient lines between sections
- **Micro-Animations** — Floating badges, card shine sweeps, CTA pulse rings
- **Responsive** — Full mobile support with hamburger nav and stacked grids

---

## 🔐 Verification System

Every scan generates a **Verification Certificate** containing:

- ✅ Authenticity Score with ± confidence range
- ✅ SHA-256 verification hash
- ✅ Analysis timestamp
- ✅ Unique Session ID
- ✅ Verdict badge (Authentic / Manipulated)
- ✅ One-click **Copy Proof** to clipboard

---

## 📱 Use Cases

| Sector | Application |
|---|---|
| 📰 **Journalism** | Verify user-submitted footage before publishing |
| 🏛️ **Legal** | Authenticate digital evidence in court proceedings |
| 🏢 **Corporate** | Protect against CEO deepfake voice scams |
| 📱 **Social Platforms** | Flag synthetic media in moderation pipelines |
| 🎓 **Education** | Teach media literacy and deepfake awareness |
| 🔐 **Identity (KYC)** | Liveness detection for verification flows |

---

## 👥 Team
| Name               | Role                                         | Key Responsibilities                                                                                                                          |
| ------------------ | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Ved Rane**       | Full-Stack Lead                | Overall system architecture, backend APIs, frontend integration, deployment setup, and end-to-end demo stability                              |
| **Sushant Zanwar** | Full-Stack                    | Feature development, UI integration, comparison views, live webcam flow, performance tuning                                                   |
| **Shubham Yadav**  | **AI Workflow, UI/UX Integration & Testing** | Deepfake detection workflow design, AI result interpretation, UI/UX integration with AI outputs, test cases, validation, and demo reliability |



---



<p align="center">
  <strong>DeepGuard AI</strong> — Protecting truth in the age of synthetic media.
</p>
