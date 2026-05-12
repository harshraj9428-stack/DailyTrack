# 📚 DailyTrack: The Ultimate Technical Specification & Implementation Guide

**Project Title**: DailyTrack — AI-Powered Daily Routine & Efficiency Tracker  
**Academic Context**: IIT Patna Capstone-I Phase Finalization  
**Principal Developer**: Harsh Raj (ua2503cdh411)  
**Revision Date**: May 12, 2026  

---

## 🚀 1. Executive Summary & Vision
DailyTrack is not just a task manager; it is a **Productivity Co-Pilot**. Designed to address the high-intensity academic environment of IIT Patna, it provides a secure, locally-intelligent platform for students to quantify their output. By moving away from centralized AI clouds, it ensures that a student's personal goals and academic performance data remain private on their local hardware, while leveraging the cloud only for cross-device state synchronization.

---

## 🏗️ 2. Architectural Blueprint (The "Big Picture")

DailyTrack utilizes a **Decoupled 3-Tier Architecture** that separates the user interface from the heavy-lifting logic and the storage layers.

### 2.1 Layer 1: The Presentation Layer (Frontend)
- **Framework**: No Framework (Vanilla JS/CSS/HTML). This was a conscious decision to ensure zero dependencies, maximum load speed, and direct control over DOM manipulation.
- **Visual Core**: A sophisticated "Glassmorphism" design system. It uses `backdrop-filter: blur(25px)` to create a layered, modern aesthetic.
- **Visualization**: Direct SVG (Scalable Vector Graphics) manipulation. Instead of using heavy libraries like Chart.js, DailyTrack writes SVG paths directly in JavaScript to ensure ultra-low memory usage.

### 2.2 Layer 2: The Orchestration Layer (Backend)
- **Logic**: Python-based FastAPI. Chosen for its asynchronous capabilities and high performance.
- **Proxy Role**: It acts as a bridge. The browser cannot directly talk to local shell services for security reasons; FastAPI provides a secure HTTP interface for the Frontend to request AI completions from the local Ollama instance.

### 2.3 Layer 3: The Persistence Layer (Persistence)
- **Local**: `localStorage`. Every action is cached locally. If the internet fails, the user can still use the app.
- **Cloud**: Firebase Firestore. A NoSQL document database. It synchronizes the `tasks` and `history` objects whenever a change is detected.
- **Identity**: Firebase Authentication. Manages the cryptographic tokens for Google and Email logins.

---

## 📂 3. Deep-Dive: File-by-File Technical Analysis

### 🌐 Frontend Module: `/frontend/assets/js/`

#### 🔑 `auth.js` — The Authentication & Sync Engine
This module is the "Heartbeat" of the application. It manages the user's presence and ensures data consistency.
- **`onAuthStateChanged(auth, callback)`**: This listener is active 24/7. When a user logs in, it triggers a "Cloud Pull" (`syncDataFromFirestore`). If they log out, it wipes the UI state but keeps local storage for guest continuity.
- **`signInWithRedirect` vs `signInWithPopup`**: We use **Redirect** because modern browsers block popups on `localhost`. This ensures that even users on strict Safari/Chrome settings can authenticate.
- **`saveDataToFirestore()`**: This is a mission-critical function. It doesn't just save tasks; it serializes the entire state. It includes a `lastSync` timestamp to handle future versioning.
- **`classList.toggle('unauthenticated')`**: This single line of code controls the entire security wall. When this class is present on `<body>`, CSS blurs the whole app.

#### 📝 `tasks.js` — The Task Logic & Analytics Core
This module contains the "Mathematics" of DailyTrack.
- **Task Serialization**: Each task is a JSON object: `{ id, text, done, ts, carried, category }`.
- **`calcEfficiency()`**: The formula is `(done_count / total_count) * 100`. It returns 0 if `total_count` is 0 to avoid division-by-zero errors.
- **`renderTasks()`**: This is the most performance-heavy function. It performs a "Virtual DOM" update by regenerating the task list HTML and re-drawing the SVG charts.
- **`updateScorecard(history)`**: 
    - **Grading Scale**: A+ (90+), A (80+), B+ (70+), B (60+), C (50+), D (0+), F (if tasks exist but 0% done), and `--` (if no tasks exist).
    - It uses `getLastNDaysValues` to pull the specific 7-day window from the NoSQL-style history object.

