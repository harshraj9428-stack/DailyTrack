/* ══════════════════════════════════════════════════════
   DailyTrack — tasks.js
   Task state management, CRUD operations, and rendering
   ══════════════════════════════════════════════════════ */

// ── State ─────────────────────────────────────────────
let tasks = [];
let currentFilter = 'all';
let confettiFired = false;
let chartDebounceTimer = null;

// ── Persistence ───────────────────────────────────────
function saveTasks() {
  localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
  localStorage.setItem(STORAGE_KEYS.date, todayStr());
  
  // Trigger Cloud Sync if logged in
  if (window.saveDataToFirestore) {
    window.saveDataToFirestore();
  }
}

function loadTasks() {
  const savedDate = localStorage.getItem(STORAGE_KEYS.date);
  const raw       = localStorage.getItem(STORAGE_KEYS.tasks);
  const saved     = raw ? JSON.parse(raw) : [];
  const today     = todayStr();

  if (savedDate && savedDate !== today && saved.length > 0) {
    // Carry forward only incomplete tasks
    const carried = saved
      .filter(t => !t.done)
      .map(t => ({ ...t, carried: true, id: uid(), ts: Date.now() }));

    tasks = carried;

    if (carried.length > 0) {
      document.getElementById('pending-banner').classList.add('show');
      document.getElementById('pending-cnt').textContent = carried.length;
      Toast.show(`⏰ ${carried.length} task(s) carried over from yesterday!`, '⏰');
    }

    Streak.update(savedDate);
    saveTasks();
  } else {
    tasks = saved;
  }
}

// ── Efficiency Formula ────────────────────────────────
// Efficiency = (Completed Tasks / Total Tasks) × 100
function calcEfficiency() {
  if (tasks.length === 0) return 0;
  const done = tasks.filter(t => t.done).length;
  return Math.round((done / tasks.length) * 100);
}

// ── Efficiency History ───────────────────────────────
function getEfficiencyHistory() {
  const raw = localStorage.getItem(STORAGE_KEYS.history);
  return raw ? JSON.parse(raw) : {};
}

function saveEfficiencyHistory(map) {
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(map));
}

function updateEfficiencyHistory(pct) {
  const map = getEfficiencyHistory();
  const today = todayStr();
  map[today] = pct;

  // Keep roughly last 60 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 60);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  Object.keys(map).forEach(d => {
    if (d < cutoffStr) delete map[d];
  });

  saveEfficiencyHistory(map);
  return map;
}

function getLastNDaysValues(map, days = 30) {
  const out = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().split('T')[0];
    out.push(map[key] || 0);
  }
  return out;
}

function updateTrendAxis(days = 30, ticks = 7) {
  const axis = document.getElementById('chart-axis');
  if (!axis) return;
  const now = new Date();
  const labels = [];
  for (let i = 0; i < ticks; i++) {
    const offset = Math.round((days - 1) * (i / (ticks - 1)));
    const d = new Date(now);
    d.setDate(now.getDate() - (days - 1 - offset));
    labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }
  axis.innerHTML = labels.map(l => `<span>${l}</span>`).join('');
}

function updateTrendChart(values) {
  const line = document.querySelector('.chart-line');
  const area = document.querySelector('.chart-area');
  if (!line || !area || values.length < 2) return;

  const width = 520;
  const height = 160;
  const topPad = 20;
  const bottomPad = 20;
  const usable = height - topPad - bottomPad;
  const step = width / (values.length - 1);

  const points = values.map((v, i) => {
    const x = Math.round(step * i);
    const y = Math.round(height - bottomPad - (v / 100) * usable);
    return `${x},${y}`;
  }).join(' ');

  line.setAttribute('points', points);
  area.setAttribute('points', `0,${height} ${points} ${width},${height}`);

  updateTrendAxis(values.length, 7);
}

