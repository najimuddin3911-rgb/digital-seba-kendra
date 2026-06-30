import { useState, useEffect } from "react";

// ===== DEFAULT DATA =====
const DEFAULT_SERVICES = [
  { id: 1, name: "নতুন জন্ম নিবন্ধন আবেদন", price: 150 },
  { id: 2, name: "জন্ম নিবন্ধন সংশোধন আবেদন", price: 150 },
  { id: 3, name: "জন্মনিবন্ধন বাংলা থেকে ইংরেজি/ডিজিটাল", price: 150 },
  { id: 4, name: "মৃত্যু সনদ আবেদন", price: 150 },
  { id: 5, name: "মৃত্যু সনদ সংশোধন আবেদন", price: 150 },
  { id: 6, name: "নতুন ভোটার আইডি কার্ড আবেদন", price: 150 },
  { id: 7, name: "ভোটার আইডি কার্ড সংশোধন আবেদন", price: 200 },
  { id: 8, name: "অনলাইন জিডি আবেদন", price: 250 },
  { id: 9, name: "টিন সার্টিফিকেট তৈরি", price: 150 },
  { id: 10, name: "জিরো রিটার্ন", price: 200 },
  { id: 11, name: "ই-চালান ভ্যাট ও আয়কর", price: 20 },
  { id: 12, name: "প্রত্যয়নপত্র", price: 30 },
  { id: 13, name: "দরখাস্ত", price: 60 },
  { id: 14, name: "পাসপোর্ট ও স্ট্যাম্প সাইজ ফটো (৪ পিস)", price: 40 },
];

const ADMIN_CONTACT = "01888106184"; // Admin WhatsApp
const ADMIN_EMAIL = "najimuddin3911@gmail.com";

const DEFAULT_EXPENSE_CATS = [
  { id: 101, name: "দোকান ভাড়া", price: 0 },
  { id: 102, name: "বিদ্যুৎ বিল", price: 0 },
  { id: 103, name: "ইন্টারনেট বিল", price: 0 },
  { id: 104, name: "কাগজ ও কালি", price: 0 },
  { id: 105, name: "যাতায়াত খরচ", price: 0 },
  { id: 106, name: "চা/নাস্তা খরচ", price: 0 },
  { id: 107, name: "অন্যান্য খরচ", price: 0 },
];

// ===== HELPERS =====
function getTodayKey() { return new Date().toISOString().split("T")[0]; }
function bn(n) { return Number(n).toLocaleString("bn-BD"); }
function getWeekKey(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDay();
  const sunday = new Date(d);
  sunday.setDate(d.getDate() - day);
  return sunday.toISOString().split("T")[0];
}
function getWeekEnd(weekStart) {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 6);
  return d.toISOString().split("T")[0];
}
function getMonthKey(dateStr) { return dateStr.slice(0, 7); }
function getYearKey(dateStr) { return dateStr.slice(0, 4); }

