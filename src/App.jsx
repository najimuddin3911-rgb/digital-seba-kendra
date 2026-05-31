import { useState, useEffect } from "react";

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

const ISLAMIC_REFS = [
  {
    type: "আয়াত",
    arabic: "وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا",
    bangla: "আল্লাহ ব্যবসাকে হালাল করেছেন এবং সুদকে হারাম করেছেন।",
    source: "সূরা আল-বাকারা: ২৭৫",
    color: "#1a4a2e",
    bg: "#e8f5ee",
  },
  {
    type: "হাদিস",
    arabic: "التَّاجِرُ الصَّدُوقُ الأَمِينُ مَعَ النَّبِيِّينَ وَالصِّدِّيقِينَ وَالشُّهَدَاءِ",
    bangla: "সত্যবাদী ও বিশ্বস্ত ব্যবসায়ী কিয়ামতের দিন নবী, সিদ্দিক ও শহিদদের সাথে থাকবে।",
    source: "তিরমিযি: ১২০৯",
    color: "#3d2a00",
    bg: "#fff8e1",
  },
  {
    type: "আয়াত",
    arabic: "يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَأْكُلُوا أَمْوَالَكُم بَيْنَكُم بِالْبَاطِلِ إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ مِّنكُمْ",
    bangla: "হে মুমিনগণ! তোমরা একে অপরের সম্পদ অন্যায়ভাবে ভোগ করো না, তবে পরস্পর সম্মতিক্রমে ব্যবসার মাধ্যমে হলে ভিন্ন কথা।",
    source: "সূরা আন-নিসা: ২৯",
    color: "#1a2a4a",
    bg: "#e8eef8",
  },
  {
    type: "হাদিস",
    arabic: "مَا أَكَلَ أَحَدٌ طَعَامًا قَطُّ خَيْرًا مِنْ أَنْ يَأْكُلَ مِنْ عَمَلِ يَدِهِ",
    bangla: "কেউ নিজের হাতের কাজের উপার্জন থেকে যে খাবার খায়, তার চেয়ে উত্তম কোনো খাবার নেই।",
    source: "বুখারি: ২০৭২",
    color: "#2a1a4a",
    bg: "#f0eef8",
  },
  {
    type: "আয়াত",
    arabic: "وَلَا تَبْخَسُوا النَّاسَ أَشْيَاءَهُمْ",
    bangla: "মানুষকে তাদের প্রাপ্য জিনিস কম দিও না।",
    source: "সূরা আশ-শু'আরা: ১৮৩",
    color: "#4a1a1a",
    bg: "#f8eee8",
  },
  {
    type: "হাদিস",
    arabic: "البَيِّعَانِ بِالخِيَارِ مَا لَمْ يَتَفَرَّقَا، فَإِنْ صَدَقَا وَبَيَّنَا بُورِكَ لَهُمَا",
    bangla: "ক্রেতা-বিক্রেতা বিচ্ছিন্ন না হওয়া পর্যন্ত উভয়েরই ক্রয়-বিক্রয় বাতিল করার অধিকার থাকে। যদি উভয়ে সৎ থাকে ও সব বিষয় খোলাখুলি বলে, তাদের ব্যবসায় বরকত দেওয়া হয়।",
    source: "বুখারি: ২০৭৯",
    color: "#1a3a1a",
    bg: "#eaf5ea",
  },
];

function getTodayKey() { return new Date().toISOString().split("T")[0]; }
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" });
}
function getWeekKey(dateStr) {
  const d = new Date(dateStr);
  const sunday = new Date(d);
  sunday.setDate(d.getDate() - d.getDay());
  return sunday.toISOString().split("T")[0];
}
function getMonthKey(dateStr) { return dateStr.slice(0, 7); }
function getYearKey(dateStr) { return dateStr.slice(0, 4); }
function bn(n) { return Number(n).toLocaleString("bn-BD"); }

const STORAGE_KEY = "shop_transactions";
const USER_KEY = "shop_user";
const SERVICES_KEY = "shop_services";

// ─── Google OAuth helper ─────────────────────────────────────────────────────
// We use Google's Identity Services (GSI) popup flow.
// Replace GOOGLE_CLIENT_ID with your actual OAuth 2.0 Client ID from
// https://console.cloud.google.com  (Authorized JS origins: your domain)
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