function updateSparkBars(values) {
  const bars = document.querySelectorAll('.spark-bar');
  const dayEls = document.querySelectorAll('.spark-day');
  if (!bars.length) return;

  const total = bars.length;
  const now = new Date();
  const labels = [];

  for (let i = 0; i < total; i++) {
    const offset = (total - 1) - i;
    const d = new Date(now);
    d.setDate(now.getDate() - offset);
    labels.push({
      short: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      full: d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
    });
  }

  bars.forEach((bar, i) => {
    const v = values[i] || 0;
    const pct = Math.max(0, Math.min(100, v));
    bar.style.setProperty('--h', `${pct}%`);
    bar.classList.toggle('today', i === total - 1);
    if (labels[i]) {
      bar.title = `${labels[i].full} - ${pct}% efficiency`;
    }
  });

  if (dayEls.length) {
    dayEls.forEach((dayEl, i) => {
      if (!labels[i]) return;
      dayEl.textContent = labels[i].short;
      dayEl.classList.toggle('today', i === total - 1);
      dayEl.title = labels[i].full;
    });
  }
}

function updateDonut() {
  const segA = document.querySelector('.seg-a');
  const segB = document.querySelector('.seg-b');
  const segC = document.querySelector('.seg-c');
  const segD = document.querySelector('.seg-d');
  if (!segA || !segB || !segC || !segD) return;

  let dev = 0;
  let plan = 0;
  let market = 0;
  let other = 0;

  tasks.forEach(t => {
    if (t.category === 'tech') dev++;
    else if (t.category === 'academics') plan++;
    else if (t.category === 'health' || t.category === 'selflearn') market++;
    else other++;
  });

  const total = tasks.length;
  const C = 2 * Math.PI * 44;
  const values = total === 0 ? [0, 0, 0, 0] : [dev, plan, market, other];
  const lengths = values.map(v => total === 0 ? 0 : (v / total) * C);

  let offset = 0;
  [segA, segB, segC, segD].forEach((seg, i) => {
    const len = lengths[i];
    seg.style.strokeDasharray = `${len} ${C}`;
    seg.style.strokeDashoffset = `${-offset}`;
    offset += len;
  });

  const labels = [
    document.getElementById('seg-a-label'),
    document.getElementById('seg-b-label'),
    document.getElementById('seg-c-label'),
    document.getElementById('seg-d-label'),
  ];
  const names = ['Tech & Work', 'Academics', 'Self/Health', 'Other'];
  labels.forEach((el, i) => {
    if (el) {
      const pct = total === 0 ? 0 : Math.round((values[i] / total) * 100);
      el.textContent = `${names[i]} ${pct}%`;
    }
  });
}

function updateOverview() {
  const el = document.querySelector('.overview-card .mini-list');
  if (!el) return;

  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  const pending = tasks.filter(t => !t.done);

  if (total === 0) {
    el.innerHTML = `
      <li>No tasks for today yet.</li>
      <li>Open the Task Library to start.</li>
      <li>Or ask AI to plan your day!</li>
    `;
    return;
  }

  let items = [];
  if (done === total) {
    items = [
      'All tasks completed! Great job! 🚀',
      'Enjoy your free time or relax.',
      'Consider planning for tomorrow.'
    ];
  } else {
    items = [
      `${done} of ${total} tasks finished.`,
      pending.length > 0 ? `Focus on: ${pending[0].text}` : 'Finishing touches...',
      'Check AI Coach for priority tips.'
    ];
  }

  el.innerHTML = items.map(it => `<li>${it}</li>`).join('');
}

function clearAnalytics() {
  localStorage.removeItem(STORAGE_KEYS.history);
  updateTrendChart(Array(30).fill(0));
  updateSparkBars(Array(7).fill(0));
  
  // Trigger Cloud Sync if logged in
  if (window.saveDataToFirestore) {
    window.saveDataToFirestore();
  }

  Toast.show('Analytics cleared.', '🧹');
}

// ── Task CRUD ─────────────────────────────────────────
function addTask(text, category = null) {
  if (!text.trim()) {
    const inp = document.getElementById('task-input');
    inp.style.borderColor = 'var(--red)';
    setTimeout(() => inp.style.borderColor = '', 800);
    return false;
  }

  const task = {
    id:       uid(),
    text:     text.trim(),
    done:     false,
    ts:       Date.now(),
    carried:  false,
    category,
  };

  tasks.unshift(task);
  saveTasks();
  renderTasks();
  return true;
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.done = !task.done;
  saveTasks();
  renderTasks();
  if (task.done) Toast.show('Task completed! 🎉', '🎉');
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
  Toast.show('Task removed.', '🗑');
}

