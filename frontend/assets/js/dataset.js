/* ══════════════════════════════════════════════════════
   DailyTrack — dataset.js
   Pre-built task library for IIT Patna CS/DA students
   ══════════════════════════════════════════════════════ */

const TASK_DATASET = {
  academics: {
    label: '📚 Academics',
    badgeClass: 'cat-academics',
    tasks: [
      { text: 'Attend Linear Algebra lecture',             sub: 'Mathematics-II' },
      { text: 'Complete DSA Assignment',                   sub: 'Data Structures & Algorithms' },
      { text: 'Prepare for Minor Exam — Data Structures',  sub: 'Trees, graphs, dynamic programming' },
      { text: 'Submit Lab Report — Computer Networks',     sub: 'Wireshark experiment' },
      { text: 'Solve tutorial sheet — Probability & Stats',sub: 'Problems 1–15' },
      { text: 'Revise today\'s lecture notes',             sub: '20 min before sleep' },
      { text: 'Attend professor\'s office hours',          sub: 'Clarify assignment doubts' },
      { text: 'Complete online quiz on NPTEL',             sub: 'Due today 11:59 PM' },
      { text: 'Read assigned research paper',              sub: '2 pages minimum' },
      { text: 'Prepare group project presentation slides', sub: 'Seminar submission' },
      { text: 'Submit programming assignment on portal',   sub: 'Check for plagiarism before upload' },
      { text: 'Review previous year question papers',      sub: 'Exam preparation' },
    ],
  },

  tech: {
    label: '💻 Tech & Projects',
    badgeClass: 'cat-tech',
    tasks: [
      { text: 'Solve 2 LeetCode problems — Arrays',        sub: 'Daily coding practice' },
      { text: 'Push today\'s code to GitHub',              sub: 'Commit with a proper message' },
      { text: 'Work on DailyTrack — Capstone-I feature',   sub: 'IIT Patna project' },
      { text: 'Fix bug in SAMI AI assistant',              sub: 'Local LLM personal project' },
      { text: 'Review teammate\'s pull request',           sub: 'Code review session' },
      { text: 'Write unit tests for current module',       sub: 'Target test coverage > 80%' },
      { text: 'Update project README and documentation',   sub: 'Keep it clean and current' },
      { text: 'Set up new dependencies and environment',   sub: 'requirements.txt / package.json' },
      { text: 'Practice SQL queries on HackerRank',        sub: '5 queries minimum' },
      { text: 'Complete Kaggle notebook — EDA + model',    sub: 'Model training and evaluation' },
      { text: 'Study PyTorch / TensorFlow documentation',  sub: '1 new concept today' },
      { text: 'Deploy and end-to-end test project locally',sub: 'Full testing session' },
    ],
  },

  health: {
    label: '🏃 Health & Fitness',
    badgeClass: 'cat-health',
    tasks: [
      { text: 'Morning workout — 30 minutes',              sub: 'Gym / calisthenics / jog' },
      { text: 'Evening walk or jog on campus',             sub: '20–30 min de-stress session' },
      { text: 'Drink 8 glasses of water today',            sub: 'Stay hydrated throughout the day' },
      { text: 'Eat all 3 proper meals today',              sub: 'Breakfast + lunch + dinner' },
      { text: 'Sleep 7–8 hours tonight',                   sub: 'No phone after 11 PM' },
      { text: 'Meditate for 10 minutes',                   sub: 'Focus and stress relief' },
      { text: 'Stretch and mobility routine',              sub: 'After long study session' },
      { text: 'Take screen break every 45 minutes',        sub: '20-20-20 rule for eye health' },
    ],
  },

  selflearn: {
    label: '📖 Self-Learning',
    badgeClass: 'cat-selflearn',
    tasks: [
      { text: 'Watch 1 MIT OCW / NPTEL lecture',           sub: 'Extra beyond curriculum' },
      { text: 'Read 10 pages of a tech book',              sub: 'Build a consistent reading habit' },
      { text: 'Complete 1 Udemy / Coursera module',        sub: 'Skill development' },
      { text: 'Practice competitive programming',          sub: '1 CodeForces / CodeChef problem' },
      { text: 'Study for placement or internship prep',    sub: 'Aptitude + CS core fundamentals' },
      { text: 'Learn a new tool or library hands-on',      sub: 'Build a small demo project' },
      { text: 'Watch a system design video',               sub: 'Architecture and scalability' },
      { text: 'Revise Linear Algebra or Stats concepts',   sub: 'ML and Data Science foundation' },
    ],
  },

  daily: {
    label: '🏠 Daily Essentials',
    badgeClass: 'cat-daily',
    tasks: [
      { text: 'Reply to important emails and messages',    sub: 'Inbox zero goal' },
      { text: 'Organize and clean up study notes',         sub: 'Notion or physical notes' },
      { text: 'Plan tomorrow\'s schedule — 5 minutes',     sub: 'Set 3 top priorities for tomorrow' },
      { text: 'Weekly room and workspace cleanup',         sub: 'Clean desk = clear mind' },
      { text: 'Call family',                               sub: 'Stay connected' },
      { text: 'Review monthly budget and expenses',        sub: 'Track spending' },
      { text: 'Update LinkedIn or GitHub portfolio',       sub: 'Once a week minimum' },
      { text: 'Submit weekly status update to mentor',     sub: 'Project progress report' },
    ],
  },
};
