/* ============================================
   ডিজিটাল সার্ভিস সেন্টার — app.js
   সম্পূর্ণ লজিক: Auth, OTP, সার্ভিস, হিসাব, ইনভয়েস
   ============================================ */

/* =====================
   DEFAULT SERVICES
   ===================== */
const DEFAULT_SERVICES = [
  { name: 'নতুন জন্ম নিবন্ধন আবেদন',                    price: 150 },
  { name: 'জন্ম নিবন্ধন সংশোধন আবেদন',                   price: 150 },
  { name: 'জন্মনিবন্ধন বাংলা থেকে ইংরেজি/ডিজিটাল',       price: 150 },
  { name: 'মৃত্যু সনদ আবেদন',                             price: 150 },
  { name: 'মৃত্যু সনদ সংশোধন আবেদন',                      price: 150 },
  { name: 'নতুন ভোটার আইডি কার্ড আবেদন',                  price: 150 },
  { name: 'ভোটার আইডি কার্ড সংশোধন আবেদন',               price: 200 },
  { name: 'অনলাইন জিডি আবেদন',                            price: 250 },
  { name: 'টিন সার্টিফিকেট তৈরি',                         price: 150 },
  { name: 'জিরো রিটার্ন',                                  price: 200 },
  { name: 'ই-চালান ভ্যাট ও আয়কর',                        price: 20  },
  { name: 'প্রত্যয়নপত্র',                                  price: 30  },
  { name: 'দরখাস্ত',                                       price: 60  },
  { name: 'পাসপোর্ট ও স্ট্যাম্প সাইজ ফটো (৪ পিস)',        price: 40  }
];

/* =====================
   OTP STATE
   ===================== */
let otpCode       = null;
let otpExpiry     = null;
let otpTimerRef   = null;
let resetUserId   = null;

/* =====================
   STORAGE HELPERS
   ===================== */
function getUsers()              { return JSON.parse(localStorage.getItem('dsc_users')     || '{}'); }
function saveUsers(u)            { localStorage.setItem('dsc_users',     JSON.stringify(u)); }
function currentUser()           { return localStorage.getItem('dsc_current'); }
function setCurrentUser(id)      { localStorage.setItem('dsc_current', id); }
function clearCurrentUser()      { localStorage.removeItem('dsc_current'); }

function getServices() {
  const s = localStorage.getItem('dsc_services');
  return s ? JSON.parse(s) : JSON.parse(JSON.stringify(DEFAULT_SERVICES));
}
function saveServicesConfig(arr) { localStorage.setItem('dsc_services', JSON.stringify(arr)); }

function getEntries() {
  const u = currentUser(); if (!u) return [];
  return JSON.parse(localStorage.getItem('dsc_entries_' + u) || '[]');
}
function saveEntries(arr) {
  const u = currentUser(); if (!u) return;
  localStorage.setItem('dsc_entries_' + u, JSON.stringify(arr));
}

function getShopInfo() {
  return JSON.parse(localStorage.getItem('dsc_shop') || '{"name":"ডিজিটাল সার্ভিস সেন্টার","address":"","phone":""}');
}
function saveShopInfoData(info) { localStorage.setItem('dsc_shop', JSON.stringify(info)); }

/* =====================
   DATE HELPERS
   ===================== */
function todayStr() { return new Date().toISOString().split('T')[0]; }

function fmtDate(d) {
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('bn-BD', { day: '2-digit', month: 'short', year: 'numeric' });
}

function toNum(n) {
  return String(n).replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[d]);
}

/* =====================
   AUTH — SWITCH
   ===================== */
function switchAuth(tab) {
  ['login','reg','reset'].forEach(t => {
    document.getElementById(t + '-form').style.display = 'none';
    document.getElementById('tab-' + t + '-btn').classList.remove('active');
  });
  document.getElementById(tab + '-form').style.display = '';
  document.getElementById('tab-' + tab + '-btn').classList.add('active');
  clearMsgs();
}

function clearMsgs() {
  ['login-msg','reg-msg','reset-msg-1','reset-msg-2','reset-msg-3'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent = ''; el.className = 'auth-msg'; }
  });
}