function clearCompleted() {
  const before = tasks.length;
  tasks = tasks.filter(t => !t.done);
  saveTasks();
  renderTasks();
  const removed = before - tasks.length;
  if (removed > 0) Toast.show(`${removed} completed task(s) cleared.`, '🗑');
}

function clearAll() {
  if (tasks.length === 0) return;
  if (confirm('Are you sure you want to clear ALL tasks for today?')) {
    tasks = [];
    saveTasks();
    renderTasks();
    Toast.show('All tasks cleared.', '🗑');
  }
}

function completeAll() {
  tasks.forEach(t => t.done = true);
  saveTasks();
  renderTasks();
  Toast.show('All tasks completed! 🚀', '🚀');
}

// ── Render ────────────────────────────────────────────
function renderTasks() {
  const pct     = calcEfficiency();
  const total   = tasks.length;
  const done    = tasks.filter(t => t.done).length;
  const pending = tasks.filter(t => !t.done).length;

  // Update stats
  document.getElementById('total-count').textContent   = total;
  document.getElementById('done-count').textContent     = done;
  document.getElementById('pending-count').textContent  = pending;
  document.getElementById('efficiency-val').textContent = pct + '%';
  document.getElementById('tasks-count-badge').textContent = total;

  // Efficiency color and message
  let color  = 'var(--red)';
  let status = 'Needs Attention';
  let desc   = 'Keep adding and completing tasks to improve your score!';

  if (pct >= 80)       { color = 'var(--green)'; status = 'Excellent Work! 🚀'; desc = 'Outstanding! You are absolutely crushing it today!'; }
  else if (pct >= 60)  { color = 'var(--green)'; status = 'Good Progress 👍';  desc = 'You are above target. Keep the momentum going!'; }
  else if (pct >= 40)  { color = 'var(--amber)'; status = 'Making Progress';   desc = 'You are halfway there. Push through the remaining tasks!'; }
  else if (pct > 0)    { color = 'var(--amber)'; status = 'Just Started';      desc = 'Good start! Mark more tasks as done to boost efficiency.'; }
  else if (total > 0)  { status = 'Tasks Pending'; desc = 'Start checking off tasks!'; }

  // Ring
  const circumference = 2 * Math.PI * 50;
  const ring = document.getElementById('ring-fill');
  ring.style.strokeDasharray  = circumference;
  ring.style.strokeDashoffset = circumference - (pct / 100) * circumference;
  ring.style.stroke = color;

  document.getElementById('ring-pct').textContent  = pct + '%';
  document.getElementById('ring-pct').style.color  = color;
  document.getElementById('eff-status').textContent = total === 0 ? 'No tasks yet' : status;
  document.getElementById('eff-desc').textContent   = total === 0
    ? 'Add tasks manually, pick from library, or let AI plan your day.'
    : desc;
  document.getElementById('progress-bar').style.width = pct + '%';
  document.getElementById('efficiency-val').style.color = color;

  // Confetti on 100% completion
  if (pct === 100 && total > 0 && !confettiFired) {
    fireConfetti();
    confettiFired = true;
  } else if (pct < 100) {
    confettiFired = false;
  }

  // Filter tasks
  const filtered = tasks.filter(t => {
    if (currentFilter === 'done')    return t.done;
    if (currentFilter === 'pending') return !t.done;
    return true;
  });

  // Render list
  const listEl  = document.getElementById('task-list');
  const emptyEl = document.getElementById('empty-state');

  if (filtered.length === 0) {
    listEl.innerHTML = '';
    emptyEl.classList.add('show');
  } else {
    emptyEl.classList.remove('show');
    listEl.innerHTML = filtered.map(task => buildTaskHTML(task)).join('');
  }

  // Bottom actions row
  document.getElementById('tasks-actions').style.display = total > 0 ? 'flex' : 'none';

  // Debounced Charts & Analytics Update to prevent lag
  clearTimeout(chartDebounceTimer);
  chartDebounceTimer = setTimeout(() => {
    const history = updateEfficiencyHistory(pct);
    updateTrendChart(getLastNDaysValues(history, 30));
    updateSparkBars(getLastNDaysValues(history, 7));
    updateDonut();
    updateOverview();
    updateScorecard(history);
  }, 300); 
}

