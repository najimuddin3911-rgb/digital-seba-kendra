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

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" });
}
function getWeekKey(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDay();
  const sunday = new Date(d);
  sunday.setDate(d.getDate() - day);
  return sunday.toISOString().split("T")[0];
}
function getMonthKey(dateStr) { return dateStr.slice(0, 7); }
function getYearKey(dateStr) { return dateStr.slice(0, 4); }
function bn(n) { return Number(n).toLocaleString("bn-BD"); }

const STORAGE_KEY = "shop_transactions";
const USER_KEY = "shop_user";
const USERS_KEY = "shop_users";
const SERVICES_KEY = "shop_services";

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
  const [loginForm, setLoginForm] = useState({ contact: "", pass: "" });
  const [loginMode, setLoginMode] = useState("login");
  const [loginError, setLoginError] = useState("");
  const [editService, setEditService] = useState(null);
  const [editQty, setEditQty] = useState(1);
  const [editPrice, setEditPrice] = useState("");
  const [editName, setEditName] = useState("");
  const [toast, setToast] = useState("");
  const [reportPeriod, setReportPeriod] = useState("day");
  const [reportDate, setReportDate] = useState(getTodayKey());

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem(SERVICES_KEY, JSON.stringify(services)); }, [services]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  function getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch { return []; }
  }

  function handleAuth(e) {
    e.preventDefault();
    const users = getUsers();
    if (loginMode === "register") {
      if (users.find(u => u.contact === loginForm.contact)) {
        setLoginError("এই ইমেইল/নম্বর দিয়ে আগেই অ্যাকাউন্ট আছে।");
        return;
      }
      const newUser = { contact: loginForm.contact, pass: loginForm.pass };
      localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      setUser(newUser);
    } else {
      const found = users.find(u => u.contact === loginForm.contact && u.pass === loginForm.pass);
      if (!found) { setLoginError("ইমেইল/নম্বর বা পাসওয়ার্ড ভুল।"); return; }
      localStorage.setItem(USER_KEY, JSON.stringify(found));
      setUser(found);
    }
    setLoginError("");
  }

  function handleLogout() {
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }

  function addService(svc) {
    setEditService(svc);
    setEditQty(1);
    setEditPrice(String(svc.price));
    setEditName(svc.name);
  }

  function confirmAdd() {
    const qty = parseInt(editQty) || 1;
    const price = parseFloat(editPrice) || 0;
    const tx = {
      id: Date.now(),
      date: getTodayKey(),
      serviceId: editService.id,
      serviceName: editName,
      qty,
      price,
      total: qty * price,
    };
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

    const w = window.open("", "_blank");
    w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>${periodLabel} ইনভয়েস</title>
<link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  body{font-family:'Hind Siliguri',sans-serif;margin:0;padding:28px;color:#1a1a1a;background:#fff}
  .header{text-align:center;border-bottom:3px solid #1a1a1a;padding-bottom:16px;margin-bottom:20px}
  .header h1{font-size:26px;margin:0 0 4px}
  .header p{margin:2px 0;font-size:13px;color:#555}
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
  ];

  const S = {
    page: { minHeight: "100vh", background: "#f5f0e8", fontFamily: "'Hind Siliguri', sans-serif" },
    header: { background: "#1a1a1a", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, position: "sticky", top: 0, zIndex: 100 },
    nav: { background: "#fff", borderBottom: "2px solid #e8e2d6", display: "flex", padding: "0 16px", overflowX: "auto" },
    content: { maxWidth: 900, margin: "0 auto", padding: "24px 16px" },
    card: { background: "#fff", border: "2px solid #1a1a1a", borderRadius: 14, padding: "20px 22px", boxShadow: "4px 4px 0 #1a1a1a" },
    btn: (active) => ({ padding: "10px 20px", border: "2px solid #1a1a1a", borderRadius: 8, background: active ? "#1a1a1a" : "#fff", color: active ? "#f5f0e8" : "#1a1a1a", fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "inherit" }),
    input: { width: "100%", padding: "10px 12px", border: "1.5px solid #ddd", borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { padding: "11px 14px", color: "#f5f0e8", textAlign: "left", fontSize: 13, fontWeight: 600, background: "#1a1a1a" },
    td: (i) => ({ padding: "10px 14px", fontSize: 13, background: i % 2 === 0 ? "#fff" : "#faf8f4" }),
  };

  if (!user) return (
    <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 8px 40px rgba(0,0,0,0.12)", padding: "40px 36px", width: "100%", maxWidth: 360, border: "2px solid #1a1a1a" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🏪</div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>ডিজিটাল সেবা কেন্দ্র</h2>
          <p style={{ color: "#888", fontSize: 13, margin: "4px 0 0" }}>আপনার সেবা ট্র্যাকার</p>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {["login", "register"].map(m => (
            <button key={m} onClick={() => { setLoginMode(m); setLoginError(""); }}
              style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "2px solid #1a1a1a", background: loginMode === m ? "#1a1a1a" : "#fff", color: loginMode === m ? "#f5f0e8" : "#1a1a1a", fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>
              {m === "login" ? "লগইন" : "নিবন্ধন"}
            </button>
          ))}
        </div>
        <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input type="text" placeholder="জিমেইল বা মোবাইল নম্বর" value={loginForm.contact}
            onChange={e => setLoginForm(f => ({ ...f, contact: e.target.value }))} required style={S.input} />
          <input type="password" placeholder="পাসওয়ার্ড" value={loginForm.pass}
            onChange={e => setLoginForm(f => ({ ...f, pass: e.target.value }))} required style={S.input} />
          {loginError && <p style={{ color: "#c0392b", fontSize: 13, textAlign: "center", margin: 0 }}>{loginError}</p>}
          <button type="submit" style={{ ...S.btn(true), width: "100%", padding: "12px 0", fontSize: 15 }}>
            {loginMode === "login" ? "লগইন করুন" : "অ্যাকাউন্ট তৈরি করুন"}
          </button>
        </form>
        <p style={{ textAlign: "center", fontSize: 12, color: "#aaa", marginTop: 14 }}>বিনামূল্যে অ্যাকাউন্ট তৈরি করুন ✅</p>
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      <style>{`
        .svc-btn:hover{background:#1a1a1a!important;color:#f5f0e8!important;transform:translateY(-2px)}
        .nav-tab{transition:all .2s}
        .nav-tab:hover{background:#f5f0e8!important;color:#1a1a1a!important}
        *{box-sizing:border-box}
      `}</style>

      {/* Header */}
      <div style={S.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>🏪</span>
          <span style={{ color: "#f5f0e8", fontWeight: 700, fontSize: 17 }}>ডিজিটাল সেবা কেন্দ্র</span>
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
            style={{ padding: "12px 16px", border: "none", background: tab === n.key ? "#f5f0e8" : "transparent", color: tab === n.key ? "#1a1a1a" : "#666", fontWeight: tab === n.key ? 700 : 500, cursor: "pointer", fontSize: 14, fontFamily: "inherit", borderBottom: tab === n.key ? "3px solid #1a1a1a" : "3px solid transparent", whiteSpace: "nowrap" }}>
            {n.icon} {n.label}
          </button>
        ))}
      </div>

      <div style={S.content}>

        {/* DASHBOARD */}
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

        {/* SERVICES */}
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

        {/* REPORT */}
        {tab === "report" && (
          <div>
            <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 700 }}>📋 রিপোর্ট ও হিসাব</h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {[["day","দৈনিক"],["week","সাপ্তাহিক"],["month","মাসিক"],["year","বার্ষিক"]].map(([k,l]) => (
                <button key={k} onClick={() => setReportPeriod(k)} style={{ ...S.btn(reportPeriod === k), borderRadius: 20, padding: "8px 18px" }}>{l}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
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

        {/* MANAGE */}
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
