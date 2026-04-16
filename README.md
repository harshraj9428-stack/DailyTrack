# ⏳ DailyTrack — AI Routine Tracker

DailyTrack is a polished, single-page routine and productivity tracker built for IIT Patna CS/DA students. It combines a task manager, efficiency analytics, streak tracking, and an optional local-AI assistant powered by Ollama via a lightweight FastAPI backend.

![DailyTrack UI](https://img.shields.io/badge/UI-Glassmorphism-blue) ![Stack](https://img.shields.io/badge/Stack-HTML5%20%7C%20Vanilla%20JS%20%7C%20FastAPI-success) 

## ✨ Features
- **Task Management**: Seamlessly add, complete, delete, clear completed, and complete-all actions.
- **Efficiency Analytics**: Live stats cards, dynamic progress rings, and intelligent status messaging.
- **Streak Tracking**: Built-in logic with day-over-day carry-forward of incomplete tasks.
- **Task Library**: A modal packed with curated student-focused productivity categories.
- **AI Assistant Panel**: Interacts with your local LLM (llama3.2) to:
  - Break down complex tasks into subtasks.
  - Plan a structured, time-blocked day.
  - Provide productivity coaching tips.
  - Automatically prioritize pending tasks based on efficiency.

## 🛠️ Tech Stack
- **Frontend**: `index.html`, `style.css` (Glassmorphism), vanilla JavaScript modules in `JS/`.
- **Backend**: FastAPI (`backend/main.py`) serving as a robust proxy for Ollama requests.
- **Storage**: Browser `localStorage` for privacy and offline persistence.

## 📁 Project Structure
- `index.html` – Main UI markup, layout, and SEO tags.
- `style.css` – Premium Glassmorphism UI theme, layout, and micro-animations.
- `JS/app.js` – App bootstrap and event wiring.
- `JS/tasks.js` – Task state, persistence, and DOM rendering.
- `JS/utils.js` – Helpers, toast notifications, date formatting, and streak logic.
- `JS/modal.js` – Task library modal logic.
- `JS/dataset.js` – Prebuilt dataset for the task library.
- `JS/ai.js` – Local LLM integration handling the "AI Coach" interactions.
- `backend/main.py` – FastAPI `/chat` endpoint connecting the frontend to Ollama.
- `run.bat` – One-click execution script for Windows environments.

## 🚀 Running The App

### Prerequisites
- [Python 3.10+](https://www.python.org/downloads/) installed.
- [Ollama](https://ollama.com/) installed (if you want the AI features).

### 🏆 Recommended: Windows 1-Click Start
We've included an automated launch script for Windows users.
1. Simply double-click **`run.bat`** in the project folder.
2. The script will automatically:
   - Create your Python virtual environment if it's missing.
   - Install backend dependencies.
   - Launch your FastAPI backend.
   - Start your frontend server.
   - Boot up Ollama and automatically open `localhost:5500` in your browser.

### Option A: Manual Terminal Start (All OS)

#### 1) Start Ollama (local LLM)
Make sure Ollama is installed and run:
```bash
ollama serve
ollama pull llama3.2:3b-instruct-q4_K_M
```

#### 2) Start the FastAPI backend
From the root directory, create and activate a virtual environment:
```bash
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

pip install fastapi uvicorn requests
uvicorn backend.main:app --reload --port 8000
```
> The frontend talks to `http://localhost:8000/chat` by default. You can change the model targeted in the UI if you have a different local model loaded.

#### 3) Open the frontend
Run a local static server to serve the frontend:
```bash
python -m http.server 5500
```
Then visit: [http://localhost:5500](http://localhost:5500)

## 🩺 Troubleshooting
- **AI Connection Errors**: Ensure `ollama serve` is running in the background and the FastAPI backend is running simultaneously on port `8000` without blockages.
- The backend natively expects Ollama at `http://127.0.0.1:11434/api/chat`.

## 💡 Usage Notes
- Tasks are strictly stored in standard `localStorage`, meaning privacy is maintained and your list persists natively across browser reloads without external databases.
- If you leave tasks unfinished, returning the next day will automatically register them as **carried forward** and recalculate your productive streak.
- The “Add Work” modal template heavily relies on data defined in `JS/dataset.js`.

## 🎓 Credits
Built by **Harsh Raj** — IIT Patna (Capstone-I).
