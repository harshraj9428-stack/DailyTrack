# 📚 DailyTrack — Comprehensive Technical Documentation

DailyTrack is a sophisticated, privacy-focused productivity ecosystem designed for students (specifically tailored for IIT Patna CS/DA curricula). It leverages local AI to provide intelligent task management, efficiency analytics, and personalized coaching without compromising user data.

---

## 🏗 System Architecture

The project follows a **Decoupled 3-Tier Architecture** with a **Hybrid Cloud Persistence Layer**:

1.  **Frontend (Presentation Layer)**:
    *   **Tech Stack**: Vanilla HTML5, CSS3 (Glassmorphism), and ES6+ JavaScript.
    *   **Responsibility**: UI rendering, local state management, user interactions, and client-side data visualization.
    *   **Communication**: RESTful calls to FastAPI (AI) and Firebase SDK calls (Auth & DB).

2.  **Backend (Proxy Layer)**:
    *   **Tech Stack**: Python, FastAPI, Uvicorn.
    *   **Responsibility**: Proxy between frontend and local Ollama instance.
    *   **Endpoint**: `POST /chat`.

3.  **Cloud Layer (Persistence & Identity)**:
    *   **Tech Stack**: **Firebase Authentication** and **Firestore**.
    *   **Responsibility**: Manages user identity (Google, Email, Guest) and synchronizes task state across sessions.

4.  **Local AI (Intelligence Layer)**:
    *   **Engine**: Ollama.
    *   **Model**: `llama3.2:3b-instruct-q4_K_M`.

---

## 📁 Codebase Breakdown

### 🎨 Frontend (`/` & `/JS`)

*   **`index.html`**: Defines the "App Shell" using a panel-based grid layout. Includes sections for tasks, stats, and the AI coach.
*   **`style.css`**: Implements a "Premium Glassmorphism" theme. Key features:
    *   CSS Variables for easy theming (`--bg`, `--glass`, `--accent`).
    *   Responsive grid system (`suite-grid`).
    *   Custom animations for toasts and AI typing indicators.
*   **`JS/firebase-config.js`**: Initializes Firebase App, Auth, and Firestore using modern ESM imports.
*   **`JS/auth.js`**: Manages the authentication lifecycle. Handles tab switching between Login/Signup, Social Auth (Google), and Anonymous Auth (Guest). It also orchestrates the Firestore synchronization logic.
*   **`JS/app.js`**: The orchestration layer. Initializes modules and sets up global event listeners.
*   **`JS/tasks.js`**: The core logic engine.
    *   **State**: Manages the `tasks` array and `currentFilter`.
    *   **CRUD**: Handles adding, toggling, deleting, and clearing tasks.
    *   **Efficiency Logic**: Calculates the `(Completed / Total)` ratio and updates the dynamic SVG progress ring.
    *   **Analytics**: Manages historical efficiency data and renders the Monthly Trend (Line Chart) and Project Breakdown (Donut Chart).
*   **`JS/ai.js`**: Integration module for the LLM.
    *   Contains specific prompt templates for `breakdown`, `planday`, `coach`, and `prioritize`.
    *   Handles the `aiTaskBuffer` for batch-adding AI-generated tasks to the list.
*   **`JS/utils.js`**: Shared utilities for date formatting, HTML escaping, unique ID generation (`uid`), and the `Toast` notification system.
*   **`JS/dataset.js`**: A static library of common student tasks and categories (e.g., "DSA Practice", "Machine Learning Lab").

### 🐍 Backend (`/backend`)

*   **`main.py`**:
    *   Implements a FastAPI app with `CORSMiddleware`.
    *   `POST /chat`: Receives a JSON payload (model, messages), injects `stream: false`, and communicates with Ollama's API (`http://127.0.0.1:11434/api/chat`).
    *   Includes basic health checks and error handling for connection timeouts.

---

## 💾 Data Persistence Model

DailyTrack uses a **Hybrid Storage Model**.

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Primary** | `localStorage` | Immediate persistence for zero-latency UI updates. |
| **Cloud** | `Firestore` | Secure, authenticated backup of tasks and history. |

### 🔄 Cloud Sync Engine
The `saveDataToFirestore` function (in `auth.js`) is triggered whenever `tasks.js` calls `saveTasks()`.
1.  **Authentication Check**: Only active for logged-in users (including Guests).
2.  **Debouncing/Status**: Uses a `isSyncing` flag and updates the **Sync Indicator** UI in real-time.
3.  **Merge Strategy**: On login, the engine pulls the latest cloud state and overwrites the local `tasks` array to ensure consistency.

### 🔄 Carry-Forward Logic
When the app loads, it compares `dt_date` with today's date. If they differ:
1.  All incomplete tasks are cloned with a new ID and a `carried: true` flag.
2.  Completed tasks are archived (dropped from the active list).
3.  The `Streak` module checks if the last active day was *yesterday* to increment the streak or reset it.

---

## 🤖 AI Features & Prompts

The `AIModule` uses a `SYSTEM_PROMPT` to define the coach's persona:
> *"You are a helpful productivity assistant for IIT Patna Computer Science and Data Analytics students. Be concise, practical, and encouraging."*

### Key Workflows:
*   **Task Breakdown**: "Break down this task into 5-6 specific, actionable subtasks... Return ONLY a numbered list."
*   **Plan My Day**: "Create a time-blocked day schedule... from 7 AM to 11 PM. Include study blocks, breaks, meals, and exercise."
*   **Efficiency Coach**: Analyzes the current efficiency percentage and task list to provide 3-4 tailored tips.
*   **Weekly Audit**: Analyzes the last 7 days of efficiency history to provide a strategic performance review and grade.

---

## 📈 Analytics & Visualization

The app uses **Pure SVG** for all data visualizations, ensuring high performance and crisp rendering on all screens.

*   **Efficiency Ring**: Uses `stroke-dasharray` and `stroke-dashoffset` to animate the progress circle based on the percentage.
*   **Trend Chart**: Calculates a 30-day SVG polyline. The Y-axis is normalized to the `160px` height of the chart container.
*   **Donut Chart**: Segments are calculated using the circumference formula ($2 \pi r$) and offset based on the cumulative percentage of task categories.

---

## 🛠 Setup & Installation

### Option 1: Automated (Windows)
Run `run.bat`. It will handle venv creation, dependency installation, and server startup.

### Option 2: Manual
1.  **Backend**:
    ```bash
    pip install fastapi uvicorn requests
    uvicorn backend.main:app --port 8000
    ```
2.  **Ollama**:
    ```bash
    ollama serve
    ollama pull llama3.2:3b-instruct-q4_K_M
    ```
3.  **Frontend**:
    Serve the root directory using any static server (e.g., `python -m http.server 5500`).

---

## 🎓 Author
**Harsh Raj**
IIT Patna · Capstone-I
ua2503cdh411
