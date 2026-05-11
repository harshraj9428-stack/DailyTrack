/* ══════════════════════════════════════════════════════
   DailyTrack — utils.js
   Shared helper functions: dates, toast, streak, escape
   ══════════════════════════════════════════════════════ */

// ── Storage Keys ──────────────────────────────────────
const STORAGE_KEYS = {
  tasks:  'dt_tasks',
  date:   'dt_date',
  streak: 'dt_streak',
  history: 'dt_eff_history',
};

// ── Date Helpers ──────────────────────────────────────
function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit',
  });
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

// ── HTML Escape ────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;');
}

// ── Toast ─────────────────────────────────────────────
const Toast = (() => {
  let timer = null;

  function show(message, icon = '✅') {
    const el   = document.getElementById('toast');
    const msg  = document.getElementById('toast-msg');
    const ico  = document.getElementById('toast-icon');
    msg.textContent = message;
    ico.textContent = icon;
    el.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(() => el.classList.remove('show'), 3200);
  }

  return { show };
})();

// ── Streak ────────────────────────────────────────────
const Streak = (() => {
  function update(lastSavedDate) {
    const current = parseInt(localStorage.getItem(STORAGE_KEYS.streak) || '0');
    const newStreak = lastSavedDate === yesterdayStr() ? current + 1 : 1;
    localStorage.setItem(STORAGE_KEYS.streak, newStreak);
    render();
  }

  function render() {
    const count = parseInt(localStorage.getItem(STORAGE_KEYS.streak) || '0');
    const el = document.getElementById('streak-badge');
    if (el) el.textContent = `🔥 ${count} day${count !== 1 ? 's' : ''} streak`;
  }

  return { update, render };
})();

// ── Unique ID ─────────────────────────────────────────
function uid() {
  return Date.now() + Math.random();
}
