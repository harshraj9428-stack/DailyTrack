/* ══════════════════════════════════════════════════════
   DailyTrack — auth.js
   Authentication logic and Firestore data synchronization
   ══════════════════════════════════════════════════════ */

import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signInAnonymously, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot
} from './firebase-config.js';

// ── State ─────────────────────────────────────────────
let currentUser = null;
let isSyncing = false;
let authMode = 'login'; // 'login' or 'signup'

// ── Elements ──────────────────────────────────────────
const authModal = document.getElementById('auth-modal');
const loginTrigger = document.getElementById('login-trigger');
const userInfoEl = document.getElementById('user-info');
const displayNameEl = document.getElementById('display-name');
const logoutBtn = document.getElementById('logout-btn');

const tabLogin = document.getElementById('tab-login');
const tabSignup = document.getElementById('tab-signup');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const authForm = document.getElementById('email-auth-form');
const googleBtn = document.getElementById('google-login');
const guestBtn = document.getElementById('guest-login');

// ── Initialization ─────────────────────────────────────
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (user) {
    console.log("User logged in:", user.email || "Guest");
    updateAuthUI(true);
    await syncDataFromFirestore();
  } else {
    console.log("User logged out");
    updateAuthUI(false);
    // When logged out, we rely on localStorage as before
  }
});

// ── UI Updates ─────────────────────────────────────────
function updateAuthUI(isLoggedIn) {
  const syncInd = document.getElementById('sync-indicator');
  const syncTxt = syncInd?.querySelector('.sync-text');

  if (isLoggedIn) {
    loginTrigger.classList.add('hidden');
    userInfoEl.classList.remove('hidden');
    displayNameEl.textContent = currentUser.displayName || currentUser.email || 'Guest';
    authModal.classList.remove('show');
    
    if (syncInd) {
      syncInd.classList.add('synced');
      syncTxt.textContent = 'Cloud Synced';
    }
  } else {
    loginTrigger.classList.remove('hidden');
    userInfoEl.classList.add('hidden');
    
    if (syncInd) {
      syncInd.classList.remove('synced', 'syncing');
      syncTxt.textContent = 'Local Only';
    }
  }
}

function switchTab(mode) {
  authMode = mode;
  if (mode === 'login') {
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
    authSubmitBtn.textContent = 'Login to Account';
  } else {
    tabLogin.classList.remove('active');
    tabSignup.classList.add('active');
    authSubmitBtn.textContent = 'Create Account';
  }
}

// ── Event Listeners ───────────────────────────────────
loginTrigger?.addEventListener('click', () => authModal.classList.add('show'));
tabLogin?.addEventListener('click', () => switchTab('login'));
tabSignup?.addEventListener('click', () => switchTab('signup'));

logoutBtn?.addEventListener('click', () => {
  signOut(auth).then(() => {
    window.Toast.show('Logged out successfully', '👋');
    // Clear local tasks if we want to be strict, but keeping them for guest experience
  });
});

authForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;

  try {
    if (authMode === 'login') {
      await signInWithEmailAndPassword(auth, email, password);
      window.Toast.show('Welcome back!', '🔑');
    } else {
      await createUserWithEmailAndPassword(auth, email, password);
      window.Toast.show('Account created!', '🌱');
    }
  } catch (error) {
    console.error("Auth error:", error);
    window.Toast.show(error.message, '❌');
  }
});

googleBtn?.addEventListener('click', async () => {
  try {
    await signInWithPopup(auth, googleProvider);
    window.Toast.show('Signed in with Google', '🌐');
  } catch (error) {
    console.error("Google login error:", error);
    window.Toast.show(error.message, '❌');
  }
});

guestBtn?.addEventListener('click', async () => {
  try {
    await signInAnonymously(auth);
    window.Toast.show('Continuing as Guest', '👤');
  } catch (error) {
    console.error("Guest login error:", error);
    window.Toast.show(error.message, '❌');
  }
});

// ── Data Syncing ───────────────────────────────────────
async function syncDataFromFirestore() {
  if (!currentUser) return;
  
  const userDocRef = doc(db, 'users', currentUser.uid);
  const docSnap = await getDoc(userDocRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    if (data.tasks) {
      console.log("Syncing tasks from Firestore");
      // Merge logic or overwrite? User expectation is usually sync.
      // We overwrite local state with cloud state for consistency.
      window.tasks = data.tasks;
      window.renderTasks();
      
      // Update history if exists
      if (data.history) {
        localStorage.setItem('DAILYTRACK_HISTORY', JSON.stringify(data.history));
      }
    }
  } else {
    // New user, save current local tasks to Firestore
    console.log("Creating new user profile in Firestore");
    await saveDataToFirestore();
  }
}

async function saveDataToFirestore() {
  if (!currentUser || isSyncing) return;
  
  const syncInd = document.getElementById('sync-indicator');
  const syncTxt = syncInd?.querySelector('.sync-text');

  isSyncing = true;
  if (syncInd) {
    syncInd.classList.add('syncing');
    syncTxt.textContent = 'Syncing...';
  }

  try {
    const userDocRef = doc(db, 'users', currentUser.uid);
    await setDoc(userDocRef, {
      tasks: window.tasks,
      history: JSON.parse(localStorage.getItem(window.STORAGE_KEYS?.history || 'dt_eff_history') || '{}'),
      lastSync: Date.now()
    }, { merge: true });
    
    if (syncInd) {
      syncInd.classList.remove('syncing');
      syncInd.classList.add('synced');
      syncTxt.textContent = 'Cloud Synced';
    }
    console.log("Data saved to Firestore");
  } catch (error) {
    console.error("Firestore save error:", error);
    if (syncInd) {
      syncInd.classList.remove('syncing');
      syncTxt.textContent = 'Sync Error';
    }
  } finally {
    isSyncing = false;
  }
}

// Expose sync to global scope for tasks.js to call
window.saveDataToFirestore = saveDataToFirestore;
