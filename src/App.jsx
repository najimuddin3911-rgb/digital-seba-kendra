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

  // History drill-down
  const [historyView, setHistoryView] = useState("years"); // years | months | weeks | days
  const [historyYear, setHistoryYear] = useState(null);
  const [historyMonth, setHistoryMonth] = useState(null);
  const [historyWeek, setHistoryWeek] = useState(null);

  // Service management
  const [newSvcName, setNewSvcName] = useState("");
  const [newSvcPrice, setNewSvcPrice] = useState("");

  // Admin
  const [adminNewContact, setAdminNewContact] = useState("");

  // ===== EFFECTS =====
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem(SERVICES_KEY, JSON.stringify(services)); }, [services]);

  // ===== HELPERS =====
  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 2800); }

  function getUsers() { try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch { return []; } }
  function getAdmins() { try { return JSON.parse(localStorage.getItem(ADMINS_KEY)) || [ADMIN_CONTACT, ADMIN_EMAIL]; } catch { return [ADMIN_CONTACT, ADMIN_EMAIL]; } }
  function isAdmin(u) { if (!u) return false; return getAdmins().includes(u.contact); }

  function getFiltered(period, key) {
    return transactions.filter(tx => {
      if (period === "day") return tx.date === key;
      if (period === "week") return getWeekKey(tx.date) === key;
      if (period === "month") return getMonthKey(tx.date) === key;
      if (period === "year") return getYearKey(tx.date) === key;
      return true;
    });
  }

  function groupByService(txs) {
    const map = {};
    txs.forEach(tx => {
      if (!map[tx.serviceName]) map[tx.serviceName] = { name: tx.serviceName, qty: 0, total: 0, price: tx.price };
      map[tx.serviceName].qty += tx.qty;
      map[tx.serviceName].total += tx.total;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }

  function sumTotal(txs) { return txs.reduce((s, t) => s + t.total, 0); }

  // All unique years/months/weeks/days from transactions
  const allYears = [...new Set(transactions.map(t => getYearKey(t.date)))].sort().reverse();
  const allMonths = (year) => [...new Set(transactions.filter(t => getYearKey(t.date) === year).map(t => getMonthKey(t.date)))].sort().reverse();
  const allWeeks = (month) => [...new Set(transactions.filter(t => getMonthKey(t.date) === month).map(t => getWeekKey(t.date)))].sort().reverse();
  const allDays = (week) => [...new Set(transactions.filter(t => getWeekKey(t.date) === week).map(t => t.date))].sort().reverse();

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

  // ===== SERVICE SALE =====
  function addService(svc) { setEditService(svc); setEditQty(1); setEditPrice(String(svc.price)); setEditName(svc.name); }

  function confirmAdd() {
    const qty = parseInt(editQty) || 1;
    const price = parseFloat(editPrice) || 0;
    const tx = { id: Date.now(), date: getTodayKey(), serviceId: editService.id, serviceName: editName, qty, price, total: qty * price };
    setTransactions(prev => [...prev, tx]);
    setEditService(null);
    showToast(`✅ "${editName}" যোগ হয়েছে`);
  }

  // ===== PRINT =====
  function printReport(txs, title, subtitle) {
    const grouped = groupByService(txs);
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
<thead><tr><th>#</th><th>সেবার নাম</th><th>সংখ্যা</th><th>একক মূল্য</th><th>মোট</th></tr></thead>
<tbody>
${grouped.map((r, i) => `<tr><td>${i + 1}</td><td>${r.name}</td><td>${r.qty}</td><td>৳${r.price}</td><td>৳${r.total}</td></tr>`).join("")}
<tr class="total-row"><td colspan="4">মোট আয়</td><td>৳${total}</td></tr>
</tbody></table>
<div class="footer">মুদ্রণ তারিখ: ${new Date().toLocaleString("bn-BD")} | ধন্যবাদ সেবা গ্রহণ করার জন্য</div>
<script>window.onload=()=>window.print();<\/script>
</body></html>`);
    w.document.close();
  }

  // ===== COMPUTED =====
  const todayTxs = getFiltered("day", getTodayKey());
  const todayTotal = sumTotal(todayTxs);
  const monthTotal = sumTotal(getFiltered("month", getMonthKey(getTodayKey())));
  const yearTotal = sumTotal(getFiltered("year", getYearKey(getTodayKey())));

  const reportKey = (() => {
    if (reportPeriod === "day") return reportDate;
    if (reportPeriod === "week") return getWeekKey(reportDate);
    if (reportPeriod === "month") return getMonthKey(reportDate);
    return getYearKey(reportDate);
  })();
  const reportTxs = getFiltered(reportPeriod, reportKey);
  const reportGrouped = groupByService(reportTxs);
  const reportTotal = sumTotal(reportTxs);

  const navItems = [
    { key: "dashboard", label: "ড্যাশবোর্ড", icon: "📊" },
    { key: "services", label: "সেবা যোগ", icon: "➕" },
    { key: "report", label: "রিপোর্ট", icon: "📋" },
    { key: "history", label: "সম্পূর্ণ ইতিহাস", icon: "📅" },
    { key: "analytics", label: "বিশ্লেষণ", icon: "📈" },
    { key: "manage", label: "সেবা সম্পাদনা", icon: "⚙️" },
    ...(isAdmin(user) ? [{ key: "admin", label: "অ্যাডমিন", icon: "🛡️" }] : []),
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 28 }}>
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

            <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>আজকের এন্ট্রি ({formatDate(getTodayKey())})</h3>
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
              <button onClick={() => printReport(todayTxs, "দৈনিক ইনভয়েস", formatDate(getTodayKey()))} style={{ ...S.btn(true), marginTop: 14 }}>
                🖨️ আজকের ইনভয়েস প্রিন্ট করুন
              </button>
            )}
          </div>
        )}

        {/* ===== SERVICES ===== */}
        {tab === "services" && (
          <div>
            <h2 style={{ ...S.sectionTitle }}>➕ সেবা যোগ করুন</h2>
            <p style={{ color: "#888", fontSize: 13, margin: "0 0 20px" }}>যেকোনো সেবার বাটনে ক্লিক করুন, দাম/পরিমাণ ঠিক করে যোগ করুন।</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 12 }}>
              {services.map(svc => (
                <button key={svc.id} className="svc-btn" onClick={() => addService(svc)}
                  style={{ background: "#fff", border: "2px solid #1a1a1a", borderRadius: 12, padding: "16px 14px", cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "all .2s", boxShadow: "3px 3px 0 #1a1a1a" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, lineHeight: 1.4 }}>{svc.name}</div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>৳{bn(svc.price)}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ===== REPORT ===== */}
        {tab === "report" && (
          <div>
            <h2 style={S.sectionTitle}>📋 রিপোর্ট ও হিসাব</h2>
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
            <div style={{ background: "#1a1a1a", color: "#f5f0e8", borderRadius: 10, padding: "10px 16px", marginBottom: 16, fontSize: 14, fontWeight: 600 }}>
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
                      <thead><tr>{["ক্রমিক","সেবার নাম","বিক্রির সংখ্যা","একক মূল্য","মোট আয়"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
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
                          <td colSpan={4} style={{ padding: "12px 14px", fontWeight: 700, fontSize: 14, background: "#f5f0e8" }}>মোট আয়</td>
                          <td style={{ padding: "12px 14px", fontWeight: 700, fontSize: 16, background: "#f5f0e8" }}>৳{bn(reportTotal)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <button onClick={() => printReport(reportTxs, `${reportPeriod === "day" ? "দৈনিক" : reportPeriod === "week" ? "সাপ্তাহিক" : reportPeriod === "month" ? "মাসিক" : "বার্ষিক"} ইনভয়েস`, reportPeriod === "day" ? formatDate(reportKey) : reportPeriod === "week" ? formatWeekRange(reportKey) : reportPeriod === "month" ? formatMonthKey(reportKey) : reportKey + " সাল")}
                    style={S.btn(true)}>
                    🖨️ ইনভয়েস প্রিন্ট / PDF করুন
                  </button>
                </>
            }
          </div>
        )}

        {/* ===== HISTORY (FULL DRILL-DOWN) ===== */}
        {tab === "history" && (
          <div>
            <h2 style={S.sectionTitle}>📅 সম্পূর্ণ ইতিহাস</h2>

            {/* Breadcrumb */}
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
              <button onClick={() => { setHistoryView("years"); setHistoryYear(null); setHistoryMonth(null); setHistoryWeek(null); }}
                style={{ ...S.btn(historyView === "years"), padding: "6px 14px", borderRadius: 20, fontSize: 13 }}>
                সব বছর
              </button>
              {historyYear && <>
                <span style={{ color: "#aaa" }}>›</span>
                <button onClick={() => { setHistoryView("months"); setHistoryMonth(null); setHistoryWeek(null); }}
                  style={{ ...S.btn(historyView === "months"), padding: "6px 14px", borderRadius: 20, fontSize: 13 }}>
                  {historyYear} সাল
                </button>
              </>}
              {historyMonth && <>
                <span style={{ color: "#aaa" }}>›</span>
                <button onClick={() => { setHistoryView("weeks"); setHistoryWeek(null); }}
                  style={{ ...S.btn(historyView === "weeks"), padding: "6px 14px", borderRadius: 20, fontSize: 13 }}>
                  {formatMonthKey(historyMonth)}
                </button>
              </>}
              {historyWeek && <>
                <span style={{ color: "#aaa" }}>›</span>
                <button onClick={() => setHistoryView("days")}
                  style={{ ...S.btn(historyView === "days"), padding: "6px 14px", borderRadius: 20, fontSize: 13 }}>
                  সপ্তাহ
                </button>
              </>}
            </div>

            {/* YEARS VIEW */}
            {historyView === "years" && (
              allYears.length === 0
                ? <div style={{ background: "#fff", border: "2px dashed #ddd", borderRadius: 12, padding: "40px", textAlign: "center", color: "#aaa" }}>কোনো ডেটা নেই</div>
                : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {allYears.map(year => {
                      const yTxs = getFiltered("year", year);
                      const yTotal = sumTotal(yTxs);
                      return (
                        <div key={year} className="hist-row" onClick={() => { setHistoryYear(year); setHistoryView("months"); }}
                          style={{ background: "#fff", border: "2px solid #1a1a1a", borderRadius: 12, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "3px 3px 0 #1a1a1a", transition: "all .15s" }}>
                          <div>
                            <div style={{ fontSize: 18, fontWeight: 700 }}>📅 {year} সাল</div>
                            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{bn(yTxs.length)} টি এন্ট্রি • {allMonths(year).length} মাসের ডেটা</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a" }}>৳{bn(yTotal)}</div>
                            <div style={{ fontSize: 12, color: "#aaa" }}>মোট আয় →</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
            )}

            {/* MONTHS VIEW */}
            {historyView === "months" && historyYear && (
              <div>
                <div style={{ background: "#f5f0e8", border: "2px solid #1a1a1a", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontWeight: 700, fontSize: 15 }}>
                  📅 {historyYear} সালের মাসভিত্তিক ইনকাম
                  <span style={{ float: "right", color: "#555", fontSize: 13, fontWeight: 600 }}>মোট: ৳{bn(sumTotal(getFiltered("year", historyYear)))}</span>
                </div>
                {allMonths(historyYear).length === 0
                  ? <p style={{ color: "#aaa" }}>কোনো ডেটা নেই</p>
                  : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {allMonths(historyYear).map(mk => {
                        const mTxs = getFiltered("month", mk);
                        const mTotal = sumTotal(mTxs);
                        return (
                          <div key={mk} className="hist-row" onClick={() => { setHistoryMonth(mk); setHistoryView("weeks"); }}
                            style={{ background: "#fff", border: "2px solid #1a1a1a", borderRadius: 12, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "3px 3px 0 #1a1a1a", transition: "all .15s" }}>
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
                <div style={{ background: "#f5f0e8", border: "2px solid #1a1a1a", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontWeight: 700, fontSize: 15 }}>
                  🗓️ {formatMonthKey(historyMonth)} — সাপ্তাহিক ইনকাম
                  <span style={{ float: "right", color: "#555", fontSize: 13, fontWeight: 600 }}>মোট: ৳{bn(sumTotal(getFiltered("month", historyMonth)))}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {allWeeks(historyMonth).map(wk => {
                    const wTxs = getFiltered("week", wk);
                    const wTotal = sumTotal(wTxs);
                    return (
                      <div key={wk} className="hist-row" onClick={() => { setHistoryWeek(wk); setHistoryView("days"); }}
                        style={{ background: "#fff", border: "2px solid #1a1a1a", borderRadius: 12, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "3px 3px 0 #1a1a1a", transition: "all .15s" }}>
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
                <div style={{ background: "#f5f0e8", border: "2px solid #1a1a1a", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontWeight: 700, fontSize: 15 }}>
                  📆 সপ্তাহ: {formatWeekRange(historyWeek)} — দৈনিক ইনকাম
                  <span style={{ float: "right", color: "#555", fontSize: 13, fontWeight: 600 }}>মোট: ৳{bn(sumTotal(getFiltered("week", historyWeek)))}</span>
                </div>
                {allDays(historyWeek).map(day => {
                  const dTxs = getFiltered("day", day);
                  const dGrouped = groupByService(dTxs);
                  const dTotal = sumTotal(dTxs);
                  return (
                    <div key={day} style={{ background: "#fff", border: "2px solid #1a1a1a", borderRadius: 12, marginBottom: 14, overflow: "hidden", boxShadow: "3px 3px 0 #1a1a1a" }}>
                      <div style={{ background: "#1a1a1a", color: "#f5f0e8", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 700 }}>📅 {formatDate(day)}</span>
                        <span style={{ color: "#f5a623", fontWeight: 700 }}>৳{bn(dTotal)}</span>
                      </div>
                      {dGrouped.length > 0 && (
                        <>
                          <table style={S.table}>
                            <thead><tr>{["সেবার নাম","বিক্রি","মোট"].map(h => <th key={h} style={{ ...S.th, background: "#333", fontSize: 12 }}>{h}</th>)}</tr></thead>
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
                            <button onClick={() => printReport(dTxs, "দৈনিক ইনভয়েস", formatDate(day))}
                              style={{ ...S.btn(false), fontSize: 12, padding: "6px 14px" }}>🖨️ প্রিন্ট</button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===== ANALYTICS ===== */}
        {tab === "analytics" && (() => {
          const periods = [
            { key: "day", label: "আজ", txs: getFiltered("day", getTodayKey()) },
            { key: "week", label: "এই সপ্তাহ", txs: getFiltered("week", getWeekKey(getTodayKey())) },
            { key: "month", label: "এই মাস", txs: getFiltered("month", getMonthKey(getTodayKey())) },
            { key: "year", label: "এই বছর", txs: getFiltered("year", getYearKey(getTodayKey())) },
          ];

          return (
            <div>
              <h2 style={S.sectionTitle}>📈 সেবা বিশ্লেষণ</h2>
              <p style={{ color: "#888", fontSize: 13, margin: "0 0 24px" }}>কোন সেবা কতবার বিক্রি হয়েছে এবং কত আয় হয়েছে — দিন, সপ্তাহ, মাস ও বছরভিত্তিক।</p>

              {periods.map(period => {
                const grouped = groupByService(period.txs);
                const total = sumTotal(period.txs);
                if (grouped.length === 0) return null;
                return (
                  <div key={period.key} style={{ marginBottom: 28 }}>
                    <div style={{ background: "#1a1a1a", color: "#f5f0e8", borderRadius: "12px 12px 0 0", padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{period.label} — সেবাভিত্তিক আয়</span>
                      <span style={{ color: "#f5a623", fontWeight: 700, fontSize: 16 }}>৳{bn(total)}</span>
                    </div>
                    <div style={{ background: "#fff", border: "2px solid #1a1a1a", borderTop: "none", borderRadius: "0 0 12px 12px", overflow: "hidden" }}>
                      <table style={S.table}>
                        <thead><tr>
                          <th style={{ ...S.th, background: "#333" }}>সেবার নাম</th>
                          <th style={{ ...S.th, background: "#333" }}>বিক্রির সংখ্যা</th>
                          <th style={{ ...S.th, background: "#333" }}>মোট আয়</th>
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
                                    <div style={{ width: `${total > 0 ? (r.total / total * 100) : 0}%`, height: "100%", background: "#1a1a1a", borderRadius: 4 }} />
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

              {transactions.length === 0 && (
                <div style={{ background: "#fff", border: "2px dashed #ddd", borderRadius: 12, padding: "40px", textAlign: "center", color: "#aaa" }}>এখনো কোনো ডেটা নেই। সেবা যোগ করলে এখানে বিশ্লেষণ দেখাবে।</div>
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

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={() => { if(window.confirm("সব সেবা ডিফল্টে ফিরিয়ে আনবেন?")) { setServices(DEFAULT_SERVICES); showToast("ডিফল্টে ফিরিয়ে আনা হয়েছে"); }}} style={S.btn(false)}>🔄 ডিফল্টে ফিরুন</button>
              <button onClick={() => showToast("পরিবর্তন সংরক্ষিত হয়েছে ✅")} style={S.btn(true)}>💾 সংরক্ষণ নিশ্চিত করুন</button>
            </div>
          </div>
        )}

        {/* ===== ADMIN PANEL ===== */}
        {tab === "admin" && isAdmin(user) && (() => {
          const allUsers = getUsers();
          const admins = getAdmins();

          return (
            <div>
              <h2 style={S.sectionTitle}>🛡️ অ্যাডমিন প্যানেল</h2>
              <p style={{ color: "#888", fontSize: 13, margin: "0 0 20px" }}>শুধুমাত্র অ্যাডমিনরা এই পেজ দেখতে পাবেন।</p>

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 28 }}>
                {[
                  { label: "মোট ইউজার", value: bn(allUsers.length), icon: "👥" },
                  { label: "মোট অ্যাডমিন", value: bn(admins.length), icon: "🛡️" },
                  { label: "মোট ট্রানজেকশন", value: bn(transactions.length), icon: "💳" },
                  { label: "সর্বমোট আয়", value: `৳${bn(sumTotal(transactions))}`, icon: "💰" },
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

      {/* ===== ADD SERVICE MODAL ===== */}
      {editService && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "28px 24px", width: "100%", maxWidth: 380, border: "2px solid #1a1a1a", boxShadow: "6px 6px 0 #1a1a1a" }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 17, fontWeight: 700 }}>সেবা যোগ করুন</h3>
            {[
              { label: "সেবার নাম", type: "text", val: editName, set: setEditName },
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
              <button onClick={confirmAdd} style={{ ...S.btn(true), flex: 1 }}>✅ যোগ করুন</button>
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
