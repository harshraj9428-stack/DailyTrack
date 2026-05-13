/* ══════════════════════════════════════════════════════
   DailyTrack — auth.js
   Authentication logic and Firestore data synchronization
   ══════════════════════════════════════════════════════ */

import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
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
let pendingSync = false;
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
const welcomeLoginBtn = document.getElementById('welcome-login-btn');

// Consolidated Auth Initialization
async function initAuth() {
  try {
    // 1. Handle Redirect Result (for Google Login)
    const result = await getRedirectResult(auth);
    if (result?.user) {
      console.log("Redirect login successful:", result.user.email);
      if (window.Toast) window.Toast.show('Google login successful!', '🌐');
    }
  } catch (error) {
    console.error("Redirect error:", error);
    const friendly = mapAuthError(error.code);
    if (window.Toast) window.Toast.show(friendly, '❌');
  }

  // 2. Listen for Auth State Changes
  onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    
    if (user) {
      console.log("User logged in:", user.email || "Guest");
      document.body.classList.remove('unauthenticated');
      updateAuthUI(true);
      
      // Perform sync before removing loader to avoid UI "jump"
      await syncDataFromFirestore();
    } else {
      console.log("User logged out");
      document.body.classList.add('unauthenticated');
      updateAuthUI(false);
    }

    // Finalize loading state
    hideLoadingOverlay();
  });
}

function hideLoadingOverlay() {
  document.body.classList.remove('loading');
  const loadingOverlay = document.getElementById('loading-overlay');
  if (loadingOverlay) {
    loadingOverlay.classList.add('fade-out');
    setTimeout(() => {
      loadingOverlay.style.display = 'none';
    }, 500);
  }
}

// Start Auth Init
initAuth();

// Map Firebase Error Codes to User Friendly Messages
function mapAuthError(code) {
  switch (code) {
    case 'auth/invalid-email': return 'Invalid email address format.';
    case 'auth/user-not-found': return 'No account found with this email.';
    case 'auth/wrong-password': return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use': return 'An account already exists with this email.';
    case 'auth/weak-password': return 'Password is too weak (min 6 chars).';
    case 'auth/invalid-credential': return 'Invalid login credentials.';
    case 'auth/popup-closed-by-user': return 'Login window was closed.';
    case 'auth/cancelled-via-redirect': return 'Login was cancelled.';
    case 'auth/network-request-failed': return 'Network error. Check your connection.';
    case 'auth/too-many-requests': return 'Too many attempts. Try again later.';
    case 'auth/user-disabled': return 'This account has been disabled.';
    case 'auth/operation-not-allowed': return 'This login method is not enabled.';
    default: return 'Authentication failed. Please try again.';
  }
}

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
  const confirmGroup = document.getElementById('confirm-password-group');
  const confirmInput = document.getElementById('auth-confirm-password');

  if (mode === 'login') {
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
    authSubmitBtn.textContent = 'Login to Account';
    confirmGroup?.classList.add('hidden');
    if (confirmInput) confirmInput.required = false;
    document.getElementById('auth-email')?.focus();
  } else {
    tabLogin.classList.remove('active');
    tabSignup.classList.add('active');
    authSubmitBtn.textContent = 'Create Account';
    confirmGroup?.classList.remove('hidden');
    if (confirmInput) confirmInput.required = true;
    document.getElementById('auth-email')?.focus();
  }
}

// ── Event Listeners ───────────────────────────────────
loginTrigger?.addEventListener('click', () => {
  authModal.classList.add('show');
  document.getElementById('auth-email')?.focus();
});
welcomeLoginBtn?.addEventListener('click', () => {
  authModal.classList.add('show');
  document.getElementById('auth-email')?.focus();
});
tabLogin?.addEventListener('click', () => switchTab('login'));
tabSignup?.addEventListener('click', () => switchTab('signup'));

logoutBtn?.addEventListener('click', () => {
  signOut(auth).then(() => {
    if (window.Toast) window.Toast.show('Logged out successfully', '👋');
    // Clear local tasks if we want to be strict, but keeping them for guest experience
  });
});

authForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const emailInput = document.getElementById('auth-email');
  const passInput = document.getElementById('auth-password');
  const confirmInput = document.getElementById('auth-confirm-password');
  const modalInner = authModal?.querySelector('.modal');

  const email = emailInput.value.trim();
  const password = passInput.value;
  const confirm = confirmInput?.value;

  // Clear previous errors
  [emailInput, passInput, confirmInput].forEach(el => el?.classList.remove('error-field'));

  // Basic Validation
  if (!email || !password) {
    triggerErrorFeedback(modalInner, 'Please fill all fields');
    return;
  }
  if (password.length < 6) {
    passInput.classList.add('error-field');
    triggerErrorFeedback(modalInner, 'Password must be 6+ chars');
    return;
  }
  if (authMode === 'signup' && password !== confirm) {
    confirmInput.classList.add('error-field');
    triggerErrorFeedback(modalInner, 'Passwords do not match');
    return;
  }

  // Set Loading State
  const originalText = authSubmitBtn.textContent;
  authSubmitBtn.disabled = true;
  authSubmitBtn.textContent = 'Authenticating...';

  try {
    if (authMode === 'login') {
      await signInWithEmailAndPassword(auth, email, password);
      if (window.Toast) window.Toast.show('Welcome back!', '🔑');
    } else {
      await createUserWithEmailAndPassword(auth, email, password);
      if (window.Toast) window.Toast.show('Account created!', '🌱');
    }
  } catch (error) {
    console.error("Auth error:", error);
    const friendly = mapAuthError(error.code);
    triggerErrorFeedback(modalInner, friendly);
    
    if (error.code.includes('password')) passInput.classList.add('error-field');
    if (error.code.includes('email')) emailInput.classList.add('error-field');
  } finally {
    authSubmitBtn.disabled = false;
    authSubmitBtn.textContent = originalText;
  }
});

function triggerErrorFeedback(element, message) {
  if (window.Toast) window.Toast.show(message, '❌');
  if (element) {
    element.classList.add('shake');
    setTimeout(() => element.classList.remove('shake'), 400);
  }
}

googleBtn?.addEventListener('click', async () => {
  try {
    googleBtn.disabled = true;
    const originalContent = googleBtn.innerHTML;
    googleBtn.innerHTML = 'Connecting...';
    
    // Switch to Redirect to avoid COOP popup blocks on localhost
    await signInWithRedirect(auth, googleProvider);
  } catch (error) {
    console.error("Google login error:", error);
    if (window.Toast) window.Toast.show(error.message, '❌');
    googleBtn.disabled = false;
  }
});

guestBtn?.addEventListener('click', async () => {
  try {
    guestBtn.disabled = true;
    guestBtn.innerHTML = 'Signing in...';
    await signInAnonymously(auth);
    if (window.Toast) window.Toast.show('Continuing as Guest', '👤');
  } catch (error) {
    console.error("Guest login error:", error);
    if (window.Toast) window.Toast.show(error.message, '❌');
    guestBtn.disabled = false;
    guestBtn.innerHTML = '<span class="feat-icon">👤</span> Continue as Guest';
  }
});

// ── Data Syncing ───────────────────────────────────────
async function syncDataFromFirestore() {
  if (!currentUser) return;
  
  try {
    const userDocRef = doc(db, 'users', currentUser.uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.tasks) {
        console.log("Syncing tasks from Firestore");
        // Overwrite local state with cloud state for consistency.
        window.tasks = Array.isArray(data.tasks) ? data.tasks : [];
        window.renderTasks();
        
        // Update history if exists
        if (data.history) {
          localStorage.setItem(window.STORAGE_KEYS?.history || 'dt_eff_history', JSON.stringify(data.history));
        }

        // Update streak if exists
        if (data.streak !== undefined) {
          localStorage.setItem(window.STORAGE_KEYS?.streak || 'dt_streak', data.streak);
          if (window.Streak) window.Streak.render();
        }
      }
    } else {
      // New user, save current local tasks to Firestore
      console.log("Creating new user profile in Firestore");
      await saveDataToFirestore();
    }
  } catch (err) {
    console.error("Firestore sync error:", err);
    if (window.Toast) window.Toast.show("Cloud sync failed. Working offline.", "📡");
  }
}

async function saveDataToFirestore() {
  if (!currentUser) return;
  if (isSyncing) {
    pendingSync = true;
    return;
  }
  
  const syncInd = document.getElementById('sync-indicator');
  const syncTxt = syncInd?.querySelector('.sync-text');

  isSyncing = true;
  pendingSync = false;
  
  if (syncInd) {
    syncInd.classList.add('syncing');
    syncTxt.textContent = 'Syncing...';
  }

  try {
    const userDocRef = doc(db, 'users', currentUser.uid);
    await setDoc(userDocRef, {
      tasks: window.tasks || [],
      history: JSON.parse(localStorage.getItem(window.STORAGE_KEYS?.history || 'dt_eff_history') || '{}'),
      streak: parseInt(localStorage.getItem(window.STORAGE_KEYS?.streak || 'dt_streak') || '0'),
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
    // If a sync was requested while we were busy, trigger it now
    if (pendingSync) {
      saveDataToFirestore();
    }
  }
}

// Expose sync to global scope for tasks.js to call
window.saveDataToFirestore = saveDataToFirestore;
