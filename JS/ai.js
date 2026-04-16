/* ══════════════════════════════════════════════════════
   DailyTrack — ai.js
   Ollama local LLM integration
   Features: breakdown, planday, coach, prioritize
   ══════════════════════════════════════════════════════ */

const AIModule = (() => {
  const API_URL = 'http://127.0.0.1:8000/chat';
  const SYSTEM_PROMPT =
    'You are a helpful productivity assistant for IIT Patna Computer Science and Data Analytics students. ' +
    'Be concise, practical, and encouraging. Use numbered lists for tasks and schedules.';

  let aiTaskBuffer = [];

  // ── Get current model name ───────────────────────────
  function getModel() {
    return document.getElementById('model-input').value.trim() || 'llama3.2:3b-instruct-q4_K_M';
  }

  // ── Test FastAPI backend connection ──────────────────
  async function testConnection() {
    const btn = document.getElementById('connect-btn');
    const dot = document.getElementById('ai-dot');
    btn.textContent = '⏳ Testing...';
    btn.disabled    = true;

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: getModel(),
          messages: [{ role: 'user', content: 'Ping' }]
        }),
        signal: AbortSignal.timeout(30000), // Increased to 30s to allow model loading
      });

      if (res.ok) {
        dot.classList.add('connected');
        Toast.show(`✅ AI backend connected! Model: ${getModel()}`, '🤖');
        btn.textContent = '✅ Connected';
      } else {
        throw new Error('Non-OK response');
      }
    } catch (err) {
      dot.classList.remove('connected');
      const msg = err.name === 'TimeoutError' ? 'Timeout: Model is still loading...' : '❌ AI backend not reachable. Start FastAPI first.';
      Toast.show(msg, '❌');
      btn.textContent = '❌ Not Found';
    }

    btn.disabled = false;
    setTimeout(() => btn.textContent = '🔌 Test Connection', 3000);
  }

  // ── Chat via FastAPI backend ─────────────────────────
  async function streamChat(messages) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: getModel(),
        messages
      })
    });

    const data = await response.json();
    return data.message.content;
  }

  // ── Show output in panel ─────────────────────────────
  function showOutput(html) {
    const el = document.getElementById('ai-output');
    el.className  = 'ai-output show';
    el.innerHTML  = html;
    document.getElementById('add-ai-tasks-btn').classList.remove('show');
  }

  function showTyping(label = 'AI is thinking') {
    showOutput(`
      <div class="typing-dots">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <span style="margin-left:6px">${label}...</span>
      </div>`);
  }

  function showError(extraInfo = '') {
    showOutput(`
      <span style="color:var(--red)">
        ❌ Could not connect to the AI backend.<br><br>
        <strong>Setup steps:</strong><br>
        1. Start FastAPI: <code style="background:var(--bg3);padding:1px 6px;border-radius:3px">uvicorn backend.main:app --reload</code><br>
        2. Run Ollama: <code style="background:var(--bg3);padding:1px 6px;border-radius:3px">ollama serve</code><br>
        3. Pull model: <code style="background:var(--bg3);padding:1px 6px;border-radius:3px">ollama pull ${getModel()}</code>
        ${extraInfo}
      </span>`);
  }

  // ── Extract task lines from AI response ──────────────
  function extractTaskLines(text) {
    return text
      .split('\n')
      .filter(line => line.trim().match(/^\d+\.|^-|^•/))
      .map(line => line.replace(/^\d+\.\s*|^-\s*|^•\s*/, '').trim())
      .filter(Boolean);
  }

  // ── AI Feature: Break Down Task ──────────────────────
  async function breakdown() {
    const pending = tasks.filter(t => !t.done).map(t => t.text);
    if (!pending.length) {
      showOutput('<span style="color:var(--amber)">No pending tasks to break down. Add a task first!</span>');
      return;
    }

    showTyping(`Breaking down: "${pending[0]}"`);
    const prompt =
      `Break down this task into 5-6 specific, actionable subtasks for a CS student:\n` +
      `"${pending[0]}"\n\n` +
      `Return ONLY a numbered list. Each subtask should take 15–30 minutes.`;

    try {
      const text = await streamChat([
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ]);
      showOutput(text);

      const lines = extractTaskLines(text);
      if (lines.length) {
        aiTaskBuffer = lines;
        document.getElementById('add-ai-tasks-btn').classList.add('show');
      }
    } catch { showError(); }
  }

  // ── AI Feature: Plan My Day ──────────────────────────
  async function planDay() {
    const pending = tasks.filter(t => !t.done).map(t => t.text).slice(0, 8);
    showTyping('Building your schedule');

    const taskList = pending.length
      ? pending.join('\n')
      : 'No tasks — suggest a productive student day';

    const prompt =
      `Create a time-blocked day schedule for an IIT Patna CS/DA student.\n\n` +
      `Pending tasks:\n${taskList}\n\n` +
      `Schedule from 7 AM to 11 PM. Include study blocks, breaks, meals, and exercise.\n` +
      `Format each entry as: TIME — ACTIVITY`;

    try {
      const text = await streamChat([
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ]);
      showOutput(text);
      const lines = extractTaskLines(text);
      if (lines.length) {
        aiTaskBuffer = lines;
        document.getElementById('add-ai-tasks-btn').classList.add('show');
      }
    } catch { showError(); }
  }

  // ── AI Feature: Efficiency Coach ────────────────────
  async function coach() {
    const pct     = calcEfficiency();
    const allList = tasks.map(t => `[${t.done ? 'DONE' : 'PENDING'}] ${t.text}`).join('\n');

    showTyping('Analyzing your productivity');

    const prompt =
      `As a productivity coach for an IIT Patna student:\n` +
      `Current Efficiency: ${pct}%\n` +
      `Tasks:\n${allList || 'No tasks added yet'}\n\n` +
      `Give 3–4 specific, actionable tips to improve their productivity. ` +
      `Be encouraging but honest. Keep it under 150 words.`;

    try {
      const text = await streamChat([
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ]);
      showOutput(text);
    } catch { showError(); }
  }

  // ── AI Feature: Direct Coach Question ───────────────
  async function askCoach() {
    const input = document.getElementById('coach-input');
    const query = input ? input.value.trim() : '';
    if (!query) {
      coach();
      return;
    }

    showTyping('Thinking');
    try {
      const text = await streamChat([
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: query }
      ]);
      showOutput(text);
      input.value = '';
    } catch { showError(); }
  }

  // ── AI Feature: Prioritize Tasks ────────────────────
  async function prioritize() {
    const pending = tasks.filter(t => !t.done).map(t => t.text);
    if (!pending.length) {
      showOutput('<span style="color:var(--amber)">No pending tasks to prioritize!</span>');
      return;
    }

    showTyping('Ranking your tasks');

    const numbered = pending.map((t, i) => `${i + 1}. ${t}`).join('\n');
    const prompt   =
      `Rank these student tasks by urgency and importance (most important first).\n` +
      `For each, give a one-line reason.\n\n` +
      `Tasks:\n${numbered}\n\n` +
      `Format: Rank. Task name — Reason`;

    try {
      const text = await streamChat([
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ]);
      showOutput(text);
    } catch { showError(); }
  }

  // ── Quick breakdown from task row 🤖 button ──────────
  async function quickBreakdown(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Auto-open AI panel
    const panel = document.getElementById('ai-panel-body');
    if (!panel.classList.contains('open')) {
      panel.classList.add('open');
      document.getElementById('ai-toggle-icon').textContent = '▲ Collapse';
    }
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    showTyping(`Breaking down "${escHtml(task.text)}"`);

    const prompt =
      `Break this task into 5-6 specific subtasks for a CS student:\n` +
      `"${task.text}"\n\n` +
      `Numbered list only. Each should take 15–30 minutes.`;

    try {
      const text = await streamChat([
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ]);
      showOutput(text);
      const lines = extractTaskLines(text);
      if (lines.length) {
        aiTaskBuffer = lines;
        document.getElementById('add-ai-tasks-btn').classList.add('show');
      }
    } catch {
      showError('<br><br>You can also try clicking "Test Connection" first.');
    }
  }

  // ── Add AI-generated tasks to list ──────────────────
  function addAITasks() {
    aiTaskBuffer.forEach(text => addTask(text, null));
    Toast.show(`${aiTaskBuffer.length} AI-generated tasks added! 🤖`, '🤖');
    aiTaskBuffer = [];
    document.getElementById('add-ai-tasks-btn').classList.remove('show');
  }

  // ── Dispatcher ───────────────────────────────────────
  function run(type) {
    const actions = { breakdown, planday: planDay, coach, prioritize };
    if (actions[type]) actions[type]();
  }

  // ── Init event listeners ─────────────────────────────
  function init() {
    document.getElementById('connect-btn').addEventListener('click', testConnection);
    document.getElementById('add-ai-tasks-btn').addEventListener('click', addAITasks);
    document.getElementById('ai-panel-toggle').addEventListener('click', () => {
      const body = document.getElementById('ai-panel-body');
      const icon = document.getElementById('ai-toggle-icon');
      const isOpen = body.classList.toggle('open');
      icon.textContent = isOpen ? '▲ Collapse' : '▼ Expand';
    });

    const coachInput = document.getElementById('coach-input');
    if (coachInput) {
      coachInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') askCoach();
      });
    }
  }

  return { init, run, quickBreakdown, askCoach };
})();
