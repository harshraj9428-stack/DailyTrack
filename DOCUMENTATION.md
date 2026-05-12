# 🚀 DailyTrack: Comprehensive Project Documentation

**IIT Patna Capstone-I | Harsh Raj (ua2503cdh411)**

DailyTrack is a production-grade, AI-powered productivity suite designed specifically for students. It combines real-time task management with local AI coaching and cloud-based synchronization.

---

## 🏗️ System Architecture

The project follows a modern, decoupled architecture:

1.  **Frontend**: Vanilla JavaScript (ES6+), HTML5, and CSS3 with a "Glassmorphism" design system. No heavy frameworks are used to ensure maximum performance and zero build-step overhead.
2.  **Backend**: FastAPI (Python) serving as a proxy and orchestrator for local Large Language Models (LLMs).
3.  **AI Engine**: Ollama (local) running Llama 3.2 for secure, offline-first intelligence.
4.  **Database & Auth**: Google Firebase (Firestore for real-time cloud sync and Firebase Auth for secure user management).

---

## 📂 Project Structure

```text
CapStone_3.0/
├── backend/                # FastAPI Python Logic
│   ├── main.py             # API Endpoints & LLM proxy
│   └── requirements.txt    # Python dependencies
├── frontend/               # Web Application Root
│   ├── index.html          # Main Entry Point
│   └── assets/
│       ├── css/
│       │   └── style.css   # Premium Design System
│       └── js/
│           ├── auth.js     # Firebase Auth & Redirect logic
│           ├── firebase-config.js # Firebase Initialization
│           ├── tasks.js    # Task CRUD & Scoring logic
│           ├── ai.js       # AI Module & Ollama integration
│           ├── utils.js    # Global helpers (Toast, Dates)
│           ├── modal.js    # UI Modal management
│           └── dataset.js  # Pre-defined task library
├── run.bat                 # One-click multi-server runner
└── DOCUMENTATION.md        # This file
```

---

## 🔄 Core Workflows

### 1. Authentication & Security Workflow
- **Forced Login**: The app uses a "Gatekeeper" pattern. On load, a `loading-overlay` appears while verifying the session. If no user is found, the `welcome-overlay` is triggered with a 25px blur effect on the app shell.
- **Three-Tier Auth**: 
    - **Google OAuth**: Uses `signInWithRedirect` to bypass browser popup blockers.
    - **Email/Password**: Traditional secure account creation.
    - **Guest Mode**: Anonymous authentication for instant trial.
- **State Persistence**: Firebase `onAuthStateChanged` listens for session tokens, ensuring the user stays logged in even after refreshing.

### 2. Task Management Workflow (CRUD)
- **Local-First**: Tasks are saved to `localStorage` instantly for zero-latency UI updates.
- **Cloud-Sync**: Every change (Add/Delete/Toggle) triggers a background sync to Firebase Firestore if the user is authenticated.
- **Carry-Forward**: Upon the first load of a new day, the system automatically detects incomplete tasks from yesterday and migrates them to today's list with a "Carried" badge.

### 3. AI Intelligence Pipeline
- **Connection**: Frontend talks to FastAPI (`:8000`), which then communicates with Ollama (`:11434`).
- **Feature Set**:
    - **Task Breakdown**: Breaks complex goals into 15-30 minute actionable subtasks.
    - **Weekly Audit**: Analyzes 7-day efficiency history to generate a strategic coaching report.
    - **AI Coach**: A real-time chat interface for productivity advice.
    - **Priority Ranking**: Uses the LLM to rank tasks based on student-specific urgency.

### 4. Performance Scoring (The "Scorecard")
- **Efficiency Formula**: `(Completed / Total) * 100`.
- **IITP Grading Scale**: The app calculates a 7-day weighted average and assigns a grade:
    - **A+ to B**: High performance tiers.
    - **D to F**: Growth tiers.
    - **-- (Placeholder)**: Shown when no tasks are present to avoid penalizing new users.
- **Intelligent Grading**: The system differentiates between "No Tasks" (shows `--`) and "Failed Tasks" (shows `F`).
- **Visuals**: Real-time SVG Donut charts and Sparkline trend charts visualize these metrics.

---

## 🛠️ Setup & Execution

### Prerequisites
- Python 3.10+
- Ollama installed and running (`ollama serve`)
- Firebase project credentials (already integrated)

### Running the Project
Simply double-click the **`run.bat`** file. It will automatically:
1. Initialize a Python Virtual Environment (`.venv`).
2. Install all backend dependencies.
3. Start the FastAPI Backend.
4. Start a local Web Server for the Frontend.
5. Launch the application in your default browser at `http://localhost:5500`.

---

## 🛡️ Security & Privacy
- **Local AI**: All AI processing happens on your machine. Your data never leaves your system for AI training.
- **Secure Sync**: All cloud data is protected by Firebase Security Rules, ensuring only YOU can access your tasks.

---
*Created for the IIT Patna Capstone Project 2026.*
