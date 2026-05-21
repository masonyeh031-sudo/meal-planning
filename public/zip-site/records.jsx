// Diet records page — week tab (rolling 7-day) + history view (30 days) + exports.

const { DAYS, MEALS, FOOD_GROUPS: FG3, todayDate, GOAL_OPTIONS: GO3, recommendedCalories: rc3,
  nutritionFromServings: nfs3, buildRecommendation: br3 } = window;

const CAT_OPTIONS = FG3.map((g) => ({ id: g.id, label: g.label, short: g.short, hue: g.hue }));
const CAT_CAL_PER_SERVING = { grains: 70, protein: 75, dairy: 150, vegetables: 25, fruits: 60, fats: 45 };
const STORAGE_KEY = "nutrition.records";
const LEGACY_KEY = "nutrition.week";

function emptyMeals() { return { breakfast: [], lunch: [], dinner: [], snack: [] }; }
function uid() { return Math.random().toString(36).slice(2, 9); }

// ── Storage with migration from old fixed-week format ──────────────
function loadRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  // Try migrate legacy week array
  try {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const arr = JSON.parse(legacy);
      const obj = {};
      for (const d of arr) {
        if (d && d.date) obj[d.date] = { meals: { ...emptyMeals(), ...(d.meals || {}) } };
      }
      if (Object.keys(obj).length) return obj;
    }
  } catch (e) {}
  // Seed with two days of sample today
  const seed = {};
  const today = todayDate(0);
  seed[today] = {
    meals: {
      breakfast: [
        { id: uid(), name: "燕麥粥", category: "grains", amount: 1.5, cal: 105 },
        { id: uid(), name: "水煮蛋", category: "protein", amount: 1, cal: 75 },
        { id: uid(), name: "無糖豆漿", category: "dairy", amount: 1, cal: 150 },
      ],
      lunch: [
        { id: uid(), name: "糙米飯", category: "grains", amount: 2, cal: 140 },
        { id: uid(), name: "雞胸肉", category: "protein", amount: 2, cal: 150 },
        { id: uid(), name: "炒青菜", category: "vegetables", amount: 1.5, cal: 38 },
        { id: uid(), name: "蘋果", category: "fruits", amount: 1, cal: 60 },
      ],
      dinner: [], snack: [],
    },
  };
  return seed;
}

function loadProfile3() {
  try {
    const raw = localStorage.getItem("nutrition.profile");
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

function dayTotalCal(day) {
  if (!day || !day.meals) return 0;
  return Object.values(day.meals).flat().reduce((a, e) => a + (Number(e.cal) || 0), 0);
}
function dayServingsOf(day) {
  const s = {};
  for (const g of FG3) s[g.id] = 0;
  if (!day || !day.meals) return s;
  for (const e of Object.values(day.meals).flat()) {
    if (s[e.category] === undefined) continue;
    s[e.category] += Number(e.amount) || 0;
  }
  return s;
}
function dayEntryCount(day) {
  if (!day || !day.meals) return 0;
  return Object.values(day.meals).flat().length;
}
function reachedCountOf(servings, rec) {
  if (!rec) return 0;
  return FG3.filter((g) => Math.abs(servings[g.id] - rec.recommendedServings[g.id]) < 0.5).length;
}

// Format YYYY-MM-DD → relative weekday char and short date
function dateToWeekday(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const wkIndex = (dt.getDay() + 6) % 7; // Mon=0..Sun=6
  return DAYS[wkIndex];
}

function lastNDates(n) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) out.push(todayDate(-i));
  return out;
}