function updateScorecard(history) {
  const last7 = getLastNDaysValues(history, 7);
  const avg = Math.round(last7.reduce((a, b) => a + b, 0) / 7);
  
  const gradeEl = document.getElementById('score-grade');
  const avgEl = document.getElementById('score-avg');
  const msgEl = document.getElementById('score-msg');
  
  if (!gradeEl || !avgEl || !msgEl) return;

  avgEl.textContent = avg + '%';
  
  let grade = '--';
  let color = 'var(--text2)';
  let msg = 'Add tasks to calculate your grade.';

  if (avg >= 90) { grade = 'A+'; color = 'var(--green)'; msg = 'IITP Scholar Level! 💎'; }
  else if (avg >= 80) { grade = 'A'; color = 'var(--green)'; msg = 'Outstanding Performance! 🚀'; }
  else if (avg >= 70) { grade = 'B+'; color = 'var(--green)'; msg = 'Great Momentum! 👍'; }
  else if (avg >= 60) { grade = 'B'; color = 'var(--amber)'; msg = 'Above Average. Push more!'; }
  else if (avg >= 50) { grade = 'C'; color = 'var(--amber)'; msg = 'Steady progress.'; }
  else if (avg > 0) { grade = 'D'; color = 'var(--red)'; msg = 'Focus on consistency.'; }
  else if (tasks.length > 0) { grade = 'F'; color = 'var(--red)'; msg = 'Start checking off tasks!'; }

  gradeEl.textContent = grade;
  gradeEl.style.color = color;
  msgEl.textContent = msg;
}

// ── Build single task HTML ────────────────────────────
function buildTaskHTML(task) {
  const catData    = task.category && TASK_DATASET[task.category] ? TASK_DATASET[task.category] : null;
  const catBadge   = catData
    ? `<span class="cat-badge ${catData.badgeClass}">${catData.label.split(' ')[0]}</span>`
    : '';
  const carriedBadge = task.carried && !task.done
    ? `<span class="carried-badge">carried</span>`
    : '';
  const aiBtn = !task.done
    ? `<button class="task-act-btn ai" onclick="AIModule.quickBreakdown(${task.id})" title="AI: Break down this task">🤖</button>`
    : '';

  return `
    <li class="task-item ${task.done ? 'done' : ''} ${task.carried && !task.done ? 'carried' : ''}">
      <div class="cb-wrap">
        <input type="checkbox" class="task-cb-input" id="task-${task.id}" onchange="toggleTask(${task.id})" ${task.done ? 'checked' : ''}>
        <label for="task-${task.id}" class="custom-cb">
          <span class="check-icon">✓</span>
        </label>
      </div>
      <div class="task-content">
        <label class="task-text" for="task-${task.id}">${escHtml(task.text)}</label>
        <div class="task-meta">
          <span class="task-time">🕐 ${formatTime(task.ts)}</span>
          ${catBadge}
          ${carriedBadge}
        </div>
      </div>
      <div class="task-actions">
        ${aiBtn}
        <button class="task-act-btn delete" onclick="deleteTask(${task.id})" title="Delete task">✕</button>
      </div>
    </li>`;
}


function fireConfetti() {
  const duration = 3 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 2000 };

  const randomInRange = (min, max) => Math.random() * (max - min) + min;

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    // since particles fall down, start a bit higher than random
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
  }, 250);
}

// ── Filter listener setup ─────────────────────────────
function initFilterTabs() {
  document.querySelectorAll('.filter-tab').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentFilter = this.dataset.filter;
      renderTasks();
    });
  });
}

// Expose to global scope for module access
window.tasks = tasks;
window.renderTasks = renderTasks;
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;