function parseJwt(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch { return null; }
}

export default function App() {
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
  const [editService, setEditService] = useState(null);
  const [editQty, setEditQty] = useState(1);
  const [editPrice, setEditPrice] = useState("");
  const [editName, setEditName] = useState("");
  const [toast, setToast] = useState("");
  const [reportPeriod, setReportPeriod] = useState("day");
  const [reportDate, setReportDate] = useState(getTodayKey());
  const [profileEdit, setProfileEdit] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [gsiLoaded, setGsiLoaded] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Load Google GSI script
  useEffect(() => {
    if (document.getElementById("gsi-script")) { setGsiLoaded(true); return; }
    const script = document.createElement("script");
    script.id = "gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setGsiLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Initialize Google One Tap / button after GSI loads (only when not logged in)
  useEffect(() => {
    if (!gsiLoaded || user) return;
    if (!window.google) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
      auto_select: false,
      cancel_on_tap_outside: true,
    });
    window.google.accounts.id.renderButton(
      document.getElementById("g-signin-btn"),
      { theme: "outline", size: "large", width: 280, text: "signin_with", locale: "bn" }
    );
    window.google.accounts.id.prompt();
  }, [gsiLoaded, user]);

  function handleGoogleCredential(response) {
    setLoginLoading(true);
    const payload = parseJwt(response.credential);
    if (!payload) { showToast("❌ লগইন ব্যর্থ হয়েছে"); setLoginLoading(false); return; }

    // Load saved profile extras (name override, phone, address etc.)
    const savedProfiles = (() => {
      try { return JSON.parse(localStorage.getItem("shop_profiles")) || {}; } catch { return {}; }
    })();
    const extra = savedProfiles[payload.email] || {};

    const newUser = {
      email: payload.email,
      name: extra.name || payload.name,
      picture: payload.picture,
      phone: extra.phone || "",
      address: extra.address || "",
      shopName: extra.shopName || "ডিজিটাল সেবা কেন্দ্র",
    };
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setUser(newUser);
    setLoginLoading(false);
    showToast(`✅ স্বাগতম, ${newUser.name}!`);
  }

  function handleLogout() {
    if (window.google) window.google.accounts.id.disableAutoSelect();
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setTab("dashboard");
  }

  function saveProfile() {
    const updated = { ...user, ...profileForm };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    // Save extras keyed by email so they survive re-logins
    const savedProfiles = (() => {
      try { return JSON.parse(localStorage.getItem("shop_profiles")) || {}; } catch { return {}; }
    })();
    savedProfiles[user.email] = {
      name: profileForm.name || user.name,
      phone: profileForm.phone || user.phone,
      address: profileForm.address || user.address,
      shopName: profileForm.shopName || user.shopName,
    };
    localStorage.setItem("shop_profiles", JSON.stringify(savedProfiles));
    setUser(updated);
    setProfileEdit(false);
    showToast("✅ প্রোফাইল সংরক্ষিত হয়েছে");
  }

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem(SERVICES_KEY, JSON.stringify(services)); }, [services]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  }

  function addService(svc) {
    setEditService(svc); setEditQty(1);
    setEditPrice(String(svc.price)); setEditName(svc.name);
  }

  function confirmAdd() {
    const qty = parseInt(editQty) || 1;
    const price = parseFloat(editPrice) || 0;
    const tx = { id: Date.now(), date: getTodayKey(), serviceId: editService.id, serviceName: editName, qty, price, total: qty * price };
    setTransactions(prev => [...prev, tx]);
    setEditService(null);
    showToast(`✅ "${editName}" যোগ হয়েছে`);
  }

  function getFiltered(period, dateKey) {
    return transactions.filter(tx => {
      if (period === "day") return tx.date === dateKey;
      if (period === "week") return getWeekKey(tx.date) === dateKey;
      if (period === "month") return getMonthKey(tx.date) === dateKey;
      if (period === "year") return getYearKey(tx.date) === dateKey;
      return false;
    });
  }

  function groupTransactions(txs) {
    const map = {};
    txs.forEach(tx => {
      if (!map[tx.serviceName]) map[tx.serviceName] = { name: tx.serviceName, qty: 0, total: 0, price: tx.price };
      map[tx.serviceName].qty += tx.qty;
      map[tx.serviceName].total += tx.total;
    });
    return Object.values(map);
  }

  function printInvoice(period, dateKey) {
    const txs = getFiltered(period, dateKey);
    const grouped = groupTransactions(txs);
    const total = grouped.reduce((s, r) => s + r.total, 0);
    const periodLabel = { day: "দৈনিক", week: "সাপ্তাহিক", month: "মাসিক", year: "বার্ষিক" }[period];
    const dateLabel = period === "day" ? formatDate(dateKey)
      : period === "week" ? `সপ্তাহ: ${formatDate(dateKey)} থেকে`
      : period === "month" ? dateKey.replace("-", " সাল - মাস ")
      : dateKey + " সাল";
    const shopName = user?.shopName || "ডিজিটাল সেবা কেন্দ্র";
    const ownerName = user?.name || "";
    const w = window.open("", "_blank");
    w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>${periodLabel} ইনভয়েস</title>
<link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  body{font-family:'Hind Siliguri',sans-serif;margin:0;padding:28px;color:#1a1a1a;background:#fff}
  .header{text-align:center;border-bottom:3px solid #1a1a1a;padding-bottom:16px;margin-bottom:20px}
  .header h1{font-size:26px;margin:0 0 4px}.header p{margin:2px 0;font-size:13px;color:#555}
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
  <h1>🏪 ${shopName}</h1>
  ${ownerName ? `<p>পরিচালক: ${ownerName}</p>` : ""}
  <p>সকল সরকারি ও ডিজিটাল সেবা এক জায়গায়</p>
  <span class="badge">${periodLabel} ইনভয়েস — ${dateLabel}</span>
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

  const reportKey = (() => {
    if (reportPeriod === "day") return reportDate;
    if (reportPeriod === "week") return getWeekKey(reportDate);
    if (reportPeriod === "month") return getMonthKey(reportDate);
    return getYearKey(reportDate);
  })();
  const reportTxs = getFiltered(reportPeriod, reportKey);
  const reportGrouped = groupTransactions(reportTxs);
  const reportTotal = reportGrouped.reduce((s, r) => s + r.total, 0);
  const todayTxs = getFiltered("day", getTodayKey());
  const todayTotal = todayTxs.reduce((s, t) => s + t.total, 0);
  const monthTotal = getFiltered("month", getMonthKey(getTodayKey())).reduce((s, t) => s + t.total, 0);
  const yearTotal = getFiltered("year", getYearKey(getTodayKey())).reduce((s, t) => s + t.total, 0);

  const navItems = [
    { key: "dashboard", label: "ড্যাশবোর্ড", icon: "📊" },
    { key: "services", label: "সেবা যোগ", icon: "➕" },
    { key: "report", label: "রিপোর্ট", icon: "📋" },
    { key: "manage", label: "সেবা সম্পাদনা", icon: "⚙️" },
    { key: "islamic", label: "কোরআন ও হাদিস", icon: "📖" },
    { key: "profile", label: "প্রোফাইল", icon: "👤" },
  ];

  const S = {
    page: { minHeight: "100vh", background: "#f5f0e8", fontFamily: "'Hind Siliguri', sans-serif" },
    header: { background: "#1a1a1a", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, position: "sticky", top: 0, zIndex: 100 },
    nav: { background: "#fff", borderBottom: "2px solid #e8e2d6", display: "flex", padding: "0 16px", overflowX: "auto" },
    content: { maxWidth: 900, margin: "0 auto", padding: "24px 16px" },
    btn: (active) => ({ padding: "10px 20px", border: "2px solid #1a1a1a", borderRadius: 8, background: active ? "#1a1a1a" : "#fff", color: active ? "#f5f0e8" : "#1a1a1a", fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "inherit" }),
    input: { width: "100%", padding: "10px 12px", border: "1.5px solid #ddd", borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { padding: "11px 14px", color: "#f5f0e8", textAlign: "left", fontSize: 13, fontWeight: 600, background: "#1a1a1a" },
    td: (i) => ({ padding: "10px 14px", fontSize: 13, background: i % 2 === 0 ? "#fff" : "#faf8f4" }),
  };

  // ── LOGIN SCREEN ─────────────────────────────────────────────────────────────
  if (!user) return (
    <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap');
        .g-btn-wrap { display:flex; justify-content:center; margin-top:8px; }
        .g-btn-wrap > div { border-radius:8px!important; overflow:hidden; }
        .login-card { animation: fadeUp .4s ease; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
      <div className="login-card" style={{ background: "#fff", borderRadius: 20, boxShadow: "0 8px 48px rgba(0,0,0,0.14)", padding: "44px 36px", width: "100%", maxWidth: 380, border: "2px solid #1a1a1a" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 52, marginBottom: 10 }}>🏪</div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>ডিজিটাল সেবা কেন্দ্র</h2>
          <p style={{ color: "#888", fontSize: 13, margin: "6px 0 0" }}>আপনার সেবা ট্র্যাকার সিস্টেম</p>
        </div>

        <div style={{ background: "#f5f0e8", borderRadius: 12, padding: "20px", textAlign: "center", marginBottom: 24 }}>
          <p style={{ margin: "0 0 4px", fontSize: 13, color: "#555", fontWeight: 600 }}>নিরাপদ লগইনের জন্য</p>
          <p style={{ margin: 0, fontSize: 12, color: "#888" }}>আপনার জিমেইল অ্যাকাউন্ট ব্যবহার করুন</p>
        </div>

        <div className="g-btn-wrap">
          <div id="g-signin-btn"></div>
        </div>

        {loginLoading && (
          <p style={{ textAlign: "center", color: "#888", fontSize: 13, marginTop: 16 }}>লগইন হচ্ছে...</p>
        )}

        {GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com" && (
          <div style={{ background: "#fff3cd", border: "1.5px solid #ffc107", borderRadius: 10, padding: "12px 14px", marginTop: 20, fontSize: 12, color: "#856404" }}>
            ⚠️ <strong>ডেভেলপার নোট:</strong> App.jsx-এ <code>GOOGLE_CLIENT_ID</code> ভেরিয়েবলে আপনার Google OAuth Client ID বসান। Google Cloud Console থেকে তৈরি করুন।
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: 12, color: "#aaa", marginTop: 20 }}>
          🔒 জিমেইল দিয়ে লগইন করলে আপনার ডেটা সুরক্ষিত থাকবে
        </p>
      </div>
    </div>
  );

  // ── MAIN APP ─────────────────────────────────────────────────────────────────
  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap');
        .svc-btn:hover{background:#1a1a1a!important;color:#f5f0e8!important;transform:translateY(-2px)}
        .nav-tab{transition:all .2s;white-space:nowrap}
        .nav-tab:hover{background:#f5f0e8!important}
        *{box-sizing:border-box}
        .islamic-card{transition:transform .2s,box-shadow .2s}
        .islamic-card:hover{transform:translateY(-3px);box-shadow:6px 6px 0 #1a1a1a!important}
        .profile-input:focus{border-color:#1a1a1a!important;box-shadow:0 0 0 3px rgba(26,26,26,.08)}
      `}</style>

      {/* HEADER */}
      <div style={S.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>🏪</span>
          <span style={{ color: "#f5f0e8", fontWeight: 700, fontSize: 16 }}>{user.shopName || "ডিজিটাল সেবা কেন্দ্র"}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {user.picture && (
            <img src={user.picture} alt="profile" referrerPolicy="no-referrer"
              style={{ width: 34, height: 34, borderRadius: "50%", border: "2px solid #f5f0e8", cursor: "pointer" }}
              onClick={() => setTab("profile")} />
          )}
          <button onClick={handleLogout}
            style={{ background: "transparent", border: "1.5px solid rgba(245,240,232,.3)", color: "#f5f0e8", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "inherit", fontWeight: 600 }}>
            লগআউট
          </button>
        </div>
      </div>

      {/* NAV */}
      <div style={S.nav}>
        {navItems.map(({ key, label, icon }) => (
          <button key={key} className="nav-tab" onClick={() => setTab(key)}
            style={{ background: "none", border: "none", padding: "14px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: tab === key ? 700 : 500, color: tab === key ? "#1a1a1a" : "#888", borderBottom: tab === key ? "3px solid #1a1a1a" : "3px solid transparent" }}>
            {icon} {label}
          </button>
        ))}
      </div>

      <div style={S.content}>

        {/* ── DASHBOARD ── */}
        {tab === "dashboard" && (
          <div>
            <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 700 }}>📊 আজকের সারসংক্ষেপ</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 14, marginBottom: 28 }}>
              {[
                { label: "আজকের আয়", value: `৳${bn(todayTotal)}`, sub: `${todayTxs.length} টি এন্ট্রি`, dark: true },
                { label: "মাসিক আয়", value: `৳${bn(monthTotal)}`, sub: getMonthKey(getTodayKey()), dark: false },
                { label: "বার্ষিক আয়", value: `৳${bn(yearTotal)}`, sub: getYearKey(getTodayKey()) + " সাল", dark: false },
              ].map((s, i) => (
                <div key={i} style={{ background: s.dark ? "#1a1a1a" : "#fff", border: "2px solid #1a1a1a", borderRadius: 14, padding: "20px", boxShadow: "4px 4px 0 #1a1a1a" }}>
                  <p style={{ margin: "0 0 6px", fontSize: 13, color: s.dark ? "#aaa" : "#888" }}>{s.label}</p>
                  <p style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 700, color: s.dark ? "#f5f0e8" : "#1a1a1a" }}>{s.value}</p>
                  <p style={{ margin: 0, fontSize: 12, color: s.dark ? "#666" : "#bbb" }}>{s.sub}</p>
                </div>
              ))}
            </div>
            <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 700 }}>আজকের এন্ট্রি</h3>
            {todayTxs.length === 0
              ? <div style={{ background: "#fff", border: "2px dashed #ddd", borderRadius: 12, padding: "36px", textAlign: "center", color: "#aaa" }}>আজ কোনো সেবা যোগ করা হয়নি</div>
              : <div style={{ background: "#fff", border: "2px solid #1a1a1a", borderRadius: 12, overflow: "hidden" }}>
                  <table style={S.table}>
                    <thead><tr>{["সময়", "সেবার নাম", "সংখ্যা", "মূল্য", "মোট"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
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
              <button onClick={() => printInvoice("day", getTodayKey())} style={{ ...S.btn(true), marginTop: 14 }}>
                🖨️ আজকের ইনভয়েস প্রিন্ট করুন
              </button>
            )}
          </div>
        )}

        {/* ── SERVICES ── */}
        {tab === "services" && (
          <div>
            <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700 }}>➕ সেবা যোগ করুন</h2>
            <p style={{ color: "#888", fontSize: 13, margin: "0 0 20px" }}>যেকোনো সেবার বাটনে ক্লিক করুন, দাম/পরিমাণ ঠিক করে যোগ করুন।</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 12 }}>
              {services.map(svc => (
                <button key={svc.id} className="svc-btn" onClick={() => addService(svc)}
                  style={{ background: "#fff", border: "2px solid #1a1a1a", borderRadius: 12, padding: "16px 14px", cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "all .2s", boxShadow: "3px 3px 0 #1a1a1a" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 6, lineHeight: 1.4 }}>{svc.name}</div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>৳{bn(svc.price)}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── REPORT ── */}
        {tab === "report" && (
          <div>
            <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 700 }}>📋 রিপোর্ট ও হিসাব</h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {[["day","দৈনিক"],["week","সাপ্তাহিক"],["month","মাসিক"],["year","বার্ষিক"]].map(([k,l]) => (
                <button key={k} onClick={() => setReportPeriod(k)} style={{ ...S.btn(reportPeriod === k), borderRadius: 20, padding: "8px 18px" }}>{l}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
              <input type="date" value={reportDate} onChange={e => setReportDate(e.target.value)}
                style={{ padding: "9px 14px", border: "2px solid #1a1a1a", borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none" }} />
            </div>
            {reportGrouped.length === 0
              ? <div style={{ background: "#fff", border: "2px dashed #ddd", borderRadius: 12, padding: "40px", textAlign: "center", color: "#aaa" }}>এই সময়ের জন্য কোনো ডেটা নেই</div>
              : <>
                  <div style={{ background: "#fff", border: "2px solid #1a1a1a", borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
                    <table style={S.table}>
                      <thead><tr>{["ক্রমিক","সেবার নাম","সংখ্যা","একক মূল্য","মোট"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                      <tbody>
                        {reportGrouped.map((r, i) => (
                          <tr key={i}>
                            <td style={S.td(i)}>{bn(i+1)}</td>
                            <td style={S.td(i)}>{r.name}</td>
                            <td style={S.td(i)}>{bn(r.qty)}</td>
                            <td style={S.td(i)}>৳{bn(r.price)}</td>
                            <td style={{ ...S.td(i), fontWeight: 600 }}>৳{bn(r.total)}</td>
                          </tr>
                        ))}
                        <tr style={{ borderTop: "2px solid #1a1a1a" }}>
                          <td colSpan={4} style={{ padding: "12px 14px", fontWeight: 700, fontSize: 14, background: "#f5f0e8" }}>মোট আয়</td>
                          <td style={{ padding: "12px 14px", fontWeight: 700, fontSize: 16, background: "#f5f0e8" }}>৳{bn(reportTotal)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <button onClick={() => printInvoice(reportPeriod, reportKey)} style={S.btn(true)}>
                    🖨️ ইনভয়েস প্রিন্ট / PDF করুন
                  </button>
                </>
            }
          </div>
        )}

        {/* ── MANAGE ── */}
        {tab === "manage" && (
          <div>
            <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700 }}>⚙️ সেবা সম্পাদনা করুন</h2>
            <p style={{ color: "#888", fontSize: 13, margin: "0 0 20px" }}>সেবার নাম বা মূল্য পরিবর্তন করুন।</p>
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
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={() => { setServices(DEFAULT_SERVICES); showToast("ডিফল্টে ফিরিয়ে আনা হয়েছে"); }} style={S.btn(false)}>🔄 ডিফল্টে ফিরুন</button>
              <button onClick={() => showToast("পরিবর্তন সংরক্ষিত হয়েছে ✅")} style={S.btn(true)}>💾 সংরক্ষণ করুন</button>
            </div>
          </div>
        )}

        {/* ── ISLAMIC ── */}
        {tab === "islamic" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 42 }}>📖</div>
              <h2 style={{ margin: "8px 0 4px", fontSize: 22, fontWeight: 700 }}>কোরআন ও হাদিস</h2>
              <p style={{ color: "#888", fontSize: 14, margin: 0 }}>ব্যবসা-বাণিজ্য সম্পর্কিত ইসলামিক নির্দেশনা</p>
            </div>

            <div style={{ display: "grid", gap: 18 }}>
              {ISLAMIC_REFS.map((ref, i) => (
                <div key={i} className="islamic-card"
                  style={{ background: ref.bg, border: `2px solid ${ref.color}`, borderRadius: 16, padding: "22px 24px", boxShadow: `4px 4px 0 ${ref.color}` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <span style={{ background: ref.color, color: "#fff", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>
                      {ref.type === "আয়াত" ? "📗 আল-কোরআন" : "📜 হাদিস"}
                    </span>
                    <span style={{ fontSize: 12, color: ref.color, fontWeight: 600 }}>{ref.source}</span>
                  </div>
                  <p style={{ fontSize: 20, lineHeight: 1.9, textAlign: "right", direction: "rtl", margin: "0 0 14px", color: ref.color, fontWeight: 600 }}>
                    {ref.arabic}
                  </p>
                  <div style={{ height: 1, background: ref.color, opacity: 0.2, margin: "12px 0" }} />
                  <p style={{ fontSize: 15, lineHeight: 1.8, color: "#333", margin: 0, fontWeight: 500 }}>
                    {ref.bangla}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ background: "#1a1a1a", borderRadius: 14, padding: "22px 24px", marginTop: 24, textAlign: "center" }}>
              <p style={{ color: "#f5f0e8", fontSize: 18, margin: "0 0 8px", lineHeight: 1.8 }}>
                بَارَكَ اللَّهُ لَكَ فِي صَفْقَتِكَ
              </p>
              <p style={{ color: "#aaa", fontSize: 13, margin: 0 }}>আল্লাহ আপনার ব্যবসায় বরকত দান করুন।</p>
            </div>
          </div>
        )}

        {/* ── PROFILE ── */}
        {tab === "profile" && (
          <div>
            <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 700 }}>👤 আমার প্রোফাইল</h2>

            {/* Profile Card */}
            <div style={{ background: "#fff", border: "2px solid #1a1a1a", borderRadius: 16, padding: "28px 24px", boxShadow: "4px 4px 0 #1a1a1a", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 24 }}>
                {user.picture
                  ? <img src={user.picture} alt="avatar" referrerPolicy="no-referrer"
                      style={{ width: 72, height: 72, borderRadius: "50%", border: "3px solid #1a1a1a" }} />
                  : <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>👤</div>
                }
                <div>
                  <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700 }}>{user.name}</h3>
                  <p style={{ margin: "0 0 2px", fontSize: 13, color: "#888" }}>📧 {user.email}</p>
                  <span style={{ fontSize: 11, background: "#e8f5ee", color: "#1a4a2e", padding: "2px 10px", borderRadius: 20, fontWeight: 600 }}>✅ Google দিয়ে যাচাইকৃত</span>
                </div>
              </div>

              {!profileEdit ? (
                <>
                  {[
                    { label: "দোকানের নাম", value: user.shopName, icon: "🏪" },
                    { label: "মোবাইল নম্বর", value: user.phone || "—", icon: "📱" },
                    { label: "ঠিকানা", value: user.address || "—", icon: "📍" },
                  ].map(f => (
                    <div key={f.label} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: "1px solid #f0ede8" }}>
                      <span style={{ fontSize: 18, minWidth: 28 }}>{f.icon}</span>
                      <div>
                        <p style={{ margin: "0 0 2px", fontSize: 12, color: "#aaa" }}>{f.label}</p>
                        <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{f.value}</p>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => { setProfileEdit(true); setProfileForm({ name: user.name, phone: user.phone || "", address: user.address || "", shopName: user.shopName || "" }); }}
                    style={{ ...S.btn(true), marginTop: 20, width: "100%" }}>
                    ✏️ প্রোফাইল সম্পাদনা করুন
                  </button>
                </>
              ) : (
                <>
                  {[
                    { label: "আপনার নাম", key: "name", type: "text", placeholder: "আপনার পুরো নাম" },
                    { label: "দোকানের নাম", key: "shopName", type: "text", placeholder: "ডিজিটাল সেবা কেন্দ্র" },
                    { label: "মোবাইল নম্বর", key: "phone", type: "tel", placeholder: "01XXXXXXXXX" },
                    { label: "ঠিকানা", key: "address", type: "text", placeholder: "গ্রাম, উপজেলা, জেলা" },
                  ].map(f => (
                    <div key={f.key} style={{ marginBottom: 14 }}>
                      <label style={{ display: "block", fontSize: 13, color: "#555", marginBottom: 5, fontWeight: 600 }}>{f.label}</label>
                      <input className="profile-input" type={f.type} placeholder={f.placeholder} value={profileForm[f.key] || ""}
                        onChange={e => setProfileForm(p => ({ ...p, [f.key]: e.target.value }))}
                        style={{ ...S.input, transition: "border-color .2s, box-shadow .2s" }} />
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                    <button onClick={() => setProfileEdit(false)} style={{ ...S.btn(false), flex: 1 }}>বাতিল</button>
                    <button onClick={saveProfile} style={{ ...S.btn(true), flex: 1 }}>💾 সংরক্ষণ করুন</button>
                  </div>
                </>
              )}
            </div>

            {/* Account Info */}
            <div style={{ background: "#f5f0e8", border: "2px solid #ddd", borderRadius: 12, padding: "16px 20px" }}>
              <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: "#555" }}>অ্যাকাউন্ট তথ্য</p>
              <p style={{ margin: "0 0 4px", fontSize: 13, color: "#888" }}>🔐 লগইন পদ্ধতি: Google OAuth 2.0</p>
              <p style={{ margin: 0, fontSize: 13, color: "#888" }}>📊 মোট লেনদেন: {bn(transactions.length)} টি</p>
            </div>
          </div>
        )}

      </div>

      {/* Add Service Modal */}
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