// ── Export helpers ────────────────────────────────────────
function triggerDL(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
function escCsv(s) { const t = String(s ?? ""); return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t; }
function escHtml(s) { return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function fmtN(v, d = 1) { if (typeof v !== "number" || Number.isNaN(v)) return ""; return Number.isInteger(v) ? v.toString() : v.toFixed(d); }

function exportHistoryCSV(rows, target, rec) {
  const lines = [];
  lines.push(["飲食紀錄 · Diet History"].map(escCsv).join(","));
  lines.push([`產生時間,${new Date().toLocaleString("zh-Hant")}`]);
  lines.push("");
  const header = ["日期", "星期", "總熱量(kcal)", "達標(/6)", "達標狀態", ...FG3.map((g) => g.label + "(份)")];
  lines.push(header.map(escCsv).join(","));
  for (const r of rows) {
    const status = !rec ? "—" : r.reached === FG3.length ? "全達標"
      : r.reached >= 4 ? "接近達標" : r.entries === 0 ? "未紀錄" : "未達標";
    lines.push([
      r.date, "星期" + r.wk, r.kcal, rec ? `${r.reached}/6` : "—", status,
      ...FG3.map((g) => fmtN(r.servings[g.id])),
    ].map(escCsv).join(","));
  }
  const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  triggerDL(blob, `飲食紀錄-${todayDate(0)}.csv`);
}

function roundRect2(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}

function exportHistoryJPG(rows, target, rec) {
  const W = 1500, rowH = 38, headH = 260;
  const H = headH + rows.length * rowH + 120;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d");
  g.fillStyle = "#fbf6ec"; g.fillRect(0, 0, W, H);
  g.fillStyle = "#f0d4be"; g.fillRect(0, 0, W, 16);

  g.fillStyle = "#29231a"; g.font = "700 56px 'Noto Serif TC', serif";
  g.fillText("飲食紀錄總覽", 80, 110);
  g.fillStyle = "#6b5e4d"; g.font = "500 22px 'Noto Sans TC', sans-serif";
  g.fillText(`Diet History · ${rows[0].date} → ${rows[rows.length - 1].date} · 共 ${rows.length} 天`, 80, 148);
  g.fillText(`產生時間：${new Date().toLocaleString("zh-Hant")}${target ? "  ·  每日建議熱量 " + target + " kcal" : ""}`, 80, 178);

  // Column headers
  const colDate = 80, colWk = 220, colKcal = 320, colReach = 480, colBar = 640;
  const barW = W - 80 - colBar;
  g.fillStyle = "#9a8b76"; g.font = "600 14px 'Noto Sans TC', sans-serif";
  let y = headH - 26;
  g.fillText("日期", colDate, y);
  g.fillText("星期", colWk, y);
  g.fillText("熱量 kcal", colKcal, y);
  g.fillText("達標 / 6", colReach, y);
  g.fillText("六大類份數分布", colBar, y);
  g.strokeStyle = "#e3d6bb"; g.lineWidth = 1.2;
  g.beginPath(); g.moveTo(80, headH - 14); g.lineTo(W - 80, headH - 14); g.stroke();

  const hues = { grains: "#c8923a", protein: "#b85a2a", dairy: "#e8c47a", vegetables: "#4a6b32", fruits: "#8a3d3d", fats: "#9a7b3a" };

  rows.forEach((r, i) => {
    const ry = headH + i * rowH;
    if (i % 2 === 0) { g.fillStyle = "rgba(184,90,42,0.04)"; g.fillRect(60, ry - 8, W - 120, rowH); }
    g.fillStyle = "#29231a"; g.font = "600 18px 'Noto Sans TC', sans-serif";
    g.fillText(r.date, colDate, ry + 18);
    g.fillStyle = "#6b5e4d"; g.font = "500 17px 'Noto Sans TC', sans-serif";
    g.fillText("星期" + r.wk, colWk, ry + 18);
    g.fillStyle = "#29231a"; g.font = "600 18px 'Noto Serif TC', serif";
    g.fillText(String(r.kcal), colKcal, ry + 18);

    if (rec) {
      const reached = r.reached;
      const colorPill = reached === FG3.length ? "#4a6b32" : reached >= 4 ? "#c8923a" : r.entries === 0 ? "#c0b29a" : "#8a3d3d";
      g.fillStyle = colorPill; roundRect2(g, colReach, ry, 50, 26, 13); g.fill();
      g.fillStyle = "#fff"; g.font = "700 14px 'Noto Sans TC', sans-serif";
      g.fillText(`${reached}/6`, colReach + 10, ry + 18);
    } else {
      g.fillStyle = "#9a8b76"; g.font = "500 15px 'Noto Sans TC', sans-serif";
      g.fillText("—", colReach, ry + 18);
    }

    // Stacked horizontal bar of servings per category
    const totalS = FG3.reduce((a, g2) => a + r.servings[g2.id], 0);
    if (totalS > 0) {
      let x = colBar;
      g.fillStyle = "rgba(0,0,0,0.05)"; g.fillRect(colBar, ry + 4, barW, 18);
      FG3.forEach((g2) => {
        const w = (r.servings[g2.id] / totalS) * barW;
        g.fillStyle = hues[g2.id] || "#c0b29a";
        g.fillRect(x, ry + 4, w, 18);
        x += w;
      });
    } else {
      g.fillStyle = "#9a8b76"; g.font = "500 15px 'Noto Sans TC', sans-serif";
      g.fillText("未記錄", colBar, ry + 18);
    }
  });

  // Legend at bottom
  const ly = headH + rows.length * rowH + 50;
  g.fillStyle = "#9a8b76"; g.font = "600 14px 'Noto Sans TC', sans-serif";
  g.fillText("圖例", 80, ly);
  let lx = 130;
  FG3.forEach((g2) => {
    g.fillStyle = hues[g2.id]; g.fillRect(lx, ly - 12, 16, 16);
    g.fillStyle = "#29231a"; g.font = "500 14px 'Noto Sans TC', sans-serif";
    g.fillText(g2.label, lx + 22, ly + 2);
    lx += 22 + g.measureText(g2.label).width + 24;
  });

  c.toBlob((blob) => { if (blob) triggerDL(blob, `飲食紀錄-${todayDate(0)}.jpg`); }, "image/jpeg", 0.92);
}

function exportHistoryPDF(rows, target, rec) {
  const win = window.open("", "_blank");
  if (!win) { alert("瀏覽器封鎖了新視窗，請允許彈出視窗。"); return; }
  const hues = { grains: "#c8923a", protein: "#b85a2a", dairy: "#e8c47a", vegetables: "#4a6b32", fruits: "#8a3d3d", fats: "#9a7b3a" };
  const tr = rows.map((r) => {
    const totalS = FG3.reduce((a, g2) => a + r.servings[g2.id], 0);
    const bar = totalS > 0
      ? FG3.map((g2) => `<span style="display:inline-block;width:${(r.servings[g2.id] / totalS) * 100}%;height:14px;background:${hues[g2.id]}"></span>`).join("")
      : `<span style="color:#9a8b76;font-size:12px;">未記錄</span>`;
    const reach = !rec ? "—" : r.reached === FG3.length ? `<span class="pill ok">${r.reached}/6 全達標</span>`
      : r.reached >= 4 ? `<span class="pill warn">${r.reached}/6 接近</span>`
      : r.entries === 0 ? `<span class="pill mute">${r.reached}/6 未紀錄</span>`
      : `<span class="pill bad">${r.reached}/6 未達標</span>`;
    return `<tr>
      <td>${r.date}</td>
      <td>星期${r.wk}</td>
      <td class="num">${r.kcal}</td>
      <td>${reach}</td>
      <td class="bar"><div class="bar-wrap">${bar}</div></td>
    </tr>`;
  }).join("");
  const legend = FG3.map((g2) =>
    `<span class="lg"><span class="sw" style="background:${hues[g2.id]}"></span>${escHtml(g2.label)}</span>`).join("");

  const html = `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><title>飲食紀錄</title>
  <style>
    @page { size: A4 landscape; margin: 12mm; }
    * { box-sizing: border-box; }
    body { font-family: "Noto Sans TC", "PingFang TC", sans-serif; color: #29231a; margin: 0; font-size: 13px; }
    h1 { font-family: "Noto Serif TC", serif; font-size: 28px; margin: 0 0 4px; }
    .meta { color: #6b5e4d; margin-bottom: 14px; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 7px 10px; border-bottom: 1px solid #ece2cb; text-align: left; }
    th { background: #f3ead6; font-weight: 600; font-size: 12px; }
    td.num { text-align: right; font-family: "Consolas", monospace; font-weight: 600; }
    td.bar { width: 36%; }
    .bar-wrap { display: flex; width: 100%; height: 14px; background: rgba(0,0,0,0.05); border-radius: 3px; overflow: hidden; }
    .pill { display: inline-block; padding: 3px 9px; border-radius: 999px; font-size: 11px; font-weight: 600; color: #fff; }
    .pill.ok { background: #4a6b32; } .pill.warn { background: #c8923a; }
    .pill.bad { background: #8a3d3d; } .pill.mute { background: #c0b29a; }
    .legend { margin: 14px 0; display: flex; flex-wrap: wrap; gap: 14px; font-size: 12px; }
    .lg { display: inline-flex; align-items: center; gap: 6px; }
    .sw { display: inline-block; width: 14px; height: 14px; border-radius: 3px; }
    .actions { margin: 10px 0; padding: 10px 12px; background: #faf3df; border: 1px dashed #c8b89c; border-radius: 8px; font-size: 12px; color: #6b5e4d; }
    @media print { .actions { display: none; } }
  </style></head><body>
  <div class="actions">系統會自動開啟列印對話框 — 選「儲存為 PDF」即可下載。</div>
  <h1>飲食紀錄總覽</h1>
  <p class="meta">${rows[0].date} → ${rows[rows.length - 1].date}　·　共 ${rows.length} 天　·　產生於 ${new Date().toLocaleString("zh-Hant")}${target ? `　·　每日建議熱量 ${target} kcal` : ""}</p>
  <div class="legend">${legend}</div>
  <table>
    <thead><tr><th>日期</th><th>星期</th><th class="num">熱量(kcal)</th><th>達標</th><th>六大類份數分布</th></tr></thead>
    <tbody>${tr}</tbody>
  </table>
  <script>window.addEventListener("load", () => setTimeout(() => window.print(), 300));</script>
  </body></html>`;
  win.document.open(); win.document.write(html); win.document.close();
}

// ── Main page ──────────────────────────────────────────────
function RecordsPage() {
  const [records, setRecords] = React.useState(loadRecords);
  const [view, setView] = React.useState("week"); // week | history
  const [activeDate, setActiveDate] = React.useState(() => todayDate(0));
  const [drafts, setDrafts] = React.useState({});
  const [historyDays, setHistoryDays] = React.useState(30);

  const profile = loadProfile3();
  const target = profile ? rc3(profile.weightKg, profile.goal) : null;
  const rec = React.useMemo(() => profile ? br3(profile) : null, [profile?.weightKg, profile?.goal, profile?.heightCm]);

  React.useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); } catch (e) {}
  }, [records]);

  // Rolling 7-day window ending today.
  const weekDates = React.useMemo(() => lastNDates(7), []);
  // Ensure active date is in the visible week, else default to today.
  React.useEffect(() => {
    if (!weekDates.includes(activeDate)) setActiveDate(todayDate(0));
  }, [weekDates]);

  const day = records[activeDate] || { meals: emptyMeals() };
  const dayCal = dayTotalCal(day);
  const dayServings = dayServingsOf(day);
  const dayEntries = dayEntryCount(day);
  const daySummary = nfs3(dayServings);
  const reached = reachedCountOf(dayServings, rec);

  const weekCal = weekDates.reduce((a, d) => a + dayTotalCal(records[d]), 0);
  const filledDays = weekDates.filter((d) => dayEntryCount(records[d]) > 0).length;

  const draftKey = (mealId) => `${activeDate}:${mealId}`;
  const draftOf = (mealId) => drafts[draftKey(mealId)] || { name: "", category: "grains", amount: "" };
  function setDraft(mealId, patch) {
    const k = draftKey(mealId);
    setDrafts((d) => ({ ...d, [k]: { ...draftOf(mealId), ...patch } }));
  }
  function addEntry(mealId) {
    const d = draftOf(mealId);
    if (!d.name.trim()) return;
    const amount = Number(d.amount) || 1;
    const cal = Math.round((CAT_CAL_PER_SERVING[d.category] || 50) * amount);
    const entry = { id: uid(), name: d.name.trim(), category: d.category, amount, cal };
    setRecords((r) => {
      const cur = r[activeDate] || { meals: emptyMeals() };
      return { ...r, [activeDate]: { ...cur, meals: { ...cur.meals, [mealId]: [...(cur.meals[mealId] || []), entry] } } };
    });
    setDraft(mealId, { name: "", amount: "" });
  }
  function removeEntry(mealId, id) {
    setRecords((r) => {
      const cur = r[activeDate]; if (!cur) return r;
      return { ...r, [activeDate]: { ...cur, meals: { ...cur.meals, [mealId]: (cur.meals[mealId] || []).filter((e) => e.id !== id) } } };
    });
  }

  const dayMacros = [
    { id: "cho", label: "CHO 碳水", grams: daySummary.totals.cho, cal: daySummary.macroCal.cho, ratio: daySummary.ratios.cho },
    { id: "pro", label: "PRO 蛋白", grams: daySummary.totals.pro, cal: daySummary.macroCal.pro, ratio: daySummary.ratios.pro },
    { id: "fat", label: "FAT 脂肪", grams: daySummary.totals.fat, cal: daySummary.macroCal.fat, ratio: daySummary.ratios.fat },
  ];
  const macroColors = { cho: "var(--hue-grain)", pro: "var(--hue-protein)", fat: "var(--hue-veg)" };

  const delta = target ? dayCal - target : 0;
  const status = !target ? null : Math.abs(delta) <= 150 ? { label: "接近建議值", tone: "ok" }
    : delta > 0 ? { label: `高於建議 ${Math.round(delta)} kcal`, tone: "over" }
    : { label: `低於建議 ${Math.round(-delta)} kcal`, tone: "under" };

  // ── History rows ──
  const historyRows = React.useMemo(() => {
    const dates = lastNDates(historyDays);
    return dates.map((dt) => {
      const dr = records[dt];
      const svs = dayServingsOf(dr);
      const kcal = dayTotalCal(dr);
      const entries = dayEntryCount(dr);
      return {
        date: dt, wk: dateToWeekday(dt), kcal, entries,
        servings: svs, reached: reachedCountOf(svs, rec),
      };
    });
  }, [records, historyDays, rec]);

  const historyStats = React.useMemo(() => {
    const filled = historyRows.filter((r) => r.entries > 0);
    const avgKcal = filled.length ? Math.round(filled.reduce((a, r) => a + r.kcal, 0) / filled.length) : 0;
    const avgReach = filled.length && rec ? (filled.reduce((a, r) => a + r.reached, 0) / filled.length) : 0;
    const fullDays = historyRows.filter((r) => rec && r.reached === FG3.length).length;
    return { filled: filled.length, avgKcal, avgReach, fullDays };
  }, [historyRows, rec]);

  return (
    <>
      <PageHead
        eyebrow="DIET RECORDS · 飲食紀錄"
        title='記下這一週<em>吃了什麼</em>'
        sub="按日期切換，分早午晚與點心填入飲食內容；系統會自動加總每日熱量，並對照計算器頁面的建議值。也可以切到「查看紀錄」看 30 天總覽與達標分析。"
      />

      <section className="container" style={{ paddingBottom: 80, display: "grid", gap: 22 }}>
        {/* View switcher */}
        <div className="records-tabs">
          <button className={"records-tab " + (view === "week" ? "active" : "")} onClick={() => setView("week")}>
            <strong>本週紀錄</strong>
            <span>Weekly · 最近 7 天</span>
          </button>
          <button className={"records-tab " + (view === "history" ? "active" : "")} onClick={() => setView("history")}>
            <strong>查看紀錄</strong>
            <span>History · 最近 30 天總覽</span>
          </button>
        </div>

        {view === "week" && (
          <>
            {/* Day tabs (rolling 7-day) */}
            <div className="day-tabs">
              {weekDates.map((dt) => {
                const dr = records[dt];
                const has = dayEntryCount(dr) > 0;
                const cal = dayTotalCal(dr);
                const parts = dt.split("-");
                const wk = dateToWeekday(dt);
                const isToday = dt === todayDate(0);
                return (
                  <button key={dt}
                    className={"day-tab " + (activeDate === dt ? "active " : "") + (isToday ? "is-today" : "")}
                    onClick={() => setActiveDate(dt)}>
                    <span className="day-name">星期{wk}{isToday && " · 今天"}</span>
                    <span className="day-date">{parts[1]}/{parts[2]}</span>
                    <span className="day-cal">{has ? `${cal} kcal` : "—"}</span>
                    <span className={"day-status " + (has ? "filled" : "")}/>
                  </button>
                );
              })}
            </div>

            {/* Day stats */}
            <div className="stats">
              <article className="stat rise" style={{ "--motion-delay": "40ms" }}>
                <span className="label">當日總熱量</span>
                <strong className="value"><Counter value={dayCal}/><small>kcal</small></strong>
                <p className="hint">{status ? status.label : "尚未在計算器設定目標"}</p>
                <span className="corner-mark">日</span>
              </article>
              <article className="stat rise" style={{ "--motion-delay": "100ms" }}>
                <span className="label">建議值</span>
                <strong className="value">{target || "—"}<small>kcal</small></strong>
                <p className="hint">{profile ? `${GO3.find((g) => g.value === profile.goal).label} · ${profile.weightKg} kg` : "請先在計算器頁面輸入"}</p>
                <span className="corner-mark">標</span>
              </article>
              <article className="stat rise" style={{ "--motion-delay": "160ms" }}>
                <span className="label">本週總熱量</span>
                <strong className="value"><Counter value={weekCal}/><small>kcal</small></strong>
                <p className="hint">已紀錄 {filledDays} / 7 天</p>
                <span className="corner-mark">週</span>
              </article>
              <article className="stat rise" style={{ "--motion-delay": "220ms" }}>
                <span className="label">建議週累計</span>
                <strong className="value">{target ? target * 7 : "—"}<small>kcal</small></strong>
                <p className="hint">建議值 × 7 天</p>
                <span className="corner-mark">∑</span>
              </article>
            </div>

            {/* Macros + serving progress */}
            <article className="card rise" style={{ "--motion-delay": "260ms" }}>
              <div className="card-head">
                <div>
                  <span className="eyebrow">圖表　·　Charts</span>
                  <h2>三大營養素 與 各類份數</h2>
                </div>
                {rec ? (
                  <span className={"records-quest " + (reached === FG3.length ? "is-done" : "")}>
                    <span className="records-quest-icon" aria-hidden="true">{reached === FG3.length ? "🎉" : "🎯"}</span>
                    <span className="records-quest-body">
                      <strong>達標任務</strong>
                      <span><Counter value={reached}/> / {FG3.length} 類達標</span>
                    </span>
                  </span>
                ) : (
                  <span className="records-quest is-empty">先在計算器頁設定建議值</span>
                )}
              </div>
              <p className="note" style={{ marginTop: -6, marginBottom: 16 }}>
                根據今天輸入的飲食內容，自動加總三大營養素與六大類食物份數，並對照計算器頁面的建議值。
              </p>
              {dayEntries === 0 ? (
                <div className="records-empty-charts">
                  <span className="records-empty-emoji" aria-hidden="true">🍽️</span>
                  <p>今天還沒記錄任何飲食，先到下方加入一筆吧。</p>
                </div>
              ) : (
                <>
                  <div className="donut-wrap" style={{ marginBottom: 24 }}>
                    <Donut
                      segments={dayMacros.map((m) => ({ value: m.cal, color: macroColors[m.id] }))}
                      centerValue={<Counter value={Math.round(daySummary.totalCal)}/>}
                      centerLabel="kcal"
                    />
                    <div className="legend">
                      {dayMacros.map((m) => (
                        <div key={m.id} className="legend-row">
                          <span className="swatch" style={{ background: macroColors[m.id] }}/>
                          <span className="name">{m.label}<small><Counter value={Math.round(m.cal)}/> kcal · <Counter value={Math.round(m.grams)}/> g</small></span>
                          <span className="pct"><Counter value={m.ratio} decimals={1}/>%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {rec && (
                    <div style={{ borderTop: "1px solid var(--line-soft)", paddingTop: 22 }}>
                      <BarList
                        showStatus={true}
                        rows={FG3.map((g) => ({
                          id: g.id, label: g.label, short: g.short, hue: g.hue,
                          value: dayServings[g.id], target: rec.recommendedServings[g.id],
                          color: `var(--hue-${g.hue})`,
                        }))}
                      />
                    </div>
                  )}
                </>
              )}
            </article>

            {/* Meal cards */}
            <div className="meal-grid">
              {MEALS.map((m, i) => {
                const entries = day.meals[m.id] || [];
                const draft = draftOf(m.id);
                const mealServings = entries.reduce((a, e) => a + (Number(e.amount) || 0), 0);
                return (
                  <article key={m.id} className="meal-card rise" style={{ "--motion-delay": `${i * 60}ms` }}>
                    <div className="meal-head">
                      <h3><span className="icon">{m.icon}</span>{m.label}</h3>
                      <span className="meal-cal">{fmt(mealServings)} 份 · {entries.length} 項</span>
                    </div>
                    {entries.length === 0 ? (
                      <div className="entry-empty">尚未記錄</div>
                    ) : (
                      <div className="entry-list">
                        {entries.map((e) => {
                          const cat = FG3.find((g) => g.id === e.category);
                          return (
                            <div key={e.id} className="entry-row">
                              <div className="cat-dot" style={hueVars(cat?.hue || "grain")}>{cat?.short || "·"}</div>
                              <span className="name">{e.name}</span>
                              <span className="cal">{e.amount} 份</span>
                              <button className="delete-btn" onClick={() => removeEntry(m.id, e.id)} aria-label="刪除">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <div className="entry-form">
                      <input className="input name-input" placeholder="食物名稱" value={draft.name}
                        onChange={(e) => setDraft(m.id, { name: e.target.value })}
                        onKeyDown={(e) => { if (e.key === "Enter") addEntry(m.id); }}/>
                      <select className="select" value={draft.category} onChange={(e) => setDraft(m.id, { category: e.target.value })}>
                        {CAT_OPTIONS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                      <input className="input" placeholder="份數" type="number" step="0.5" value={draft.amount}
                        onChange={(e) => setDraft(m.id, { amount: e.target.value })}
                        onKeyDown={(e) => { if (e.key === "Enter") addEntry(m.id); }}/>
                      <button className="btn primary add-btn" onClick={() => addEntry(m.id)}>新增</button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}

        {view === "history" && (
          <HistoryView
            rows={historyRows}
            stats={historyStats}
            target={target}
            rec={rec}
            days={historyDays}
            setDays={setHistoryDays}
            onJumpToDay={(dt) => { setView("week"); setActiveDate(dt); }}
          />
        )}

        <p className="disclaimer">資料儲存於本機瀏覽器 localStorage；切換裝置後不會同步。</p>
      </section>
    </>
  );
}

function HistoryView({ rows, stats, target, rec, days, setDays, onJumpToDay }) {
  const maxKcal = Math.max(...rows.map((r) => r.kcal), target || 0, 1);
  const hues = { grains: "#c8923a", protein: "#b85a2a", dairy: "#e8c47a", vegetables: "#4a6b32", fruits: "#8a3d3d", fats: "#9a7b3a" };

  return (
    <>
      {/* Overview stats */}
      <div className="stats">
        <article className="stat rise" style={{ "--motion-delay": "40ms" }}>
          <span className="label">紀錄天數</span>
          <strong className="value"><Counter value={stats.filled}/><small>/ {days} 天</small></strong>
          <p className="hint">{days} 天內實際有紀錄</p>
          <span className="corner-mark">日</span>
        </article>
        <article className="stat rise" style={{ "--motion-delay": "100ms" }}>
          <span className="label">平均熱量</span>
          <strong className="value"><Counter value={stats.avgKcal}/><small>kcal</small></strong>
          <p className="hint">{target ? (stats.avgKcal > target ? `高於建議 ${stats.avgKcal - target}` : `低於建議 ${target - stats.avgKcal}`) : "—"}</p>
          <span className="corner-mark">均</span>
        </article>
        <article className="stat rise" style={{ "--motion-delay": "160ms" }}>
          <span className="label">平均達標</span>
          <strong className="value"><Counter value={stats.avgReach} decimals={1}/><small>/ 6 類</small></strong>
          <p className="hint">{rec ? "符合建議份數的類別數" : "先設定計算器"}</p>
          <span className="corner-mark">標</span>
        </article>
        <article className="stat rise" style={{ "--motion-delay": "220ms" }}>
          <span className="label">全達標日</span>
          <strong className="value"><Counter value={stats.fullDays}/><small>天</small></strong>
          <p className="hint">六類全部達標的天數</p>
          <span className="corner-mark">★</span>
        </article>
      </div>

      {/* Range + export */}
      <article className="card rise" style={{ "--motion-delay": "260ms" }}>
        <div className="card-head">
          <div>
            <span className="eyebrow">期間　·　Range</span>
            <h2>選擇要查看的天數</h2>
          </div>
          <div className="history-range">
            {[7, 14, 30].map((n) => (
              <button key={n} className={"history-range-btn " + (days === n ? "active" : "")} onClick={() => setDays(n)}>
                最近 {n} 天
              </button>
            ))}
          </div>
        </div>
        <p className="note" style={{ marginTop: -6, marginBottom: 16 }}>
          以下圖表會根據選取的天數即時更新；可匯出 CSV、JPG、PDF 三種格式。
        </p>
        <div className="export-bar">
          <button className="export-btn is-csv" onClick={() => exportHistoryCSV(rows, target, rec)}>
            <span className="export-tag">CSV</span><span className="export-label">匯出 CSV</span>
          </button>
          <button className="export-btn is-jpg" onClick={() => exportHistoryJPG(rows, target, rec)}>
            <span className="export-tag">JPG</span><span className="export-label">匯出 JPG</span>
          </button>
          <button className="export-btn is-pdf" onClick={() => exportHistoryPDF(rows, target, rec)}>
            <span className="export-tag">PDF</span><span className="export-label">匯出 PDF</span>
          </button>
        </div>
      </article>

      {/* Daily kcal trend chart */}
      <article className="card rise" style={{ "--motion-delay": "300ms" }}>
        <div className="card-head">
          <div>
            <span className="eyebrow">熱量趨勢　·　Calorie Trend</span>
            <h2>每日熱量 vs 建議值</h2>
          </div>
          {target && <span className="history-target-pill">建議 {target} kcal / 天</span>}
        </div>
        <div className="history-trend">
          {rows.map((r) => {
            const h = r.kcal === 0 ? 4 : Math.max(6, (r.kcal / maxKcal) * 160);
            const overTgt = target && r.kcal > target * 1.1;
            const underTgt = target && r.kcal > 0 && r.kcal < target * 0.8;
            return (
              <button key={r.date} className="history-trend-bar" onClick={() => onJumpToDay(r.date)} title={`${r.date} · ${r.kcal} kcal`}>
                <span className="trend-val">{r.kcal > 0 ? r.kcal : ""}</span>
                <span className={"trend-bar " + (overTgt ? "is-over" : underTgt ? "is-under" : r.kcal > 0 ? "is-ok" : "is-empty")}
                  style={{ height: h }}/>
                <span className="trend-date">{r.date.slice(5)}</span>
              </button>
            );
          })}
          {target && (
            <div className="history-trend-target" style={{ bottom: 28 + (target / maxKcal) * 160 }} aria-hidden="true">
              <span>建議 {target}</span>
            </div>
          )}
        </div>
      </article>

      {/* 30-day list with stacked bars */}
      <article className="card rise" style={{ "--motion-delay": "340ms" }}>
        <div className="card-head">
          <div>
            <span className="eyebrow">每日明細　·　Daily Breakdown</span>
            <h2>六大類份數分布 & 達標狀態</h2>
          </div>
          <div className="history-legend">
            {FG3.map((g) => (
              <span key={g.id} className="lg-item">
                <span className="lg-sw" style={{ background: hues[g.id] }}/>
                {g.short}
              </span>
            ))}
          </div>
        </div>
        <div className="history-list">
          {rows.map((r) => {
            const totalS = FG3.reduce((a, g) => a + r.servings[g.id], 0);
            const statusCls = !rec ? "mute" : r.reached === FG3.length ? "ok"
              : r.reached >= 4 ? "warn" : r.entries === 0 ? "mute" : "bad";
            const statusLbl = !rec ? "—" : r.reached === FG3.length ? "全達標"
              : r.reached >= 4 ? "接近" : r.entries === 0 ? "未紀錄" : "未達標";
            return (
              <button key={r.date} className="history-row" onClick={() => onJumpToDay(r.date)}>
                <div className="history-row-date">
                  <strong>{r.date.slice(5)}</strong>
                  <span>星期{r.wk}</span>
                </div>
                <div className="history-row-bar">
                  {totalS > 0 ? (
                    <div className="hbar">
                      {FG3.map((g) => {
                        const w = (r.servings[g.id] / totalS) * 100;
                        if (w === 0) return null;
                        return <span key={g.id} className="hbar-seg" style={{ width: w + "%", background: hues[g.id] }}
                          title={`${g.label} ${fmtN(r.servings[g.id])} 份`}/>;
                      })}
                    </div>
                  ) : <span className="hbar-empty">未記錄</span>}
                </div>
                <div className="history-row-kcal">{r.kcal > 0 ? r.kcal + " kcal" : "—"}</div>
                <span className={"history-pill is-" + statusCls}>{rec ? `${r.reached}/6` : "—"} {statusLbl}</span>
              </button>
            );
          })}
        </div>
      </article>
    </>
  );
}

window.RecordsPage = RecordsPage;
