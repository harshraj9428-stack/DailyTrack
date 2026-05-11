/* ══════════════════════════════════════════════════════
   DailyTrack — app.js
   Main entry point — initializes all modules on load
   IIT Patna Capstone-I | Harsh Raj | ua2503cdh411
   ══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Set today's date in header ──────────────────────
  document.getElementById('today-date').textContent = formatDate(todayStr());

  // ── Load saved tasks (with carry-forward logic) ──────
  loadTasks();

  // ── Initial render ───────────────────────────────────
  renderTasks();

  // ── Restore streak display ───────────────────────────
  Streak.render();

  // ── Wire up Add Task button + Enter key ──────────────
  document.getElementById('add-btn').addEventListener('click', handleAdd);
  document.getElementById('task-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleAdd();
  });

  // ── Wire up task bottom actions ──────────────────────
  document.getElementById('clear-all-btn').addEventListener('click', clearAll);
  document.getElementById('clear-done-btn').addEventListener('click', clearCompleted);
  document.getElementById('complete-all-btn').addEventListener('click', completeAll);

  const clearAnalyticsBtn = document.getElementById('clear-analytics-btn');
  if (clearAnalyticsBtn) {
    clearAnalyticsBtn.addEventListener('click', clearAnalytics);
  }

  // ── Init filter tabs ─────────────────────────────────
  initFilterTabs();

  // ── Init modal module ────────────────────────────────
  Modal.init();

  // ── Init AI module ───────────────────────────────────
  AIModule.init();

});

// ── Handle add from input field ───────────────────────
function handleAdd() {
  const input = document.getElementById('task-input');
  const success = addTask(input.value);
  if (success) {
    input.value = '';
    input.focus();
    Toast.show('Task added successfully!', '✅');
  }
}
