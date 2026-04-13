/* ============================================================
   HeritageAI — Cultural Heritage Preservation System
   script.js: Auth, Navigation, Charts, Animations
   ============================================================ */

/* ============================================================
   1. STATE
   ============================================================ */
const state = {
  user: null,
  currentInnerPage: 'dashboardPage',
  chartsInitialized: false,
};

/* ============================================================
   2. AUTHENTICATION
   ============================================================ */
function handleLogin() {
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !email.includes('@')) {
    showToast('⚠ Please enter a valid email address.');
    return;
  }
  if (password.length < 6) {
    showToast('⚠ Password must be at least 6 characters.');
    return;
  }

  // Simulate login — derive a display name from the email
  const namePart  = email.split('@')[0];
  const formatted = namePart
    .replace(/[._]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  state.user = {
    name:  formatted || 'Dr. Riya Chatterjee',
    email: email,
    initials: getInitials(formatted || 'Riya Chatterjee'),
  };

  // Switch pages
  document.getElementById('loginPage').classList.remove('active');
  document.getElementById('appShell').classList.add('active');

  // Populate profile
  updateProfileUI();

  // Set date
  setHeaderDate();

  // Init charts once
  if (!state.chartsInitialized) {
    initCharts();
    animateCounters();
    animateProgressBars();
    state.chartsInitialized = true;
  }

  showToast('✓ Welcome back, ' + state.user.name + '!');
}

function handleLogout() {
  document.getElementById('appShell').classList.remove('active');
  document.getElementById('loginPage').classList.add('active');

  // Clear inputs
  document.getElementById('email').value    = '';
  document.getElementById('password').value = '';

  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');

  state.user = null;
  showToast('👋 Logged out successfully.');
}

/* Allow Enter key to submit login */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('password').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin();
  });
  document.getElementById('email').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin();
  });
});

/* ============================================================
   3. NAVIGATION
   ============================================================ */
function navigate(event, pageId) {
  event.preventDefault();

  // Hide all inner pages
  document.querySelectorAll('.inner-page').forEach(p => p.classList.remove('active'));

  // Show target
  const target = document.getElementById(pageId);
  if (target) target.classList.add('active');

  // Update nav active state
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === pageId);
  });

  state.currentInnerPage = pageId;

  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
  const sidebar = document.getElementById('sidebar');
  const hamburger = document.querySelector('.hamburger');
  if (
    sidebar.classList.contains('open') &&
    !sidebar.contains(e.target) &&
    e.target !== hamburger
  ) {
    sidebar.classList.remove('open');
  }
});

/* ============================================================
   4. PROFILE UI
   ============================================================ */
function updateProfileUI() {
  const user = state.user;
  if (!user) return;

  // Sidebar user info
  document.getElementById('sidebarUser').innerHTML =
    `<strong style="display:block;color:#fff;font-size:0.88rem">${user.name}</strong>
     <span style="font-size:0.75rem;opacity:0.6">${user.email}</span>`;

  // Profile page
  document.getElementById('avatarInitials').textContent = user.initials;
  document.getElementById('profileName').textContent    = user.name;
  document.getElementById('detailName').textContent     = user.name;
  document.getElementById('detailEmail').textContent    = user.email;
}

function getInitials(name) {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();
}

function showEditToast() {
  showToast('✏ Edit Profile — feature coming soon!');
}

/* ============================================================
   5. DATE
   ============================================================ */
function setHeaderDate() {
  const el = document.getElementById('headerDate');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/* ============================================================
   6. CHARTS (Chart.js)
   ============================================================ */
function initCharts() {
  initCrowdChart();
  initConditionChart();
}

function initCrowdChart() {
  const ctx = document.getElementById('crowdChart');
  if (!ctx) return;

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const actual     = [3200, 2850, 3400, 3100, 3750, 4200, 3900];
  const predicted  = [3100, 2900, 3500, 3200, 3800, 4300, 4000];

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: days,
      datasets: [
        {
          label: 'Actual',
          data: actual,
          borderColor: '#8b4513',
          backgroundColor: 'rgba(139,69,19,0.08)',
          borderWidth: 2.5,
          pointBackgroundColor: '#8b4513',
          pointRadius: 5,
          tension: 0.4,
          fill: true,
        },
        {
          label: 'AI Predicted',
          data: predicted,
          borderColor: '#d4a853',
          backgroundColor: 'rgba(212,168,83,0.06)',
          borderWidth: 2,
          borderDash: [6, 4],
          pointBackgroundColor: '#d4a853',
          pointRadius: 4,
          tension: 0.4,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#7a6a55',
            font: { family: 'DM Sans', size: 12 },
            boxWidth: 14,
            padding: 16,
          },
        },
        tooltip: {
          backgroundColor: '#2a1408',
          titleColor: '#d4a853',
          bodyColor: '#fff',
          cornerRadius: 8,
          padding: 10,
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: { color: '#7a6a55', font: { family: 'DM Sans' } },
        },
        y: {
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: { color: '#7a6a55', font: { family: 'DM Sans' } },
          beginAtZero: false,
        },
      },
    },
  });
}

function initConditionChart() {
  const ctx = document.getElementById('conditionChart');
  if (!ctx) return;

  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
  const data   = [82, 84, 83, 85, 86, 87, 87];

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        {
          label: 'Avg. Condition Score (%)',
          data: data,
          backgroundColor: months.map((_, i) =>
            i === months.length - 1
              ? 'rgba(139,69,19,0.85)'
              : 'rgba(139,69,19,0.25)'
          ),
          borderColor: '#8b4513',
          borderWidth: 1.5,
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#2a1408',
          titleColor: '#d4a853',
          bodyColor: '#fff',
          cornerRadius: 8,
          padding: 10,
          callbacks: {
            label: ctx => ' Score: ' + ctx.parsed.y + '%',
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#7a6a55', font: { family: 'DM Sans' } },
        },
        y: {
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: { color: '#7a6a55', font: { family: 'DM Sans' }, callback: v => v + '%' },
          min: 75,
          max: 100,
        },
      },
    },
  });
}

/* ============================================================
   7. COUNTER ANIMATION
   ============================================================ */
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1500;
    const step = 16;
    const increment = target / (duration / step);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        el.textContent = target.toLocaleString('en-IN');
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current).toLocaleString('en-IN');
      }
    }, step);
  });
}

/* ============================================================
   8. PROGRESS BAR ANIMATION
   ============================================================ */
function animateProgressBars() {
  // Store the real widths first, then animate
  document.querySelectorAll('.progress-fill').forEach(fill => {
    const realWidth = fill.style.width;
    fill.style.width = '0%';
    setTimeout(() => {
      fill.style.width = realWidth;
    }, 300);
  });
}

/* ============================================================
   9. TOAST NOTIFICATION
   ============================================================ */
let toastTimer = null;

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}