#### 🤖 `ai.js` — The Cognitive Interface
This module handles the natural language processing requests.
- **Prompt Injection**: It wraps user requests in specialized "System Prompts" to force the LLM to behave like a CS student's mentor.
- **`aiTaskBuffer`**: A temporary array that holds AI-suggested tasks. They only get added to the real list when the user clicks "Add to List," giving the user final editorial control.
- **`quickBreakdown(taskId)`**: Uses the specific task text as a prompt. It asks the AI: *"Break this specific task into 5-6 actionable steps."*

#### 🛠️ `utils.js` — The Foundation Utilities
- **`Toast.show(msg, icon)`**: A custom-built notification system. It uses CSS transitions to slide into view and automatically cleans up after 3.2 seconds.
- **`escHtml(str)`**: **CRITICAL SECURITY**. It prevents users (or AI) from injecting `<script>` tags into tasks, preventing cross-site scripting attacks.

---

## 🎨 4. Design Philosophy & CSS Architecture

The UI is defined in `style.css` using a **Modular Design System**.

### 4.1 The Grid System
We use a hybrid of **CSS Flexbox** for small components (like task rows) and **CSS Grid** for the main app layout.
- **`.suite-grid`**: A 3nd-generation grid that handles the Sidebar and Main Task view.
- **Responsive Breakpoints**: At `768px`, the grid collapses from a side-by-side view to a vertical stack for mobile usability.

### 4.2 The "Glassmorphism" Variables
We use CSS custom properties (variables) for consistent branding:
- `--glass`: The core background for all cards. `rgba(255, 255, 255, 0.03)`.
- `--accent`: The primary brand color (`#22d3ee`). It is used sparingly to draw the eye to call-to-actions.
- `--red / --amber / --green`: Defined as semantic variables for performance tiering.

---

## 🔄 5. Operational Workflows (Line-by-Line logic)

### 5.1 The "First Load" Sequence
1. Browser loads `index.html`.
2. Synchronous scripts load: `utils.js`, `dataset.js`, `tasks.js`, `modal.js`, `ai.js`, `app.js`.
3. `app.js` calls `loadTasks()` which pulls from `localStorage`.
4. The asynchronous module `auth.js` loads.
5. `onAuthStateChanged` fires.
6. **Scenario A (Logged In)**: `unauthenticated` class removed -> `syncDataFromFirestore` called -> UI updates with Cloud data.
7. **Scenario B (Logged Out)**: `unauthenticated` class added -> Welcome Overlay blurred view remains.

### 5.2 The "Cloud Sync" Sequence
1. User clicks a checkbox.
2. `toggleTask(id)` in `tasks.js` fires.
3. `saveTasks()` is called.
4. `saveTasks()` calls `window.saveDataToFirestore()`.
5. `auth.js` updates the Sync Indicator to "Syncing...".
6. Firestore `setDoc` updates the cloud document.
7. Sync Indicator turns green "Cloud Synced".

---

## 🛠️ 6. Backend & AI Pipelines

### 6.1 FastAPI Configuration (`backend/main.py`)
The backend is optimized for **Zero-Latency Proxying**.
- **CORS Handling**: Allows `http://localhost:5500` to make requests.
- **Payload Management**: It strips unnecessary metadata from the Ollama response to send a lean JSON object back to the browser.

### 6.2 Ollama Integration
- **Model**: `llama3.2:3b-instruct-q4_K_M` (4-bit quantization).
- **Inference**: Each request is stateless. The context is built on the fly by `ai.js` using the current task list and efficiency history.

---

## 🛡️ 7. Security & Privacy Protocols
1. **No External Tracking**: We do not use Google Analytics or Facebook Pixels. Your productivity is your business.
2. **Local LLM**: No task text is sent to OpenAI, Anthropic, or any other cloud AI provider.
3. **Firestore Security Rules**:
   ```javascript
   match /users/{userId} {
     allow read, write: if request.auth != null && request.auth.uid == userId;
   }
   ```
   (This ensures that User A cannot see User B's tasks).

---

## 🔧 8. System Setup & Maintenance

### 8.1 One-Click Startup (`run.bat`)
This script is a production-level automation tool.
- **Line 11-16**: Dynamically creates a Python environment. This ensures that the user doesn't need to manually manage Python versions or "pip install" anything.
- **Line 22-28**: Uses the `start` command to run multiple servers simultaneously. This is the **Pipeline Flow** the user refers to.

---
**Prepared for the IIT Patna Capstone Phase-I Project 2026.**  
*Detailed Technical Manual for Academic Submission.*