function setMsg(id, text, type = 'error') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = 'auth-msg ' + type;
}

/* =====================
   PASSWORD SHOW/HIDE
   ===================== */
function togglePass(inputId, btn) {
  const inp = document.getElementById(inputId);
  const isPass = inp.type === 'password';
  inp.type = isPass ? 'text' : 'password';
  // swap icon
  btn.innerHTML = isPass
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
}

/* =====================
   PASSWORD STRENGTH
   ===================== */
document.addEventListener('DOMContentLoaded', () => {
  const regPass = document.getElementById('reg-pass');
  if (regPass) {
    regPass.addEventListener('input', function () {
      const val = this.value;
      const wrap = document.getElementById('strength-wrap');
      const fill = document.getElementById('strength-fill');
      const label = document.getElementById('strength-label');
      if (!val) { wrap.style.display = 'none'; return; }
      wrap.style.display = 'flex';
      let score = 0;
      if (val.length >= 6) score++;
      if (val.length >= 10) score++;
      if (/[A-Z]/.test(val)) score++;
      if (/[0-9]/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;
      const levels = [
        { pct: '20%', color: '#e04040', text: 'খুব দুর্বল' },
        { pct: '40%', color: '#e07030', text: 'দুর্বল' },
        { pct: '60%', color: '#d4a020', text: 'মোটামুটি' },
        { pct: '80%', color: '#3a9a50', text: 'শক্তিশালী' },
        { pct: '100%',color: '#1a7030', text: 'খুব শক্তিশালী' }
      ];
      const lv = levels[Math.min(score - 1, 4)] || levels[0];
      fill.style.width = lv.pct;
      fill.style.background = lv.color;
      label.textContent = lv.text;
      label.style.color = lv.color;
    });
  }

  // Init app on load
  if (currentUser()) {
    showApp();
  } else {
    document.getElementById('auth-screen').style.display = 'flex';
  }
});

/* =====================
   REGISTER
   ===================== */
function doRegister() {
  const name  = document.getElementById('reg-name').value.trim();
  const id    = document.getElementById('reg-id').value.trim();
  const pass  = document.getElementById('reg-pass').value;
  const pass2 = document.getElementById('reg-pass2').value;

  if (!name)           return setMsg('reg-msg', 'নাম দিন');
  if (!id)             return setMsg('reg-msg', 'ইমেইল বা মোবাইল নম্বর দিন');
  if (pass.length < 6) return setMsg('reg-msg', 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে');
  if (pass !== pass2)  return setMsg('reg-msg', 'দুটি পাসওয়ার্ড মিলছে না');

  const users = getUsers();
  if (users[id]) return setMsg('reg-msg', 'এই ইমেইল/মোবাইল দিয়ে আগেই অ্যাকাউন্ট আছে');

  users[id] = { name, password: pass, createdAt: new Date().toISOString() };
  saveUsers(users);
  setCurrentUser(id);
  showApp();
  showToast('অ্যাকাউন্ট তৈরি হয়েছে! স্বাগতম ' + name, 'success');
}

/* =====================
   LOGIN
   ===================== */
function doLogin() {
  const id   = document.getElementById('login-id').value.trim();
  const pass = document.getElementById('login-pass').value;

  if (!id || !pass) return setMsg('login-msg', 'সব তথ্য পূরণ করুন');

  const users = getUsers();
  if (!users[id] || users[id].password !== pass)
    return setMsg('login-msg', 'ভুল ইমেইল/মোবাইল বা পাসওয়ার্ড');

  setCurrentUser(id);
  showApp();
  showToast('লগইন সফল! স্বাগতম ' + users[id].name, 'success');
}

/* =====================
   LOGOUT
   ===================== */
function doLogout() {
  clearCurrentUser();
  document.getElementById('app-screen').style.display = 'none';
  document.getElementById('auth-screen').style.display = 'flex';
  document.getElementById('login-id').value = '';
  document.getElementById('login-pass').value = '';
  switchAuth('login');
}

/* =====================
   OTP — SEND
   ===================== */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function sendOTP() {
  const id = document.getElementById('reset-id').value.trim();
  if (!id) return setMsg('reset-msg-1', 'ইমেইল বা মোবাইল নম্বর দিন');

  const users = getUsers();
  if (!users[id]) return setMsg('reset-msg-1', 'এই ইমেইল/মোবাইল দিয়ে কোনো অ্যাকাউন্ট নেই');

  otpCode    = generateOTP();
  otpExpiry  = Date.now() + 5 * 60 * 1000; // 5 মিনিট
  resetUserId = id;

  // Demo: OTP দেখানো হচ্ছে (real app-এ email/SMS পাঠানো হবে)
  document.getElementById('otp-demo-note').innerHTML =
    `<strong>⚠️ ডেমো মোড:</strong> বাস্তব অ্যাপে এই OTP আপনার ইমেইল/মোবাইলে যাবে।<br>
     আপনার OTP কোড: <strong style="font-size:18px;letter-spacing:4px">${otpCode}</strong>`;

  document.getElementById('reset-step-1').style.display = 'none';
  document.getElementById('reset-step-2').style.display = '';
  startOTPTimer();
}

function startOTPTimer() {
  clearInterval(otpTimerRef);
  const timerEl   = document.getElementById('otp-timer');
  const resendBtn = document.getElementById('resend-btn');
  resendBtn.disabled = true;

  otpTimerRef = setInterval(() => {
    const left = Math.max(0, Math.round((otpExpiry - Date.now()) / 1000));
    const m = Math.floor(left / 60);
    const s = left % 60;
    timerEl.textContent = left > 0
      ? `OTP মেয়াদ শেষ হবে: ${m}:${String(s).padStart(2,'0')}`
      : 'OTP মেয়াদ শেষ হয়েছে';
    if (left === 0) {
      clearInterval(otpTimerRef);
      resendBtn.disabled = false;
    }
  }, 1000);
}

function resendOTP() {
  otpCode   = generateOTP();
  otpExpiry = Date.now() + 5 * 60 * 1000;
  document.getElementById('otp-demo-note').innerHTML =
    `<strong>⚠️ ডেমো মোড:</strong> নতুন OTP পাঠানো হয়েছে।<br>
     আপনার OTP কোড: <strong style="font-size:18px;letter-spacing:4px">${otpCode}</strong>`;
  document.getElementById('otp-input').value = '';
  setMsg('reset-msg-2', 'নতুন OTP পাঠানো হয়েছে', 'success');
  startOTPTimer();
}

function verifyOTP() {
  const entered = document.getElementById('otp-input').value.trim();
  if (!entered) return setMsg('reset-msg-2', 'OTP কোড দিন');
  if (Date.now() > otpExpiry) return setMsg('reset-msg-2', 'OTP মেয়াদ শেষ হয়েছে। পুনরায় পাঠান।');
  if (entered !== otpCode)    return setMsg('reset-msg-2', 'ভুল OTP কোড। আবার চেষ্টা করুন।');

  clearInterval(otpTimerRef);
  document.getElementById('reset-step-2').style.display = 'none';
  document.getElementById('reset-step-3').style.display = '';
  setMsg('reset-msg-3', '', 'success');
}

function resetPassword() {
  const np  = document.getElementById('new-pass').value;
  const np2 = document.getElementById('new-pass2').value;

  if (np.length < 6) return setMsg('reset-msg-3', 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে');
  if (np !== np2)    return setMsg('reset-msg-3', 'দুটি পাসওয়ার্ড মিলছে না');

  const users = getUsers();
  if (!users[resetUserId]) return setMsg('reset-msg-3', 'ব্যবহারকারী খুঁজে পাওয়া যায়নি');

  users[resetUserId].password = np;
  saveUsers(users);

  setMsg('reset-msg-3', 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!', 'success');
  setTimeout(() => {
    // Reset state
    document.getElementById('reset-step-1').style.display = '';
    document.getElementById('reset-step-2').style.display = 'none';
    document.getElementById('reset-step-3').style.display = 'none';
    document.getElementById('reset-id').value = '';
    document.getElementById('otp-input').value = '';
    document.getElementById('new-pass').value = '';
    document.getElementById('new-pass2').value = '';
    otpCode = null; resetUserId = null;
    switchAuth('login');
    showToast('পাসওয়ার্ড পরিবর্তন হয়েছে। লগইন করুন।', 'success');
  }, 1500);
}

/* =====================
   SHOW APP
   ===================== */
function showApp() {
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('app-screen').style.display  = '';

  const u     = currentUser();
  const users = getUsers();
  const name  = users[u] ? users[u].name : u;
  document.getElementById('user-display').textContent = name;

  initApp();
}

/* =====================
   INIT APP
   ===================== */
function initApp() {
  renderServiceGrid();
  renderToday();
  setupDateFilters();
  updateTopbarShopName();
  document.getElementById('today-date-label').textContent = fmtDate(todayStr());
}

function updateTopbarShopName() {
  const shop = getShopInfo();
  document.getElementById('topbar-shop-name').textContent = shop.name;
}

function setupDateFilters() {
  const today = new Date();
  // Week: find last Sunday
  const day = today.getDay();
  const sun = new Date(today);
  sun.setDate(today.getDate() - day);
  document.getElementById('week-start').value = sun.toISOString().split('T')[0];

  // Month
  document.getElementById('month-filter').value = today.toISOString().slice(0, 7);

  // Years
  const ySel = document.getElementById('year-filter');
  ySel.innerHTML = '';
  for (let y = today.getFullYear(); y >= 2020; y--) {
    const opt = document.createElement('option');
    opt.value = y; opt.textContent = y;
    ySel.appendChild(opt);
  }
}

/* =====================
   SERVICE GRID
   ===================== */
function renderServiceGrid() {
  const services = getServices();
  const grid = document.getElementById('services-grid');
  grid.innerHTML = services.map(s => `
    <div class="service-card" onclick="addEntry('${escQ(s.name)}', ${s.price})">
      <span class="svc-name">${s.name}</span>
      <span class="svc-price">৳${s.price}</span>
      <span class="svc-add-icon" aria-hidden="true">+</span>
    </div>
  `).join('');
}

function escQ(str) { return str.replace(/'/g, "\\'").replace(/"/g, '&quot;'); }

/* =====================
   ADD ENTRY
   ===================== */
function addEntry(name, price) {
  const entries = getEntries();
  entries.push({ id: Date.now(), name, price: Number(price), date: todayStr() });
  saveEntries(entries);
  renderToday();
  showToast('✓ "' + name + '" যোগ হয়েছে', 'success');
}

function addCustomEntry() {
  const name  = document.getElementById('custom-name').value.trim();
  const price = Number(document.getElementById('custom-price').value);
  if (!name)   return showToast('সার্ভিসের নাম দিন', 'error');
  if (!price)  return showToast('মূল্য দিন', 'error');
  addEntry(name, price);
  document.getElementById('custom-name').value  = '';
  document.getElementById('custom-price').value = '';
}

function deleteEntry(id) {
  if (!confirm('এই এন্ট্রিটি মুছে ফেলবেন?')) return;
  const entries = getEntries().filter(e => e.id !== id);
  saveEntries(entries);
  renderToday();
  showToast('এন্ট্রি মুছে ফেলা হয়েছে');
}

/* =====================
   RENDER TODAY
   ===================== */
function renderToday() {
  const today   = todayStr();
  const entries = getEntries().filter(e => e.date === today);
  const total   = entries.reduce((s, e) => s + e.price, 0);

  document.getElementById('today-total').textContent = toNum(total.toLocaleString());
  document.getElementById('today-count').textContent = entries.length;

  const wrap = document.getElementById('today-table-wrap');
  if (entries.length === 0) {
    wrap.innerHTML = '<p class="empty-msg">আজকে এখনো কোনো সার্ভিস যোগ করা হয়নি</p>';
    return;
  }
  wrap.innerHTML = `
    <table>
      <thead><tr><th>#</th><th>সার্ভিসের নাম</th><th>সময়</th><th>মূল্য (৳)</th><th>মুছুন</th></tr></thead>
      <tbody>
        ${entries.map((e, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${e.name}</td>
            <td>${new Date(e.id).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}</td>
            <td><strong>৳${e.price.toLocaleString()}</strong></td>
            <td><button class="del-btn" onclick="deleteEntry(${e.id})">✕ মুছুন</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

/* =====================
   RENDER WEEK
   ===================== */
function renderWeek() {
  const startStr = document.getElementById('week-start').value;
  if (!startStr) return;

  const start = new Date(startStr + 'T00:00:00');
  const end   = new Date(startStr + 'T00:00:00');
  end.setDate(start.getDate() + 4); // রবি–বৃহস্পতি

  const allEntries = getEntries();
  const entries    = allEntries.filter(e => {
    const d = new Date(e.date + 'T00:00:00');
    return d >= start && d <= end;
  });
  const total = entries.reduce((s, e) => s + e.price, 0);
  document.getElementById('week-total').textContent = toNum(total.toLocaleString());

  const days = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার'];
  let summaryHtml = '';
  for (let i = 0; i < 5; i++) {
    const d    = new Date(startStr + 'T00:00:00');
    d.setDate(d.getDate() + i);
    const dStr = d.toISOString().split('T')[0];
    const de   = entries.filter(e => e.date === dStr);
    const dt   = de.reduce((s, e) => s + e.price, 0);
    summaryHtml += `
      <div class="stat-card">
        <div class="stat-label">${days[i]}</div>
        <div class="stat-value">৳${dt.toLocaleString()}</div>
        <div class="stat-sub">${de.length}টি সার্ভিস</div>
      </div>`;
  }
  document.getElementById('week-summary').innerHTML = summaryHtml;
  renderTable(entries, 'week-table-wrap', true);
}

/* =====================
   RENDER MONTH
   ===================== */
function renderMonth() {
  const m = document.getElementById('month-filter').value;
  if (!m) return;

  const entries = getEntries().filter(e => e.date.startsWith(m));
  const total   = entries.reduce((s, e) => s + e.price, 0);
  document.getElementById('month-total').textContent = toNum(total.toLocaleString());

  // Top services
  const svcMap = {};
  entries.forEach(e => { svcMap[e.name] = (svcMap[e.name] || 0) + e.price; });
  const top = Object.entries(svcMap).sort((a, b) => b[1] - a[1]).slice(0, 4);

  let html = `
    <div class="stat-card">
      <div class="stat-label">মোট আয়</div>
      <div class="stat-value">৳${total.toLocaleString()}</div>
      <div class="stat-sub">${entries.length}টি সার্ভিস</div>
    </div>`;
  top.forEach(([name, amt]) => {
    html += `
      <div class="stat-card">
        <div class="stat-label" style="font-size:10px">${name.length > 20 ? name.slice(0,20)+'…' : name}</div>
        <div class="stat-value" style="font-size:17px">৳${amt.toLocaleString()}</div>
      </div>`;
  });
  document.getElementById('month-summary').innerHTML = html;
  renderTable(entries, 'month-table-wrap', true);
}

/* =====================
   RENDER YEARLY
   ===================== */
function renderYearly() {
  const y = document.getElementById('year-filter').value;
  const entries = getEntries().filter(e => e.date.startsWith(y));
  const total   = entries.reduce((s, e) => s + e.price, 0);
  document.getElementById('year-total').textContent = toNum(total.toLocaleString());

  const monthNames = ['জানু','ফেব','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টে','অক্টো','নভে','ডিসে'];
  let html = `
    <div class="stat-card">
      <div class="stat-label">বার্ষিক মোট আয়</div>
      <div class="stat-value">৳${total.toLocaleString()}</div>
      <div class="stat-sub">${entries.length}টি সার্ভিস</div>
    </div>`;
  for (let m = 1; m <= 12; m++) {
    const mStr = `${y}-${String(m).padStart(2, '0')}`;
    const me   = entries.filter(e => e.date.startsWith(mStr));
    const mt   = me.reduce((s, e) => s + e.price, 0);
    if (mt > 0) {
      html += `
        <div class="stat-card">
          <div class="stat-label">${monthNames[m-1]} ${y}</div>
          <div class="stat-value" style="font-size:17px">৳${mt.toLocaleString()}</div>
          <div class="stat-sub">${me.length}টি</div>
        </div>`;
    }
  }
  document.getElementById('year-summary').innerHTML = html;
  renderTable(entries, 'year-table-wrap', true);
}

/* =====================
   RENDER TABLE (generic)
   ===================== */
function renderTable(entries, wrapperId, showDate) {
  const wrap = document.getElementById(wrapperId);
  if (entries.length === 0) {
    wrap.innerHTML = '<p class="empty-msg">এই সময়কালে কোনো সার্ভিস পাওয়া যায়নি</p>';
    return;
  }
  wrap.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>সার্ভিসের নাম</th>
          ${showDate ? '<th>তারিখ</th>' : ''}
          <th style="text-align:right">মূল্য (৳)</th>
        </tr>
      </thead>
      <tbody>
        ${entries.map((e, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${e.name}</td>
            ${showDate ? `<td>${fmtDate(e.date)}</td>` : ''}
            <td style="text-align:right"><strong>৳${e.price.toLocaleString()}</strong></td>
          </tr>
        `).join('')}
      </tbody>
    </table>`;
}

/* =====================
   NAV TABS
   ===================== */
function showTab(tab, btn) {
  ['today', 'week', 'month', 'yearly', 'settings'].forEach(t => {
    document.getElementById('tab-' + t).style.display = t === tab ? '' : 'none';
  });
  document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  if (tab === 'week')     renderWeek();
  if (tab === 'month')    renderMonth();
  if (tab === 'yearly')   renderYearly();
  if (tab === 'settings') renderSettings();
}

/* =====================
   SETTINGS
   ===================== */
function renderSettings() {
  const shop = getShopInfo();
  document.getElementById('shop-name').value    = shop.name;
  document.getElementById('shop-address').value = shop.address;
  document.getElementById('shop-phone').value   = shop.phone;

  const services = getServices();
  const list = document.getElementById('settings-services');
  list.innerHTML = services.map((s, i) => `
    <div class="settings-svc-row">
      <input type="text"   value="${escQ(s.name)}" id="svc-name-${i}"  placeholder="সার্ভিসের নাম">
      <input type="number" value="${s.price}"       id="svc-price-${i}" placeholder="মূল্য" min="0">
    </div>
  `).join('');
}

function saveShopInfo() {
  const info = {
    name:    document.getElementById('shop-name').value.trim()    || 'ডিজিটাল সার্ভিস সেন্টার',
    address: document.getElementById('shop-address').value.trim(),
    phone:   document.getElementById('shop-phone').value.trim()
  };
  saveShopInfoData(info);
  updateTopbarShopName();
  showToast('দোকানের তথ্য সংরক্ষিত হয়েছে', 'success');
}

function saveServicePrices() {
  const services = getServices();
  services.forEach((s, i) => {
    const n = document.getElementById('svc-name-'  + i);
    const p = document.getElementById('svc-price-' + i);
    if (n && p) {
      s.name  = n.value.trim() || s.name;
      s.price = Number(p.value) || s.price;
    }
  });
  saveServicesConfig(services);
  renderServiceGrid();
  showToast('মূল্য তালিকা আপডেট হয়েছে', 'success');
}

function changePassword() {
  const curP  = document.getElementById('cur-pass').value;
  const newP  = document.getElementById('chg-pass').value;
  const newP2 = document.getElementById('chg-pass2').value;

  const u = currentUser();
  const users = getUsers();

  if (!users[u] || users[u].password !== curP)
    return setMsg('chg-pass-msg', 'বর্তমান পাসওয়ার্ড সঠিক নয়');
  if (newP.length < 6)
    return setMsg('chg-pass-msg', 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে');
  if (newP !== newP2)
    return setMsg('chg-pass-msg', 'নতুন পাসওয়ার্ড দুটি মিলছে না');

  users[u].password = newP;
  saveUsers(users);
  document.getElementById('cur-pass').value  = '';
  document.getElementById('chg-pass').value  = '';
  document.getElementById('chg-pass2').value = '';
  setMsg('chg-pass-msg', 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!', 'success');
  showToast('পাসওয়ার্ড পরিবর্তন হয়েছে', 'success');
}

/* =====================
   INVOICE
   ===================== */
function showInvoice(type) {
  const shop = getShopInfo();
  document.getElementById('inv-shop-name').textContent  = shop.name;
  document.getElementById('inv-shop-addr').textContent  = shop.address;
  document.getElementById('inv-shop-phone').textContent = shop.phone ? '📞 ' + shop.phone : '';
  document.getElementById('inv-gen-date').textContent   = 'তৈরির তারিখ: ' + fmtDate(todayStr());

  let entries = [], periodLabel = '', leftMeta = '';

  if (type === 'today') {
    entries     = getEntries().filter(e => e.date === todayStr());
    periodLabel = 'আজকের রিপোর্ট — ' + fmtDate(todayStr());
    leftMeta    = 'দৈনিক';
  } else if (type === 'week') {
    const startStr = document.getElementById('week-start').value;
    if (!startStr) return showToast('সপ্তাহের তারিখ সেট করুন', 'error');
    const start = new Date(startStr + 'T00:00:00');
    const end   = new Date(startStr + 'T00:00:00');
    end.setDate(start.getDate() + 4);
    entries     = getEntries().filter(e => {
      const d = new Date(e.date + 'T00:00:00');
      return d >= start && d <= end;
    });
    periodLabel = `সাপ্তাহিক রিপোর্ট — ${fmtDate(startStr)} থেকে ${fmtDate(end.toISOString().split('T')[0])}`;
    leftMeta    = 'সাপ্তাহিক (রবি–বৃহস্পতি)';
  } else if (type === 'month') {
    const m = document.getElementById('month-filter').value;
    entries     = getEntries().filter(e => e.date.startsWith(m));
    periodLabel = 'মাসিক রিপোর্ট — ' + m;
    leftMeta    = 'মাসিক';
  } else if (type === 'yearly') {
    const y = document.getElementById('year-filter').value;
    entries     = getEntries().filter(e => e.date.startsWith(y));
    periodLabel = 'বার্ষিক রিপোর্ট — ' + y;
    leftMeta    = 'বার্ষিক';
  }

  const total = entries.reduce((s, e) => s + e.price, 0);
  document.getElementById('inv-period').textContent     = periodLabel;
  document.getElementById('inv-left-meta').textContent  = `ধরন: ${leftMeta}`;
  document.getElementById('inv-right-meta').textContent = `মোট সার্ভিস: ${entries.length}টি`;
  document.getElementById('inv-grand-total').textContent = total.toLocaleString();

  const tbody = document.getElementById('inv-tbody');
  if (entries.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#999;padding:20px">কোনো সার্ভিস নেই</td></tr>';
  } else {
    tbody.innerHTML = entries.map((e, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${e.name}</td>
        <td>${fmtDate(e.date)}</td>
        <td class="text-right">৳${e.price.toLocaleString()}</td>
      </tr>`).join('');
  }

  document.getElementById('invoice-modal').classList.add('show');
}

function closeInvoice(e) {
  if (!e || e.target.id === 'invoice-modal')
    document.getElementById('invoice-modal').classList.remove('show');
}

function printInvoice() { window.print(); }

/* =====================
   TOAST
   ===================== */
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className   = 'toast ' + type;
  t.style.display = 'block';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.style.display = 'none'; }, 2500);
}

/* =====================
   KEYBOARD SHORTCUTS
   ===================== */
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    if (document.getElementById('login-form').style.display !== 'none') doLogin();
    else if (document.getElementById('reg-form').style.display !== 'none') doRegister();
  }
});