const BN_MONTHS = ["জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"];

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${bn(d.getDate())} ${BN_MONTHS[d.getMonth()]} ${bn(d.getFullYear())}`;
}
function formatMonthKey(mk) {
  const [y, m] = mk.split("-");
  return `${BN_MONTHS[parseInt(m) - 1]} ${bn(y)}`;
}
function formatWeekRange(wk) {
  return `${formatDate(wk)} — ${formatDate(getWeekEnd(wk))}`;
}

// ===== STORAGE KEYS =====
const STORAGE_KEY  = "shop_transactions";
const USER_KEY     = "shop_user";
const USERS_KEY    = "shop_users";
const SERVICES_KEY = "shop_services";
const ADMINS_KEY   = "shop_admins";
const EXPENSE_KEY  = "shop_expenses";
const EXPCATS_KEY  = "shop_expense_cats";
const SEEN_USERS_KEY = "shop_seen_users_count";

// ===== STYLES =====
const S = {
  page: { minHeight: "100vh", background: "#f5f0e8", fontFamily: "'Hind Siliguri', sans-serif" },
  header: { background: "#1a1a1a", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, position: "sticky", top: 0, zIndex: 100 },
  nav: { background: "#fff", borderBottom: "2px solid #e8e2d6", display: "flex", padding: "0 16px", overflowX: "auto" },
  content: { maxWidth: 960, margin: "0 auto", padding: "24px 16px" },
  card: { background: "#fff", border: "2px solid #1a1a1a", borderRadius: 14, padding: "20px 22px", boxShadow: "4px 4px 0 #1a1a1a" },
  btn: (active, color) => ({
    padding: "10px 20px", border: `2px solid ${color || "#1a1a1a"}`, borderRadius: 8,
    background: active ? (color || "#1a1a1a") : "#fff",
    color: active ? "#f5f0e8" : (color || "#1a1a1a"),
    fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "inherit"
  }),
  input: { width: "100%", padding: "10px 12px", border: "1.5px solid #ddd", borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "11px 14px", color: "#f5f0e8", textAlign: "left", fontSize: 13, fontWeight: 600, background: "#1a1a1a" },
  td: (i) => ({ padding: "10px 14px", fontSize: 13, background: i % 2 === 0 ? "#fff" : "#faf8f4" }),
  sectionTitle: { margin: "0 0 16px", fontSize: 18, fontWeight: 700 },
};

export default function App() {
  // ===== STATE =====
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
  });
  const [services, setServices] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SERVICES_KEY)) || DEFAULT_SERVICES; } catch { return DEFAULT_SERVICES; }
  });
  const [transactions, setTransactions] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
  });
  const [expenses, setExpenses] = useState(() => {
    try { return JSON.parse(localStorage.getItem(EXPENSE_KEY)) || []; } catch { return []; }
  });
  const [expenseCats, setExpenseCats] = useState(() => {
    try { return JSON.parse(localStorage.getItem(EXPCATS_KEY)) || DEFAULT_EXPENSE_CATS; } catch { return DEFAULT_EXPENSE_CATS; }
  });

  const [tab, setTab] = useState("dashboard");
  const [loginForm, setLoginForm] = useState({ contact: "", pass: "" });
  const [loginMode, setLoginMode] = useState("login"); // login | register | reset
  const [loginError, setLoginError] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [editService, setEditService] = useState(null);
  const [editQty, setEditQty] = useState(1);
  const [editPrice, setEditPrice] = useState("");
  const [editName, setEditName] = useState("");
  const [toast, setToast] = useState("");

  // Report states
  const [reportPeriod, setReportPeriod] = useState("day");
  const [reportDate, setReportDate] = useState(getTodayKey());
  const [reportType, setReportType] = useState("income"); // income | expense

  // History drill-down
  const [historyView, setHistoryView] = useState("years"); // years | months | weeks | days
  const [historyYear, setHistoryYear] = useState(null);
  const [historyMonth, setHistoryMonth] = useState(null);
  const [historyWeek, setHistoryWeek] = useState(null);
  const [historyType, setHistoryType] = useState("income"); // income | expense

  const [analyticsType, setAnalyticsType] = useState("income"); // income | expense

  // Service management
  const [newSvcName, setNewSvcName] = useState("");
  const [newSvcPrice, setNewSvcPrice] = useState("");

  // Expense category management
  const [newExpName, setNewExpName] = useState("");
  const [newExpPrice, setNewExpPrice] = useState("");

  // Admin
  const [adminNewContact, setAdminNewContact] = useState("");
  const [, forceTick] = useState(0); // small helper to force re-render after localStorage-only updates

  // ===== EFFECTS =====
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem(SERVICES_KEY, JSON.stringify(services)); }, [services]);
  useEffect(() => { localStorage.setItem(EXPENSE_KEY, JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem(EXPCATS_KEY, JSON.stringify(expenseCats)); }, [expenseCats]);

  // ===== HELPERS =====
  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 2800); }

  function getUsers() { try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch { return []; } }
  function getAdmins() { try { return JSON.parse(localStorage.getItem(ADMINS_KEY)) || [ADMIN_CONTACT, ADMIN_EMAIL]; } catch { return [ADMIN_CONTACT, ADMIN_EMAIL]; } }
  function isAdmin(u) { if (!u) return false; return getAdmins().includes(u.contact); }
  function getSeenUserCount() { try { return parseInt(localStorage.getItem(SEEN_USERS_KEY)) || 0; } catch { return 0; } }
  function markUsersSeen(n) { localStorage.setItem(SEEN_USERS_KEY, String(n)); forceTick(t => t + 1); }

  function getFiltered(list, period, key) {
    return list.filter(tx => {
      if (period === "day") return tx.date === key;
      if (period === "week") return getWeekKey(tx.date) === key;
      if (period === "month") return getMonthKey(tx.date) === key;
      if (period === "year") return getYearKey(tx.date) === key;
      return true;
    });
  }

  function groupByItem(txs, field = "serviceName") {
    const map = {};
    txs.forEach(tx => {
      const k = tx[field];
      if (!map[k]) map[k] = { name: k, qty: 0, total: 0, price: tx.price };
      map[k].qty += tx.qty;
      map[k].total += tx.total;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }
  function groupByService(txs) { return groupByItem(txs, "serviceName"); }

  function sumTotal(txs) { return txs.reduce((s, t) => s + t.total, 0); }

  // Generic year/month/week/day listers — pass any list (income or expense)
  function uniqYears(list) { return [...new Set(list.map(t => getYearKey(t.date)))].sort().reverse(); }
  function uniqMonths(list, year) { return [...new Set(list.filter(t => getYearKey(t.date) === year).map(t => getMonthKey(t.date)))].sort().reverse(); }
  function uniqWeeks(list, month) { return [...new Set(list.filter(t => getMonthKey(t.date) === month).map(t => getWeekKey(t.date)))].sort().reverse(); }
  function uniqDays(list, week) { return [...new Set(list.filter(t => getWeekKey(t.date) === week).map(t => t.date))].sort().reverse(); }

  // All unique years/months/weeks/days from income transactions (kept for backward-compat)
  const allYears = uniqYears(transactions);
  const allMonths = (year) => uniqMonths(transactions, year);
  const allWeeks = (month) => uniqWeeks(transactions, month);
  const allDays = (week) => uniqDays(transactions, week);

  // ===== AUTH =====
  function handleAuth(e) {
    e.preventDefault();
    const users = getUsers();

    if (loginMode === "reset") {
      const found = users.find(u => u.contact === loginForm.contact);
      if (!found) { setLoginError("এই ইমেইল/নম্বর দিয়ে কোনো অ্যাকাউন্ট নেই।"); return; }
      if (!loginForm.pass || loginForm.pass.length < 4) { setLoginError("নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।"); return; }
      if (loginForm.pass !== confirmPass) { setLoginError("পাসওয়ার্ড দুটি মিলছে না।"); return; }
      const updated = users.map(u => u.contact === loginForm.contact ? { ...u, pass: loginForm.pass } : u);
      localStorage.setItem(USERS_KEY, JSON.stringify(updated));
      showToast("✅ পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে! এখন লগইন করুন।");
      setLoginMode("login");
      setLoginForm({ contact: loginForm.contact, pass: "" });
      setConfirmPass("");
      setLoginError("");
      return;
    }

    if (loginMode === "register") {
      if (loginForm.pass !== confirmPass) { setLoginError("পাসওয়ার্ড দুটি মিলছে না।"); return; }
      if (loginForm.pass.length < 4) { setLoginError("পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।"); return; }
      if (users.find(u => u.contact === loginForm.contact)) { setLoginError("এই ইমেইল/নম্বর দিয়ে আগেই অ্যাকাউন্ট আছে।"); return; }
      const newUser = { contact: loginForm.contact, pass: loginForm.pass, joinedAt: new Date().toISOString() };
      localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      setUser(newUser);
      setLoginError("");
      return;
    }

    // login
    const found = users.find(u => u.contact === loginForm.contact && u.pass === loginForm.pass);
    if (!found) { setLoginError("ইমেইল/নম্বর বা পাসওয়ার্ড ভুল।"); return; }
    localStorage.setItem(USER_KEY, JSON.stringify(found));
    setUser(found);
    setLoginError("");
  }

  function handleLogout() { localStorage.removeItem(USER_KEY); setUser(null); }

  // ===== SERVICE / EXPENSE ENTRY =====
  function addService(svc, kind = "income") { setEditService({ ...svc, kind }); setEditQty(1); setEditPrice(String(svc.price || "")); setEditName(svc.name); }

  function confirmAdd() {
    const qty = parseInt(editQty) || 1;
    const price = parseFloat(editPrice) || 0;
    if (editService.kind === "expense") {
      const tx = { id: Date.now(), date: getTodayKey(), name: editName, qty, price, total: qty * price };
      setExpenses(prev => [...prev, tx]);
      setEditService(null);
      showToast(`✅ খরচ "${editName}" যোগ হয়েছে`);
      return;
    }
    const tx = { id: Date.now(), date: getTodayKey(), serviceId: editService.id, serviceName: editName, qty, price, total: qty * price };
    setTransactions(prev => [...prev, tx]);
    setEditService(null);
    showToast(`✅ "${editName}" যোগ হয়েছে`);
  }

  // ===== PRINT =====
  function printReport(txs, title, subtitle, field = "serviceName", labelWord = "আয়") {
    const grouped = groupByItem(txs, field);
    const total = sumTotal(txs);
    const w = window.open("", "_blank");
    w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  body{font-family:'Hind Siliguri',sans-serif;margin:0;padding:28px;color:#1a1a1a;background:#fff}
  .header{text-align:center;border-bottom:3px solid #1a1a1a;padding-bottom:16px;margin-bottom:20px}
  .header h1{font-size:24px;margin:0 0 4px}.header p{margin:2px 0;font-size:13px;color:#555}
  .badge{display:inline-block;background:#1a1a1a;color:#fff;padding:4px 16px;border-radius:20px;font-size:13px;margin-top:8px}
  table{width:100%;border-collapse:collapse;margin-top:12px}
  th{background:#1a1a1a;color:#f5f0e8;padding:10px 14px;text-align:left;font-size:13px}
  td{padding:9px 14px;border-bottom:1px solid #e8e2d6;font-size:13px}
  tr:nth-child(even) td{background:#faf8f4}
  .total-row td{font-weight:700;background:#f5f0e8;border-top:2px solid #1a1a1a;font-size:15px}
  .footer{margin-top:30px;text-align:center;font-size:11px;color:#999;border-top:1px solid #ddd;padding-top:12px}
  @media print{body{padding:10px}}
</style></head><body>
<div class="header">
  <h1>🏪 ডিজিটাল সেবা কেন্দ্র</h1>
  <p>সকল সরকারি ও ডিজিটাল সেবা এক জায়গায়</p>
  <span class="badge">${title} — ${subtitle}</span>
</div>
<table>
<thead><tr><th>#</th><th>${field === "name" ? "খরচের খাত" : "সেবার নাম"}</th><th>সংখ্যা</th><th>একক মূল্য</th><th>মোট</th></tr></thead>
<tbody>
${grouped.map((r, i) => `<tr><td>${i + 1}</td><td>${r.name}</td><td>${r.qty}</td><td>৳${r.price}</td><td>৳${r.total}</td></tr>`).join("")}
<tr class="total-row"><td colspan="4">মোট ${labelWord}</td><td>৳${total}</td></tr>
</tbody></table>
<div class="footer">মুদ্রণ তারিখ: ${new Date().toLocaleString("bn-BD")} | ধন্যবাদ সেবা গ্রহণ করার জন্য</div>
<script>window.onload=()=>window.print();<\/script>
</body></html>`);
    w.document.close();
  }

  // ===== COMPUTED =====
  const todayTxs = getFiltered(transactions, "day", getTodayKey());
  const todayTotal = sumTotal(todayTxs);
  const monthTotal = sumTotal(getFiltered(transactions, "month", getMonthKey(getTodayKey())));
  const yearTotal = sumTotal(getFiltered(transactions, "year", getYearKey(getTodayKey())));

  const todayExpTxs = getFiltered(expenses, "day", getTodayKey());
  const todayExpTotal = sumTotal(todayExpTxs);
  const monthExpTotal = sumTotal(getFiltered(expenses, "month", getMonthKey(getTodayKey())));
  const yearExpTotal = sumTotal(getFiltered(expenses, "year", getYearKey(getTodayKey())));

  const reportKey = (() => {
    if (reportPeriod === "day") return reportDate;
    if (reportPeriod === "week") return getWeekKey(reportDate);
    if (reportPeriod === "month") return getMonthKey(reportDate);
    return getYearKey(reportDate);
  })();
  const reportList = reportType === "income" ? transactions : expenses;
  const reportField = reportType === "income" ? "serviceName" : "name";
  const reportTxs = getFiltered(reportList, reportPeriod, reportKey);
  const reportGrouped = groupByItem(reportTxs, reportField);
  const reportTotal = sumTotal(reportTxs);

  const newUsersCount = Math.max(0, getUsers().length - getSeenUserCount());

  const navItems = [
    { key: "dashboard", label: "ড্যাশবোর্ড", icon: "📊" },
    { key: "services", label: "সেবা যোগ (আয়)", icon: "➕" },
    { key: "expenses", label: "খরচ যোগ", icon: "➖" },
    { key: "report", label: "রিপোর্ট", icon: "📋" },
    { key: "history", label: "সম্পূর্ণ ইতিহাস", icon: "📅" },
    { key: "analytics", label: "বিশ্লেষণ", icon: "📈" },
    { key: "manage", label: "সম্পাদনা", icon: "⚙️" },
    ...(isAdmin(user) ? [{ key: "admin", label: `অ্যাডমিন${newUsersCount > 0 ? ` (🔔${bn(newUsersCount)})` : ""}`, icon: "🛡️" }] : []),
  ];

  // ===== LOGIN PAGE =====
  if (!user) return (
    <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&display=swap');*{box-sizing:border-box}`}</style>
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 8px 40px rgba(0,0,0,0.12)", padding: "36px 32px", width: "100%", maxWidth: 380, border: "2px solid #1a1a1a" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🏪</div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>ডিজিটাল সেবা কেন্দ্র</h2>
          <p style={{ color: "#888", fontSize: 13, margin: "4px 0 0" }}>আপনার সেবা ট্র্যাকার</p>
        </div>

        {loginMode !== "reset" && (
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {[["login","লগইন"],["register","নিবন্ধন"]].map(([m, l]) => (
              <button key={m} onClick={() => { setLoginMode(m); setLoginError(""); setConfirmPass(""); }}
                style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "2px solid #1a1a1a", background: loginMode === m ? "#1a1a1a" : "#fff", color: loginMode === m ? "#f5f0e8" : "#1a1a1a", fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>
                {l}
              </button>
            ))}
          </div>
        )}

        {loginMode === "reset" && (
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 16, fontWeight: 700 }}>🔑 পাসওয়ার্ড রিসেট</span>
          </div>
        )}

        <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input type="text" placeholder="জিমেইল বা মোবাইল নম্বর" value={loginForm.contact}
            onChange={e => setLoginForm(f => ({ ...f, contact: e.target.value }))} required style={S.input} />

          <div style={{ position: "relative" }}>
            <input type={showPass ? "text" : "password"} placeholder={loginMode === "reset" ? "নতুন পাসওয়ার্ড" : "পাসওয়ার্ড"}
              value={loginForm.pass} onChange={e => setLoginForm(f => ({ ...f, pass: e.target.value }))} required style={{ ...S.input, paddingRight: 44 }} />
            <button type="button" onClick={() => setShowPass(v => !v)}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#888", padding: 0 }}>
              {showPass ? "🙈" : "👁️"}
            </button>
          </div>

          {(loginMode === "register" || loginMode === "reset") && (
            <div style={{ position: "relative" }}>
              <input type={showConfirmPass ? "text" : "password"} placeholder="পাসওয়ার্ড নিশ্চিত করুন"
                value={confirmPass} onChange={e => setConfirmPass(e.target.value)} required
                style={{ ...S.input, paddingRight: 44, borderColor: confirmPass && loginForm.pass !== confirmPass ? "#e74c3c" : "#ddd" }} />
              <button type="button" onClick={() => setShowConfirmPass(v => !v)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#888", padding: 0 }}>
                {showConfirmPass ? "🙈" : "👁️"}
              </button>
              {confirmPass && <p style={{ color: loginForm.pass === confirmPass ? "#27ae60" : "#e74c3c", fontSize: 12, margin: "4px 0 0" }}>
                {loginForm.pass === confirmPass ? "পাসওয়ার্ড মিলেছে ✅" : "পাসওয়ার্ড মিলছে না ❌"}
              </p>}
            </div>
          )}

          {loginError && <p style={{ color: "#c0392b", fontSize: 13, textAlign: "center", margin: 0 }}>{loginError}</p>}

          <button type="submit" style={{ ...S.btn(true), width: "100%", padding: "12px 0", fontSize: 15 }}>
            {loginMode === "login" ? "লগইন করুন" : loginMode === "register" ? "অ্যাকাউন্ট তৈরি করুন" : "পাসওয়ার্ড পরিবর্তন করুন"}
          </button>
        </form>

        {loginMode === "login" && (
          <p style={{ textAlign: "center", fontSize: 13, margin: "12px 0 0" }}>
            <span style={{ color: "#888" }}>পাসওয়ার্ড ভুলে গেছেন? </span>
            <button onClick={() => { setLoginMode("reset"); setLoginError(""); setLoginForm({ contact: "", pass: "" }); setConfirmPass(""); }}
              style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontSize: 13, fontFamily: "inherit", fontWeight: 600 }}>
              রিসেট করুন
            </button>
          </p>
        )}

        {loginMode !== "login" && (
          <p style={{ textAlign: "center", fontSize: 13, margin: "12px 0 0" }}>
            <button onClick={() => { setLoginMode("login"); setLoginError(""); }}
              style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>
              ← লগইনে ফিরুন
            </button>
          </p>
        )}

        {/* Contact support — শুধু reset মোডে দেখাবে */}
        {loginMode === "reset" && (
          <div style={{ marginTop: 16, padding: "14px 16px", background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 10, fontSize: 13, color: "#555", textAlign: "center" }}>
            <p style={{ margin: "0 0 8px", fontWeight: 700, color: "#1a1a1a" }}>সমস্যা হলে যোগাযোগ করুন:</p>
            <a href={`https://wa.me/880${ADMIN_CONTACT}`} target="_blank" rel="noreferrer"
              style={{ display: "inline-block", marginBottom: 6, color: "#16a34a", fontWeight: 700, textDecoration: "none", fontSize: 14 }}>
              📱 WhatsApp: {ADMIN_CONTACT}
            </a>
            <br />
            <a href={`mailto:${ADMIN_EMAIL}`} style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none", fontSize: 13 }}>
              ✉️ {ADMIN_EMAIL}
            </a>
          </div>
        )}
      </div>
    </div>
  );

  // ===== MAIN APP =====
  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&display=swap');
        .svc-btn:hover{background:#1a1a1a!important;color:#f5f0e8!important;transform:translateY(-2px)}
        .nav-tab:hover{background:#f5f0e8!important}
        .hist-row:hover{background:#f0ebe0!important;cursor:pointer}
        *{box-sizing:border-box}
      `}</style>

      {/* Header */}
      <div style={S.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>🏪</span>
          <span style={{ color: "#f5f0e8", fontWeight: 700, fontSize: 17 }}>ডিজিটাল সেবা কেন্দ্র</span>
          {isAdmin(user) && <span style={{ background: "#f5a623", color: "#1a1a1a", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>ADMIN</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "#aaa", fontSize: 12 }}>👤 {user.contact}</span>
          <button onClick={handleLogout} style={{ background: "transparent", border: "1px solid #555", color: "#ccc", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>লগআউট</button>
        </div>
      </div>

      {/* Nav */}
      <div style={S.nav}>
        {navItems.map(n => (
          <button key={n.key} className="nav-tab" onClick={() => setTab(n.key)}
            style={{ padding: "12px 14px", border: "none", background: tab === n.key ? "#f5f0e8" : "transparent", color: tab === n.key ? "#1a1a1a" : "#666", fontWeight: tab === n.key ? 700 : 500, cursor: "pointer", fontSize: 13, fontFamily: "inherit", borderBottom: tab === n.key ? "3px solid #1a1a1a" : "3px solid transparent", whiteSpace: "nowrap", transition: "all .2s" }}>
            {n.icon} {n.label}
          </button>
        ))}
      </div>

      <div style={S.content}>

        {/* ===== DASHBOARD ===== */}
        {tab === "dashboard" && (
          <div>
            <h2 style={S.sectionTitle}>📊 আজকের সারসংক্ষেপ</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 18 }}>
              {[
                { label: "আজকের আয়", value: `৳${bn(todayTotal)}`, sub: `${bn(todayTxs.length)} টি এন্ট্রি`, dark: true },
                { label: "এই মাসের আয়", value: `৳${bn(monthTotal)}`, sub: formatMonthKey(getMonthKey(getTodayKey())), dark: false },
                { label: "এই বছরের আয়", value: `৳${bn(yearTotal)}`, sub: getYearKey(getTodayKey()) + " সাল", dark: false },
                { label: "মোট এন্ট্রি (সব)", value: bn(transactions.length), sub: "শুরু থেকে এখন পর্যন্ত", dark: false },
              ].map((s, i) => (
                <div key={i} style={{ background: s.dark ? "#1a1a1a" : "#fff", border: "2px solid #1a1a1a", borderRadius: 14, padding: "18px 20px", boxShadow: "4px 4px 0 #1a1a1a" }}>
                  <p style={{ margin: "0 0 6px", fontSize: 12, color: s.dark ? "#aaa" : "#888" }}>{s.label}</p>
                  <p style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 700, color: s.dark ? "#f5f0e8" : "#1a1a1a" }}>{s.value}</p>
                  <p style={{ margin: 0, fontSize: 11, color: s.dark ? "#666" : "#bbb" }}>{s.sub}</p>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 28 }}>
              {[
                { label: "আজকের খরচ", value: `৳${bn(todayExpTotal)}`, sub: `${bn(todayExpTxs.length)} টি এন্ট্রি`, color: "#e74c3c" },
                { label: "এই মাসের খরচ", value: `৳${bn(monthExpTotal)}`, sub: formatMonthKey(getMonthKey(getTodayKey())), color: "#e74c3c" },
                { label: "এই বছরের খরচ", value: `৳${bn(yearExpTotal)}`, sub: getYearKey(getTodayKey()) + " সাল", color: "#e74c3c" },
                { label: "আজকের নিট লাভ", value: `৳${bn(todayTotal - todayExpTotal)}`, sub: "আয় − খরচ", color: "#16a34a" },
              ].map((s, i) => (
                <div key={i} style={{ background: "#fff", border: `2px solid ${s.color}`, borderRadius: 14, padding: "18px 20px", boxShadow: `4px 4px 0 ${s.color}` }}>
                  <p style={{ margin: "0 0 6px", fontSize: 12, color: "#888" }}>{s.label}</p>
                  <p style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#bbb" }}>{s.sub}</p>
                </div>
              ))}
            </div>

            <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>আজকের আয়ের এন্ট্রি ({formatDate(getTodayKey())})</h3>
            {todayTxs.length === 0
              ? <div style={{ background: "#fff", border: "2px dashed #ddd", borderRadius: 12, padding: "36px", textAlign: "center", color: "#aaa" }}>আজ কোনো সেবা যোগ করা হয়নি</div>
              : <div style={{ background: "#fff", border: "2px solid #1a1a1a", borderRadius: 12, overflow: "hidden" }}>
                  <table style={S.table}>
                    <thead><tr>{["সময়","সেবার নাম","সংখ্যা","মূল্য","মোট"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                    <tbody>{todayTxs.map((tx, i) => (
                      <tr key={tx.id}>
                        <td style={S.td(i)}>{new Date(tx.id).toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" })}</td>
                        <td style={S.td(i)}>{tx.serviceName}</td>
                        <td style={S.td(i)}>{bn(tx.qty)}</td>
                        <td style={S.td(i)}>৳{bn(tx.price)}</td>
                        <td style={{ ...S.td(i), fontWeight: 600 }}>৳{bn(tx.total)}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
            }
            {todayTxs.length > 0 && (
              <button onClick={() => printReport(todayTxs, "দৈনিক ইনভয়েস", formatDate(getTodayKey()), "serviceName", "আয়")} style={{ ...S.btn(true), marginTop: 14, marginBottom: 28 }}>
                🖨️ আজকের ইনভয়েস প্রিন্ট করুন
              </button>
            )}

            <h3 style={{ margin: "28px 0 12px", fontSize: 15, fontWeight: 700 }}>আজকের খরচের এন্ট্রি ({formatDate(getTodayKey())})</h3>
            {todayExpTxs.length === 0
              ? <div style={{ background: "#fff", border: "2px dashed #ddd", borderRadius: 12, padding: "36px", textAlign: "center", color: "#aaa" }}>আজ কোনো খরচ যোগ করা হয়নি</div>
              : <div style={{ background: "#fff", border: "2px solid #e74c3c", borderRadius: 12, overflow: "hidden" }}>
                  <table style={S.table}>
                    <thead><tr>{["সময়","খরচের খাত","সংখ্যা","মূল্য","মোট"].map(h => <th key={h} style={{ ...S.th, background: "#e74c3c" }}>{h}</th>)}</tr></thead>
                    <tbody>{todayExpTxs.map((tx, i) => (
                      <tr key={tx.id}>
                        <td style={S.td(i)}>{new Date(tx.id).toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" })}</td>
                        <td style={S.td(i)}>{tx.name}</td>
                        <td style={S.td(i)}>{bn(tx.qty)}</td>
                        <td style={S.td(i)}>৳{bn(tx.price)}</td>
                        <td style={{ ...S.td(i), fontWeight: 600 }}>৳{bn(tx.total)}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
            }
            {todayExpTxs.length > 0 && (
              <button onClick={() => printReport(todayExpTxs, "দৈনিক খরচের রিপোর্ট", formatDate(getTodayKey()), "name", "খরচ")} style={{ ...S.btn(true, "#e74c3c"), marginTop: 14 }}>
                🖨️ আজকের খরচের রিপোর্ট প্রিন্ট করুন
              </button>
            )}
          </div>
        )}

        {/* ===== SERVICES ===== */}
        {tab === "services" && (
          <div>
            <h2 style={{ ...S.sectionTitle }}>➕ সেবা যোগ করুন (আয়)</h2>
            <p style={{ color: "#888", fontSize: 13, margin: "0 0 20px" }}>যেকোনো সেবার বাটনে ক্লিক করুন, দাম/পরিমাণ ঠিক করে যোগ করুন।</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 12 }}>
              {services.map(svc => (
                <button key={svc.id} className="svc-btn" onClick={() => addService(svc, "income")}
                  style={{ background: "#fff", border: "2px solid #1a1a1a", borderRadius: 12, padding: "16px 14px", cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "all .2s", boxShadow: "3px 3px 0 #1a1a1a" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, lineHeight: 1.4 }}>{svc.name}</div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>৳{bn(svc.price)}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ===== EXPENSES ===== */}
        {tab === "expenses" && (
          <div>
            <h2 style={{ ...S.sectionTitle }}>➖ খরচ যোগ করুন</h2>
            <p style={{ color: "#888", fontSize: 13, margin: "0 0 20px" }}>যেকোনো খরচের খাতে ক্লিক করুন, পরিমাণ লিখে যোগ করুন।</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 12 }}>
              {expenseCats.map(cat => (
                <button key={cat.id} className="svc-btn" onClick={() => addService(cat, "expense")}
                  style={{ background: "#fff", border: "2px solid #e74c3c", borderRadius: 12, padding: "16px 14px", cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "all .2s", boxShadow: "3px 3px 0 #e74c3c" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, lineHeight: 1.4 }}>{cat.name}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#e74c3c" }}>৳{bn(cat.price || 0)}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ===== REPORT ===== */}
        {tab === "report" && (
          <div>
            <h2 style={S.sectionTitle}>📋 রিপোর্ট ও হিসাব</h2>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {[["income","💰 আয়ের রিপোর্ট"],["expense","💸 খরচের রিপোর্ট"]].map(([k,l]) => (
                <button key={k} onClick={() => setReportType(k)} style={{ ...S.btn(reportType === k, k === "expense" ? "#e74c3c" : "#1a1a1a"), borderRadius: 20, padding: "8px 18px" }}>{l}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
              {[["day","দৈনিক"],["week","সাপ্তাহিক"],["month","মাসিক"],["year","বার্ষিক"]].map(([k,l]) => (
                <button key={k} onClick={() => setReportPeriod(k)} style={{ ...S.btn(reportPeriod === k), borderRadius: 20, padding: "7px 16px" }}>{l}</button>
              ))}
            </div>
            <div style={{ marginBottom: 20 }}>
              <input type="date" value={reportDate} onChange={e => setReportDate(e.target.value)}
                style={{ padding: "9px 14px", border: "2px solid #1a1a1a", borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none" }} />
            </div>

            {/* Period label */}
            <div style={{ background: reportType === "expense" ? "#e74c3c" : "#1a1a1a", color: "#f5f0e8", borderRadius: 10, padding: "10px 16px", marginBottom: 16, fontSize: 14, fontWeight: 600 }}>
              {reportPeriod === "day" && `📅 ${formatDate(reportKey)}`}
              {reportPeriod === "week" && `📅 সপ্তাহ: ${formatWeekRange(reportKey)}`}
              {reportPeriod === "month" && `📅 ${formatMonthKey(reportKey)}`}
              {reportPeriod === "year" && `📅 ${reportKey} সাল`}
              <span style={{ float: "right", color: "#f5a623", fontSize: 15 }}>৳{bn(reportTotal)}</span>
            </div>

            {reportGrouped.length === 0
              ? <div style={{ background: "#fff", border: "2px dashed #ddd", borderRadius: 12, padding: "40px", textAlign: "center", color: "#aaa" }}>এই সময়ের জন্য কোনো ডেটা নেই</div>
              : <>
                  <div style={{ background: "#fff", border: "2px solid #1a1a1a", borderRadius: 12, overflow: "hidden", marginBottom: 14 }}>
                    <table style={S.table}>
                      <thead><tr>{["ক্রমিক", reportType === "expense" ? "খরচের খাত" : "সেবার নাম", reportType === "expense" ? "কতবার" : "বিক্রির সংখ্যা", "একক মূল্য", reportType === "expense" ? "মোট খরচ" : "মোট আয়"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                      <tbody>
                        {reportGrouped.map((r, i) => (
                          <tr key={i}>
                            <td style={S.td(i)}>{bn(i+1)}</td>
                            <td style={S.td(i)}>{r.name}</td>
                            <td style={{ ...S.td(i), fontWeight: 600, color: "#2563eb" }}>{bn(r.qty)} বার</td>
                            <td style={S.td(i)}>৳{bn(r.price)}</td>
                            <td style={{ ...S.td(i), fontWeight: 700 }}>৳{bn(r.total)}</td>
                          </tr>
                        ))}
                        <tr style={{ borderTop: "2px solid #1a1a1a" }}>
                          <td colSpan={4} style={{ padding: "12px 14px", fontWeight: 700, fontSize: 14, background: "#f5f0e8" }}>মোট {reportType === "expense" ? "খরচ" : "আয়"}</td>
                          <td style={{ padding: "12px 14px", fontWeight: 700, fontSize: 16, background: "#f5f0e8" }}>৳{bn(reportTotal)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <button onClick={() => printReport(reportTxs, `${reportPeriod === "day" ? "দৈনিক" : reportPeriod === "week" ? "সাপ্তাহিক" : reportPeriod === "month" ? "মাসিক" : "বার্ষিক"} ${reportType === "expense" ? "খরচের রিপোর্ট" : "ইনভয়েস"}`, reportPeriod === "day" ? formatDate(reportKey) : reportPeriod === "week" ? formatWeekRange(reportKey) : reportPeriod === "month" ? formatMonthKey(reportKey) : reportKey + " সাল", reportField, reportType === "expense" ? "খরচ" : "আয়")}
                    style={S.btn(true, reportType === "expense" ? "#e74c3c" : "#1a1a1a")}>
                    🖨️ {reportType === "expense" ? "খরচের রিপোর্ট" : "ইনভয়েস"} প্রিন্ট / PDF করুন
                  </button>
                </>
            }
          </div>
        )}

        {/* ===== HISTORY (FULL DRILL-DOWN) ===== */}
        {tab === "history" && (() => {
          const histList = historyType === "income" ? transactions : expenses;
          const histField = historyType === "income" ? "serviceName" : "name";
          const histLabel = historyType === "income" ? "আয়" : "খরচ";
          const histColor = historyType === "income" ? "#1a1a1a" : "#e74c3c";
          const hYears = uniqYears(histList);
          const switchType = (k) => { setHistoryType(k); setHistoryView("years"); setHistoryYear(null); setHistoryMonth(null); setHistoryWeek(null); };
          return (
          <div>
            <h2 style={S.sectionTitle}>📅 সম্পূর্ণ ইতিহাস</h2>

            {/* Type toggle */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {[["income","💰 আয়ের ইতিহাস"],["expense","💸 খরচের ইতিহাস"]].map(([k,l]) => (
                <button key={k} onClick={() => switchType(k)} style={{ ...S.btn(historyType === k, k === "expense" ? "#e74c3c" : "#1a1a1a"), borderRadius: 20, padding: "8px 18px" }}>{l}</button>
              ))}
            </div>

            {/* Breadcrumb */}
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
              <button onClick={() => { setHistoryView("years"); setHistoryYear(null); setHistoryMonth(null); setHistoryWeek(null); }}
                style={{ ...S.btn(historyView === "years", histColor), padding: "6px 14px", borderRadius: 20, fontSize: 13 }}>
                সব বছর
              </button>
              {historyYear && <>
                <span style={{ color: "#aaa" }}>›</span>
                <button onClick={() => { setHistoryView("months"); setHistoryMonth(null); setHistoryWeek(null); }}
                  style={{ ...S.btn(historyView === "months", histColor), padding: "6px 14px", borderRadius: 20, fontSize: 13 }}>
                  {historyYear} সাল
                </button>
              </>}
              {historyMonth && <>
                <span style={{ color: "#aaa" }}>›</span>
                <button onClick={() => { setHistoryView("weeks"); setHistoryWeek(null); }}
                  style={{ ...S.btn(historyView === "weeks", histColor), padding: "6px 14px", borderRadius: 20, fontSize: 13 }}>
                  {formatMonthKey(historyMonth)}
                </button>
              </>}
              {historyWeek && <>
                <span style={{ color: "#aaa" }}>›</span>
                <button onClick={() => setHistoryView("days")}
                  style={{ ...S.btn(historyView === "days", histColor), padding: "6px 14px", borderRadius: 20, fontSize: 13 }}>
                  সপ্তাহ
                </button>
              </>}
            </div>

            {/* YEARS VIEW */}
            {historyView === "years" && (
              hYears.length === 0
                ? <div style={{ background: "#fff", border: "2px dashed #ddd", borderRadius: 12, padding: "40px", textAlign: "center", color: "#aaa" }}>কোনো ডেটা নেই</div>
                : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {hYears.map(year => {
                      const yTxs = getFiltered(histList, "year", year);
                      const yTotal = sumTotal(yTxs);
                      return (
                        <div key={year} className="hist-row" onClick={() => { setHistoryYear(year); setHistoryView("months"); }}
                          style={{ background: "#fff", border: `2px solid ${histColor}`, borderRadius: 12, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: `3px 3px 0 ${histColor}`, transition: "all .15s" }}>
                          <div>
                            <div style={{ fontSize: 18, fontWeight: 700 }}>📅 {year} সাল</div>
                            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{bn(yTxs.length)} টি এন্ট্রি • {uniqMonths(histList, year).length} মাসের ডেটা</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 22, fontWeight: 700, color: histColor }}>৳{bn(yTotal)}</div>
                            <div style={{ fontSize: 12, color: "#aaa" }}>মোট {histLabel} →</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
            )}

            {/* MONTHS VIEW */}
            {historyView === "months" && historyYear && (
              <div>
                <div style={{ background: "#f5f0e8", border: `2px solid ${histColor}`, borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontWeight: 700, fontSize: 15 }}>
                  📅 {historyYear} সালের মাসভিত্তিক {histLabel}
                  <span style={{ float: "right", color: "#555", fontSize: 13, fontWeight: 600 }}>মোট: ৳{bn(sumTotal(getFiltered(histList, "year", historyYear)))}</span>
                </div>
                {uniqMonths(histList, historyYear).length === 0
                  ? <p style={{ color: "#aaa" }}>কোনো ডেটা নেই</p>
                  : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {uniqMonths(histList, historyYear).map(mk => {
                        const mTxs = getFiltered(histList, "month", mk);
                        const mTotal = sumTotal(mTxs);
                        return (
                          <div key={mk} className="hist-row" onClick={() => { setHistoryMonth(mk); setHistoryView("weeks"); }}
                            style={{ background: "#fff", border: `2px solid ${histColor}`, borderRadius: 12, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: `3px 3px 0 ${histColor}`, transition: "all .15s" }}>
                            <div>
                              <div style={{ fontSize: 16, fontWeight: 700 }}>🗓️ {formatMonthKey(mk)}</div>
                              <div style={{ fontSize: 12, color: "#888", marginTop: 3 }}>{bn(mTxs.length)} টি এন্ট্রি</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontSize: 20, fontWeight: 700 }}>৳{bn(mTotal)}</div>
                              <div style={{ fontSize: 12, color: "#aaa" }}>বিস্তারিত →</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                }
              </div>
            )}

            {/* WEEKS VIEW */}
            {historyView === "weeks" && historyMonth && (
              <div>
                <div style={{ background: "#f5f0e8", border: `2px solid ${histColor}`, borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontWeight: 700, fontSize: 15 }}>
                  🗓️ {formatMonthKey(historyMonth)} — সাপ্তাহিক {histLabel}
                  <span style={{ float: "right", color: "#555", fontSize: 13, fontWeight: 600 }}>মোট: ৳{bn(sumTotal(getFiltered(histList, "month", historyMonth)))}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {uniqWeeks(histList, historyMonth).map(wk => {
                    const wTxs = getFiltered(histList, "week", wk);
                    const wTotal = sumTotal(wTxs);
                    return (
                      <div key={wk} className="hist-row" onClick={() => { setHistoryWeek(wk); setHistoryView("days"); }}
                        style={{ background: "#fff", border: `2px solid ${histColor}`, borderRadius: 12, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: `3px 3px 0 ${histColor}`, transition: "all .15s" }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700 }}>📆 {formatWeekRange(wk)}</div>
                          <div style={{ fontSize: 12, color: "#888", marginTop: 3 }}>{bn(wTxs.length)} টি এন্ট্রি</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 18, fontWeight: 700 }}>৳{bn(wTotal)}</div>
                          <div style={{ fontSize: 12, color: "#aaa" }}>দিন দেখুন →</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* DAYS VIEW */}
            {historyView === "days" && historyWeek && (
              <div>
                <div style={{ background: "#f5f0e8", border: `2px solid ${histColor}`, borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontWeight: 700, fontSize: 15 }}>
                  📆 সপ্তাহ: {formatWeekRange(historyWeek)} — দৈনিক {histLabel}
                  <span style={{ float: "right", color: "#555", fontSize: 13, fontWeight: 600 }}>মোট: ৳{bn(sumTotal(getFiltered(histList, "week", historyWeek)))}</span>
                </div>
                {uniqDays(histList, historyWeek).map(day => {
                  const dTxs = getFiltered(histList, "day", day);
                  const dGrouped = groupByItem(dTxs, histField);
                  const dTotal = sumTotal(dTxs);
                  return (
                    <div key={day} style={{ background: "#fff", border: `2px solid ${histColor}`, borderRadius: 12, marginBottom: 14, overflow: "hidden", boxShadow: `3px 3px 0 ${histColor}` }}>
                      <div style={{ background: histColor, color: "#f5f0e8", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 700 }}>📅 {formatDate(day)}</span>
                        <span style={{ color: "#f5a623", fontWeight: 700 }}>৳{bn(dTotal)}</span>
                      </div>
                      {dGrouped.length > 0 && (
                        <>
                          <table style={S.table}>
                            <thead><tr>{[histField === "name" ? "খরচের খাত" : "সেবার নাম","বার","মোট"].map(h => <th key={h} style={{ ...S.th, background: "#333", fontSize: 12 }}>{h}</th>)}</tr></thead>
                            <tbody>
                              {dGrouped.map((r, i) => (
                                <tr key={i}>
                                  <td style={S.td(i)}>{r.name}</td>
                                  <td style={{ ...S.td(i), color: "#2563eb", fontWeight: 600 }}>{bn(r.qty)} বার</td>
                                  <td style={{ ...S.td(i), fontWeight: 700 }}>৳{bn(r.total)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <div style={{ padding: "8px 14px", textAlign: "right" }}>
                            <button onClick={() => printReport(dTxs, histField === "name" ? "দৈনিক খরচের রিপোর্ট" : "দৈনিক ইনভয়েস", formatDate(day), histField, histLabel)}
                              style={{ ...S.btn(false, histColor), fontSize: 12, padding: "6px 14px" }}>🖨️ প্রিন্ট</button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          );
        })()}

        {/* ===== ANALYTICS ===== */}
        {tab === "analytics" && (() => {
          const aList = analyticsType === "income" ? transactions : expenses;
          const aField = analyticsType === "income" ? "serviceName" : "name";
          const aColor = analyticsType === "income" ? "#1a1a1a" : "#e74c3c";
          const periods = [
            { key: "day", label: "আজ", txs: getFiltered(aList, "day", getTodayKey()) },
            { key: "week", label: "এই সপ্তাহ", txs: getFiltered(aList, "week", getWeekKey(getTodayKey())) },
            { key: "month", label: "এই মাস", txs: getFiltered(aList, "month", getMonthKey(getTodayKey())) },
            { key: "year", label: "এই বছর", txs: getFiltered(aList, "year", getYearKey(getTodayKey())) },
          ];

          return (
            <div>
              <h2 style={S.sectionTitle}>📈 বিশ্লেষণ</h2>
              <p style={{ color: "#888", fontSize: 13, margin: "0 0 16px" }}>কোন সেবা/খাত কতবার ব্যবহৃত হয়েছে এবং কত টাকা — দিন, সপ্তাহ, মাস ও বছরভিত্তিক।</p>

              <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                {[["income","💰 আয় বিশ্লেষণ"],["expense","💸 খরচ বিশ্লেষণ"]].map(([k,l]) => (
                  <button key={k} onClick={() => setAnalyticsType(k)} style={{ ...S.btn(analyticsType === k, k === "expense" ? "#e74c3c" : "#1a1a1a"), borderRadius: 20, padding: "8px 18px" }}>{l}</button>
                ))}
              </div>

              {periods.map(period => {
                const grouped = groupByItem(period.txs, aField);
                const total = sumTotal(period.txs);
                if (grouped.length === 0) return null;
                return (
                  <div key={period.key} style={{ marginBottom: 28 }}>
                    <div style={{ background: aColor, color: "#f5f0e8", borderRadius: "12px 12px 0 0", padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{period.label} — {analyticsType === "income" ? "সেবাভিত্তিক আয়" : "খাতভিত্তিক খরচ"}</span>
                      <span style={{ color: "#f5a623", fontWeight: 700, fontSize: 16 }}>৳{bn(total)}</span>
                    </div>
                    <div style={{ background: "#fff", border: `2px solid ${aColor}`, borderTop: "none", borderRadius: "0 0 12px 12px", overflow: "hidden" }}>
                      <table style={S.table}>
                        <thead><tr>
                          <th style={{ ...S.th, background: "#333" }}>{analyticsType === "income" ? "সেবার নাম" : "খরচের খাত"}</th>
                          <th style={{ ...S.th, background: "#333" }}>কতবার</th>
                          <th style={{ ...S.th, background: "#333" }}>মোট</th>
                          <th style={{ ...S.th, background: "#333" }}>অবদান</th>
                        </tr></thead>
                        <tbody>
                          {grouped.map((r, i) => (
                            <tr key={i}>
                              <td style={S.td(i)}>{r.name}</td>
                              <td style={{ ...S.td(i), fontWeight: 700, color: "#2563eb" }}>{bn(r.qty)} বার</td>
                              <td style={{ ...S.td(i), fontWeight: 700 }}>৳{bn(r.total)}</td>
                              <td style={S.td(i)}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <div style={{ flex: 1, height: 8, background: "#eee", borderRadius: 4, overflow: "hidden" }}>
                                    <div style={{ width: `${total > 0 ? (r.total / total * 100) : 0}%`, height: "100%", background: aColor, borderRadius: 4 }} />
                                  </div>
                                  <span style={{ fontSize: 12, color: "#555", minWidth: 38 }}>
                                    {total > 0 ? Math.round(r.total / total * 100) : 0}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}

              {aList.length === 0 && (
                <div style={{ background: "#fff", border: "2px dashed #ddd", borderRadius: 12, padding: "40px", textAlign: "center", color: "#aaa" }}>এখনো কোনো ডেটা নেই। {analyticsType === "income" ? "সেবা" : "খরচ"} যোগ করলে এখানে বিশ্লেষণ দেখাবে।</div>
              )}
            </div>
          );
        })()}

        {/* ===== MANAGE SERVICES ===== */}
        {tab === "manage" && (
          <div>
            <h2 style={{ ...S.sectionTitle }}>⚙️ সেবা সম্পাদনা করুন</h2>
            <p style={{ color: "#888", fontSize: 13, margin: "0 0 16px" }}>সেবার নাম বা মূল্য পরিবর্তন করুন, নতুন সেবা যোগ করুন বা মুছুন।</p>

            {/* নতুন সেবা */}
            <div style={{ background: "#fff", border: "2px dashed #1a1a1a", borderRadius: 12, padding: "16px", marginBottom: 20 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>➕ নতুন সেবা তৈরি করুন</h3>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <input type="text" placeholder="সেবার নাম লিখুন..." value={newSvcName}
                  onChange={e => setNewSvcName(e.target.value)}
                  style={{ flex: 2, minWidth: 180, padding: "9px 12px", border: "1.5px solid #ddd", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>৳</span>
                  <input type="number" placeholder="মূল্য" value={newSvcPrice} onChange={e => setNewSvcPrice(e.target.value)}
                    style={{ width: 100, padding: "9px 10px", border: "1.5px solid #ddd", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none" }} />
                </div>
                <button onClick={() => {
                  if (!newSvcName.trim()) { showToast("❌ সেবার নাম লিখুন"); return; }
                  const price = parseFloat(newSvcPrice) || 0;
                  const newSvc = { id: Date.now(), name: newSvcName.trim(), price };
                  setServices(prev => [...prev, newSvc]);
                  setNewSvcName(""); setNewSvcPrice("");
                  showToast(`✅ "${newSvc.name}" সেবা যোগ হয়েছে`);
                }} style={{ ...S.btn(true), whiteSpace: "nowrap" }}>✅ যোগ করুন</button>
              </div>
            </div>

            {/* সেবার তালিকা */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {services.map((svc, i) => (
                <div key={svc.id} style={{ background: "#fff", border: "2px solid #1a1a1a", borderRadius: 12, padding: "12px 16px", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, color: "#888", minWidth: 24 }}>{i+1}.</span>
                  <input value={svc.name} onChange={e => setServices(s => s.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                    style={{ flex: 2, minWidth: 160, padding: "8px 10px", border: "1.5px solid #ddd", borderRadius: 7, fontSize: 13, fontFamily: "inherit", outline: "none" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>৳</span>
                    <input type="number" value={svc.price} onChange={e => setServices(s => s.map((x, j) => j === i ? { ...x, price: parseFloat(e.target.value)||0 } : x))}
                      style={{ width: 85, padding: "8px 10px", border: "1.5px solid #ddd", borderRadius: 7, fontSize: 13, fontFamily: "inherit", outline: "none" }} />
                  </div>
                  <button onClick={() => { if (window.confirm(`"${svc.name}" মুছে ফেলবেন?`)) { setServices(s => s.filter((_, j) => j !== i)); showToast(`🗑️ মুছে ফেলা হয়েছে`); } }}
                    style={{ background: "#fff0f0", border: "1.5px solid #e74c3c", color: "#e74c3c", borderRadius: 7, padding: "7px 12px", cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "inherit" }}>
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 36 }}>
              <button onClick={() => { if(window.confirm("সব সেবা ডিফল্টে ফিরিয়ে আনবেন?")) { setServices(DEFAULT_SERVICES); showToast("ডিফল্টে ফিরিয়ে আনা হয়েছে"); }}} style={S.btn(false)}>🔄 ডিফল্টে ফিরুন</button>
              <button onClick={() => showToast("পরিবর্তন সংরক্ষিত হয়েছে ✅")} style={S.btn(true)}>💾 সংরক্ষণ নিশ্চিত করুন</button>
            </div>

            {/* ===== EXPENSE CATEGORY MANAGEMENT ===== */}
            <h2 style={{ ...S.sectionTitle, color: "#e74c3c" }}>⚙️ খরচের খাত সম্পাদনা করুন</h2>
            <p style={{ color: "#888", fontSize: 13, margin: "0 0 16px" }}>খরচের খাতের নাম পরিবর্তন করুন, নতুন খাত যোগ করুন বা মুছুন।</p>

            <div style={{ background: "#fff", border: "2px dashed #e74c3c", borderRadius: 12, padding: "16px", marginBottom: 20 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>➕ নতুন খরচের খাত তৈরি করুন</h3>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <input type="text" placeholder="খাতের নাম লিখুন..." value={newExpName}
                  onChange={e => setNewExpName(e.target.value)}
                  style={{ flex: 2, minWidth: 180, padding: "9px 12px", border: "1.5px solid #ddd", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>৳</span>
                  <input type="number" placeholder="ডিফল্ট মূল্য (ঐচ্ছিক)" value={newExpPrice} onChange={e => setNewExpPrice(e.target.value)}
                    style={{ width: 150, padding: "9px 10px", border: "1.5px solid #ddd", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none" }} />
                </div>
                <button onClick={() => {
                  if (!newExpName.trim()) { showToast("❌ খাতের নাম লিখুন"); return; }
                  const price = parseFloat(newExpPrice) || 0;
                  const newCat = { id: Date.now(), name: newExpName.trim(), price };
                  setExpenseCats(prev => [...prev, newCat]);
                  setNewExpName(""); setNewExpPrice("");
                  showToast(`✅ "${newCat.name}" খাত যোগ হয়েছে`);
                }} style={{ ...S.btn(true, "#e74c3c"), whiteSpace: "nowrap" }}>✅ যোগ করুন</button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {expenseCats.map((cat, i) => (
                <div key={cat.id} style={{ background: "#fff", border: "2px solid #e74c3c", borderRadius: 12, padding: "12px 16px", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, color: "#888", minWidth: 24 }}>{i+1}.</span>
                  <input value={cat.name} onChange={e => setExpenseCats(s => s.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                    style={{ flex: 2, minWidth: 160, padding: "8px 10px", border: "1.5px solid #ddd", borderRadius: 7, fontSize: 13, fontFamily: "inherit", outline: "none" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>৳</span>
                    <input type="number" value={cat.price} onChange={e => setExpenseCats(s => s.map((x, j) => j === i ? { ...x, price: parseFloat(e.target.value)||0 } : x))}
                      style={{ width: 85, padding: "8px 10px", border: "1.5px solid #ddd", borderRadius: 7, fontSize: 13, fontFamily: "inherit", outline: "none" }} />
                  </div>
                  <button onClick={() => { if (window.confirm(`"${cat.name}" মুছে ফেলবেন?`)) { setExpenseCats(s => s.filter((_, j) => j !== i)); showToast(`🗑️ মুছে ফেলা হয়েছে`); } }}
                    style={{ background: "#fff0f0", border: "1.5px solid #e74c3c", color: "#e74c3c", borderRadius: 7, padding: "7px 12px", cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "inherit" }}>
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={() => { if(window.confirm("সব খাত ডিফল্টে ফিরিয়ে আনবেন?")) { setExpenseCats(DEFAULT_EXPENSE_CATS); showToast("ডিফল্টে ফিরিয়ে আনা হয়েছে"); }}} style={S.btn(false, "#e74c3c")}>🔄 ডিফল্টে ফিরুন</button>
              <button onClick={() => showToast("পরিবর্তন সংরক্ষিত হয়েছে ✅")} style={S.btn(true, "#e74c3c")}>💾 সংরক্ষণ নিশ্চিত করুন</button>
            </div>
          </div>
        )}

        {/* ===== ADMIN PANEL ===== */}
        {tab === "admin" && isAdmin(user) && (() => {
          const allUsers = getUsers();
          const admins = getAdmins();
          const seenCount = getSeenUserCount();
          const newUsers = allUsers.slice(seenCount);

          return (
            <div>
              <h2 style={S.sectionTitle}>🛡️ অ্যাডমিন প্যানেল</h2>
              <p style={{ color: "#888", fontSize: 13, margin: "0 0 20px" }}>শুধুমাত্র অ্যাডমিনরা এই পেজ দেখতে পাবেন।</p>

              {/* New user notification */}
              {newUsers.length > 0 && (
                <div style={{ background: "#fff7e6", border: "2px solid #f5a623", borderRadius: 12, padding: "16px 18px", marginBottom: 20 }}>
                  <p style={{ margin: "0 0 8px", fontWeight: 700, fontSize: 15 }}>🔔 {bn(newUsers.length)} জন নতুন ইউজার নিবন্ধন করেছেন</p>
                  <ul style={{ margin: "0 0 12px", paddingLeft: 20, fontSize: 13, color: "#555" }}>
                    {newUsers.map((u, i) => <li key={i}>{u.contact} — {u.joinedAt ? formatDate(u.joinedAt.split("T")[0]) : "—"}</li>)}
                  </ul>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <a href={`https://wa.me/880${ADMIN_CONTACT}?text=${encodeURIComponent("নতুন ইউজার তালিকা:\n" + newUsers.map(u => "• " + u.contact).join("\n"))}`}
                      target="_blank" rel="noreferrer"
                      style={{ ...S.btn(true, "#16a34a"), textDecoration: "none", display: "inline-block" }}>📱 WhatsApp এ পাঠান</a>
                    <button onClick={() => markUsersSeen(allUsers.length)} style={S.btn(false)}>✅ দেখা হয়েছে চিহ্নিত করুন</button>
                  </div>
                  <p style={{ margin: "10px 0 0", fontSize: 11, color: "#aaa" }}>স্বয়ংক্রিয়ভাবে ইমেইল/হোয়াটসঅ্যাপ মেসেজ পাঠাতে একটি ব্যাকএন্ড সার্ভার (যেমন Firebase Functions বা EmailJS) প্রয়োজন। এই বাটনে ক্লিক করলে আপনার WhatsApp এ প্রি-লেখা মেসেজ খুলে যাবে, শুধু পাঠাতে হবে।</p>
                </div>
              )}

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 28 }}>
                {[
                  { label: "মোট ইউজার", value: bn(allUsers.length), icon: "👥" },
                  { label: "মোট অ্যাডমিন", value: bn(admins.length), icon: "🛡️" },
                  { label: "সর্বমোট আয়", value: `৳${bn(sumTotal(transactions))}`, icon: "💰" },
                  { label: "সর্বমোট খরচ", value: `৳${bn(sumTotal(expenses))}`, icon: "💸" },
                  { label: "সর্বমোট নিট লাভ", value: `৳${bn(sumTotal(transactions) - sumTotal(expenses))}`, icon: "📈" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "#fff", border: "2px solid #1a1a1a", borderRadius: 12, padding: "16px 18px", boxShadow: "3px 3px 0 #1a1a1a" }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                    <div style={{ fontSize: 22, fontWeight: 700 }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* User list */}
              <div style={{ background: "#fff", border: "2px solid #1a1a1a", borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
                <div style={{ background: "#1a1a1a", color: "#f5f0e8", padding: "12px 18px", fontWeight: 700, fontSize: 15 }}>
                  👥 নিবন্ধিত ইউজার তালিকা ({bn(allUsers.length)} জন)
                </div>
                {allUsers.length === 0
                  ? <p style={{ padding: 20, color: "#aaa" }}>কোনো ইউজার নেই</p>
                  : <table style={S.table}>
                      <thead><tr>
                        <th style={S.th}>#</th>
                        <th style={S.th}>ইমেইল / নম্বর</th>
                        <th style={S.th}>নিবন্ধনের তারিখ</th>
                        <th style={S.th}>ভূমিকা</th>
                        <th style={S.th}>কার্যক্রম</th>
                      </tr></thead>
                      <tbody>
                        {allUsers.map((u, i) => (
                          <tr key={i}>
                            <td style={S.td(i)}>{bn(i+1)}</td>
                            <td style={{ ...S.td(i), fontWeight: 600 }}>{u.contact}</td>
                            <td style={S.td(i)}>{u.joinedAt ? formatDate(u.joinedAt.split("T")[0]) : "—"}</td>
                            <td style={S.td(i)}>
                              {admins.includes(u.contact)
                                ? <span style={{ background: "#f5a623", color: "#1a1a1a", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>ADMIN</span>
                                : <span style={{ background: "#e8e2d6", color: "#555", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 10 }}>USER</span>}
                            </td>
                            <td style={S.td(i)}>
                              {u.contact !== user.contact && (
                                admins.includes(u.contact)
                                  ? <button onClick={() => {
                                      if (window.confirm(`"${u.contact}" কে অ্যাডমিন থেকে সরাবেন?`)) {
                                        const updated = admins.filter(a => a !== u.contact);
                                        localStorage.setItem(ADMINS_KEY, JSON.stringify(updated));
                                        showToast("✅ অ্যাডমিন সরানো হয়েছে");
                                        setTab("dashboard"); setTimeout(() => setTab("admin"), 50);
                                      }
                                    }}
                                    style={{ ...S.btn(false, "#e74c3c"), padding: "5px 12px", fontSize: 12 }}>
                                    অ্যাডমিন সরান
                                  </button>
                                  : <button onClick={() => {
                                      if (window.confirm(`"${u.contact}" কে অ্যাডমিন করবেন?`)) {
                                        const updated = [...admins, u.contact];
                                        localStorage.setItem(ADMINS_KEY, JSON.stringify(updated));
                                        showToast("✅ অ্যাডমিন করা হয়েছে");
                                        setTab("dashboard"); setTimeout(() => setTab("admin"), 50);
                                      }
                                    }}
                                    style={{ ...S.btn(true), padding: "5px 12px", fontSize: 12 }}>
                                    অ্যাডমিন করুন
                                  </button>
                              )}
                              {u.contact === user.contact && <span style={{ color: "#aaa", fontSize: 12 }}>আপনি</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                }
              </div>

              {/* Add admin by contact */}
              <div style={{ background: "#fff", border: "2px dashed #1a1a1a", borderRadius: 12, padding: "16px 20px" }}>
                <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>🛡️ নতুন অ্যাডমিন যোগ করুন</h3>
                <p style={{ color: "#888", fontSize: 12, margin: "0 0 12px" }}>ইউজারের ইমেইল বা নম্বর দিয়ে তাকে অ্যাডমিন বানান। ইউজারটি আগে নিবন্ধিত থাকতে হবে।</p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <input type="text" placeholder="ইমেইল বা মোবাইল নম্বর" value={adminNewContact} onChange={e => setAdminNewContact(e.target.value)}
                    style={{ flex: 2, minWidth: 200, ...S.input }} />
                  <button onClick={() => {
                    const u = getUsers().find(u => u.contact === adminNewContact.trim());
                    if (!u) { showToast("❌ এই ইমেইল/নম্বরে কোনো ইউজার নেই"); return; }
                    const ads = getAdmins();
                    if (ads.includes(adminNewContact.trim())) { showToast("⚠️ এই ইউজার ইতিমধ্যে অ্যাডমিন"); return; }
                    localStorage.setItem(ADMINS_KEY, JSON.stringify([...ads, adminNewContact.trim()]));
                    showToast(`✅ "${adminNewContact}" কে অ্যাডমিন করা হয়েছে`);
                    setAdminNewContact("");
                    setTab("dashboard"); setTimeout(() => setTab("admin"), 50);
                  }} style={{ ...S.btn(true), whiteSpace: "nowrap" }}>✅ অ্যাডমিন করুন</button>
                </div>
              </div>

              {/* Contact info */}
              <div style={{ marginTop: 20, padding: "14px 18px", background: "#f5f0e8", borderRadius: 10 }}>
                <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: 14 }}>📞 প্রধান অ্যাডমিন যোগাযোগ</p>
                <p style={{ margin: "2px 0", fontSize: 13 }}>📱 WhatsApp: <a href={`https://wa.me/880${ADMIN_CONTACT}`} target="_blank" rel="noreferrer" style={{ color: "#25d366", fontWeight: 700 }}>{ADMIN_CONTACT}</a></p>
                <p style={{ margin: "2px 0", fontSize: 13 }}>✉️ Email: <a href={`mailto:${ADMIN_EMAIL}`} style={{ color: "#2563eb", fontWeight: 700 }}>{ADMIN_EMAIL}</a></p>
              </div>
            </div>
          );
        })()}

      </div>

      {/* ===== ADD SERVICE / EXPENSE MODAL ===== */}
      {editService && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "28px 24px", width: "100%", maxWidth: 380, border: `2px solid ${editService.kind === "expense" ? "#e74c3c" : "#1a1a1a"}`, boxShadow: `6px 6px 0 ${editService.kind === "expense" ? "#e74c3c" : "#1a1a1a"}` }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 17, fontWeight: 700 }}>{editService.kind === "expense" ? "খরচ যোগ করুন" : "সেবা যোগ করুন"}</h3>
            {[
              { label: editService.kind === "expense" ? "খাতের নাম" : "সেবার নাম", type: "text", val: editName, set: setEditName },
              { label: "মূল্য (৳)", type: "number", val: editPrice, set: setEditPrice },
              { label: "সংখ্যা", type: "number", val: editQty, set: setEditQty, min: 1 },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 13, color: "#555", marginBottom: 4 }}>{f.label}</label>
                <input type={f.type} value={f.val} min={f.min} onChange={e => f.set(e.target.value)} style={S.input} />
              </div>
            ))}
            <div style={{ background: "#f5f0e8", border: "1.5px solid #ddd", borderRadius: 8, padding: "10px 14px", marginBottom: 20, textAlign: "center" }}>
              <span style={{ fontSize: 14, color: "#555" }}>মোট: </span>
              <span style={{ fontSize: 22, fontWeight: 700 }}>৳{bn((parseFloat(editPrice)||0) * (parseInt(editQty)||1))}</span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setEditService(null)} style={{ ...S.btn(false), flex: 1 }}>বাতিল</button>
              <button onClick={confirmAdd} style={{ ...S.btn(true, editService.kind === "expense" ? "#e74c3c" : "#1a1a1a"), flex: 1 }}>✅ যোগ করুন</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#1a1a1a", color: "#f5f0e8", padding: "12px 24px", borderRadius: 30, fontSize: 14, fontWeight: 600, zIndex: 300, boxShadow: "0 4px 20px rgba(0,0,0,0.3)", whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}
    </div>
  );
}
