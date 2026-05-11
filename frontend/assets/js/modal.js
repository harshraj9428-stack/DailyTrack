/* ══════════════════════════════════════════════════════
   DailyTrack — modal.js
   "Add Work" modal: category tabs, task grid, selections
   ══════════════════════════════════════════════════════ */

const Modal = (() => {
  let activeCat    = 'academics';
  let selectedWork = new Set();

  // ── Open / Close ────────────────────────────────────
  function open() {
    document.getElementById('modal-overlay').classList.add('show');
    buildCatTabs();
    renderWorkGrid();
  }

  function close() {
    document.getElementById('modal-overlay').classList.remove('show');
  }

  // ── Category Tabs ────────────────────────────────────
  function buildCatTabs() {
    const tabsEl = document.getElementById('cat-tabs');
    tabsEl.innerHTML = Object.entries(TASK_DATASET)
      .map(([key, cat]) => `
        <button
          class="cat-tab ${key === activeCat ? 'active' : ''}"
          data-cat="${key}"
          onclick="Modal.switchCategory('${key}')">
          ${cat.label}
        </button>`)
      .join('');
  }

  function switchCategory(catKey) {
    activeCat = catKey;
    // Update active tab styling using data-cat attribute
    document.querySelectorAll('.cat-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.cat === catKey);
    });
    renderWorkGrid();
  }

  // ── Work Items Grid ──────────────────────────────────
  function renderWorkGrid() {
    const { tasks, label } = TASK_DATASET[activeCat];
    const gridEl = document.getElementById('work-grid');

    gridEl.innerHTML = tasks.map((task, index) => {
      const id  = `${activeCat}-${index}`;
      const sel = selectedWork.has(id);
      return `
        <button class="work-item ${sel ? 'selected' : ''}" onclick="Modal.toggleItem('${id}')">
          <span class="work-item-icon">${label.split(' ')[0]}</span>
          <div>
            <div class="work-item-text">${escHtml(task.text)}</div>
            <div class="work-item-sub">${escHtml(task.sub)}</div>
          </div>
          <span class="work-check">${sel ? '✓' : ''}</span>
        </button>`;
    }).join('');
  }

  // ── Toggle item selection ────────────────────────────
  function toggleItem(id) {
    if (selectedWork.has(id)) {
      selectedWork.delete(id);
    } else {
      selectedWork.add(id);
    }
    document.getElementById('sel-count').textContent   = selectedWork.size;
    document.getElementById('add-selected-btn').disabled = selectedWork.size === 0;
    renderWorkGrid();
  }

  // ── Add selected to task list ────────────────────────
  function addSelected() {
    let count = 0;
    selectedWork.forEach(id => {
      const parts = id.split('-');
      const cat   = parts[0];
      const idx   = parseInt(parts[1]);
      addTask(TASK_DATASET[cat].tasks[idx].text, cat);
      count++;
    });
    selectedWork.clear();
    document.getElementById('sel-count').textContent     = '0';
    document.getElementById('add-selected-btn').disabled = true;
    close();
    Toast.show(`${count} task(s) added from library! 📋`, '📋');
  }

  // ── Init event listeners ─────────────────────────────
  function init() {
    document.getElementById('add-work-btn').addEventListener('click', open);
    document.getElementById('modal-close').addEventListener('click', close);
    document.getElementById('add-selected-btn').addEventListener('click', addSelected);
    document.getElementById('modal-overlay').addEventListener('click', e => {
      if (e.target === e.currentTarget) close();
    });
  }

  return { init, open, close, switchCategory, toggleItem, addSelected };
})();
