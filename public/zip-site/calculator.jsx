// Calculator page — focus screen with live calculation, drag servings, donut/bar animations.

const {
  GOAL_OPTIONS, ACTIVITY_OPTIONS, SEX_OPTIONS, FOOD_GROUPS, SERVING_LIMITS,
  buildRecommendation, nutritionFromServings, clampServing, recommendedCalories,
  bmiOf, bmiStatus,
} = window;

const DEFAULT_PROFILE = { heightCm: 170, weightKg: 65, age: 28, sex: "female", activity: "medium", goal: "maintain" };

const EXPORT_ACTIONS = [
  { id: "pdf", label: "匯出 PDF", icon: "PDF" },
  { id: "jpg", label: "匯出 JPG", icon: "JPG" },
  { id: "csv", label: "Google CSV", icon: "CSV" },
  { id: "xls", label: "匯出 Excel", icon: "XLS" },
];

function loadProfile() {
  try {
    const raw = localStorage.getItem("nutrition.profile");
    if (raw) return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch (e) {}
  return DEFAULT_PROFILE;
}

// ── Export helpers ────────────────────────────────────────
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function fmtNum(v, d = 1) {
  if (typeof v !== "number" || Number.isNaN(v)) return "";
  return Number.isInteger(v) ? v.toString() : v.toFixed(d);
}

function escapeCsv(s) {
  const t = String(s ?? "");
  return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
}

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function exportCSV(ctx, filename) {
  const { profile, recommendation, summary, servings, goalLabel, activityLabel, sexLabel, foodGroups, macros } = ctx;
  const lines = [];
  lines.push(["飲食計劃 · Daily Nutrition Report"].map(escapeCsv).join(","));
  lines.push([`產生時間,${new Date().toLocaleString("zh-Hant")}`]);
  lines.push("");
  lines.push("【個人資料】");
  lines.push(["欄位", "數值"].map(escapeCsv).join(","));
  lines.push(["身高 cm", profile.heightCm].map(escapeCsv).join(","));
  lines.push(["體重 kg", profile.weightKg].map(escapeCsv).join(","));
  lines.push(["年齡", profile.age].map(escapeCsv).join(","));
  lines.push(["性別", sexLabel].map(escapeCsv).join(","));
  lines.push(["活動量", activityLabel].map(escapeCsv).join(","));
  lines.push(["目標", goalLabel].map(escapeCsv).join(","));
  lines.push("");
  lines.push("【熱量與三大營養素】");
  lines.push(["項目", "數值", "單位"].map(escapeCsv).join(","));
  lines.push(["每日建議熱量", recommendation.targetCalories, "kcal"].map(escapeCsv).join(","));
  lines.push(["目前份數熱量", Math.round(summary.totalCal), "kcal"].map(escapeCsv).join(","));
  lines.push(["BMI", recommendation.bmi.toFixed(1), recommendation.bmiStatus].map(escapeCsv).join(","));
  for (const m of macros) {
    lines.push([m.label, `${Math.round(m.cal)} kcal`, `${Math.round(m.grams)} g (${m.ratio.toFixed(1)}%)`].map(escapeCsv).join(","));
  }
  lines.push("");
  lines.push("【六大類食物建議份數】");
  lines.push(["類別", "建議份數"].map(escapeCsv).join(","));
  for (const g of foodGroups) {
    const tgt = recommendation.recommendedServings[g.id];
    lines.push([g.label, fmtNum(tgt)].map(escapeCsv).join(","));
  }
  const csv = "﻿" + lines.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  triggerDownload(blob, filename);
  return { filename };
}

function exportXLS(ctx, filename) {
  const { profile, recommendation, summary, servings, goalLabel, activityLabel, sexLabel, foodGroups, macros } = ctx;
  const css = `
    body { font-family: "Microsoft JhengHei", "PingFang TC", sans-serif; }
    h2 { color: #b85a2a; margin: 18px 0 6px; }
    table { border-collapse: collapse; margin-bottom: 14px; }
    th, td { border: 1px solid #c8b89c; padding: 6px 14px; }
    th { background: #f1dfb6; color: #29231a; }
    .num { text-align: right; font-family: "Consolas", monospace; }
  `;
  const rowsProfile = [
    ["身高 cm", profile.heightCm],
    ["體重 kg", profile.weightKg],
    ["年齡", profile.age],
    ["性別", sexLabel],
    ["活動量", activityLabel],
    ["目標", goalLabel],
  ];
  const rowsMacro = [
    ["每日建議熱量", recommendation.targetCalories, "kcal"],
    ["目前份數熱量", Math.round(summary.totalCal), "kcal"],
    ["BMI", recommendation.bmi.toFixed(1), recommendation.bmiStatus],
    ...macros.map((m) => [m.label, `${Math.round(m.cal)} kcal`, `${Math.round(m.grams)} g (${m.ratio.toFixed(1)}%)`]),
  ];
  const rowsServings = foodGroups.map((g) => {
    const tgt = recommendation.recommendedServings[g.id];
    return [g.label, fmtNum(tgt)];
  });
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>
    <h1>飲食計劃 · Daily Nutrition Report</h1>
    <p>產生時間：${new Date().toLocaleString("zh-Hant")}</p>
    <h2>個人資料</h2>
    <table><tr><th>欄位</th><th>數值</th></tr>${rowsProfile.map((r) => `<tr><td>${escapeHtml(r[0])}</td><td class="num">${escapeHtml(r[1])}</td></tr>`).join("")}</table>
    <h2>熱量與三大營養素</h2>
    <table><tr><th>項目</th><th>數值</th><th>單位</th></tr>${rowsMacro.map((r) => `<tr><td>${escapeHtml(r[0])}</td><td class="num">${escapeHtml(r[1])}</td><td>${escapeHtml(r[2] || "")}</td></tr>`).join("")}</table>
    <h2>六大類食物建議份數</h2>
    <table><tr><th>類別</th><th>建議份數</th></tr>${rowsServings.map((r) => `<tr><td>${escapeHtml(r[0])}</td><td class="num">${escapeHtml(r[1])}</td></tr>`).join("")}</table>
    </body></html>`;
  const blob = new Blob(["﻿" + html], { type: "application/vnd.ms-excel;charset=utf-8" });
  triggerDownload(blob, filename);
  return { filename };
}

function exportJPG(ctx, filename) {
  const { profile, recommendation, summary, servings, goalLabel, activityLabel, sexLabel, foodGroups, macros } = ctx;
  const W = 1400, H = 1900;
  const PAD = 80;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d");

  // Background
  g.fillStyle = "#fbf6ec";
  g.fillRect(0, 0, W, H);
  g.fillStyle = "#f0d4be";
  g.fillRect(0, 0, W, 16);

  // Title
  g.fillStyle = "#29231a";
  g.font = "700 60px 'Noto Serif TC', serif";
  g.fillText("飲食計劃", PAD, 120);
  g.font = "500 24px 'Noto Sans TC', sans-serif";
  g.fillStyle = "#6b5e4d";
  g.fillText("Daily Nutrition Report · " + new Date().toLocaleString("zh-Hant"), PAD, 160);

  // Section helper
  function section(label, y) {
    g.fillStyle = "#b85a2a";
    g.font = "700 18px 'Noto Sans TC', sans-serif";
    g.fillText(label.toUpperCase(), PAD, y);
    g.fillStyle = "#29231a";
    g.font = "600 30px 'Noto Serif TC', serif";
    g.fillText(label, PAD, y + 38);
    g.strokeStyle = "#e3d6bb";
    g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(PAD, y + 54); g.lineTo(W - PAD, y + 54); g.stroke();
  }

  function statBox(x, y, w, h, label, value, unit, hue) {
    g.fillStyle = "#ffffff";
    g.strokeStyle = "#e3d6bb";
    g.lineWidth = 1.5;
    roundRect(g, x, y, w, h, 16, true, true);
    g.fillStyle = "#9a8b76";
    g.font = "600 15px 'Noto Sans TC', sans-serif";
    g.fillText(label, x + 22, y + 38);
    g.fillStyle = hue || "#29231a";
    g.font = "700 40px 'Noto Serif TC', serif";
    g.fillText(value, x + 22, y + 88);
    if (unit) {
      g.fillStyle = "#6b5e4d";
      g.font = "500 16px 'Noto Sans TC', sans-serif";
      g.fillText(unit, x + 22, y + 116);
    }
  }

  // Stat row
  let y = 210;
  const gap = 20;
  const boxW = (W - PAD * 2 - gap * 3) / 4;
  const boxH = 140;
  statBox(PAD + (boxW + gap) * 0, y, boxW, boxH, "每日建議熱量", String(recommendation.targetCalories), "kcal", "#b85a2a");
  statBox(PAD + (boxW + gap) * 1, y, boxW, boxH, "目前份數熱量", String(Math.round(summary.totalCal)), "kcal", "#4a6b32");
  statBox(PAD + (boxW + gap) * 2, y, boxW, boxH, "BMI", recommendation.bmi.toFixed(1), recommendation.bmiStatus, "#c8923a");
  statBox(PAD + (boxW + gap) * 3, y, boxW, boxH, "活動量", activityLabel, profile.age + " 歲", "#8a3d3d");

  // Profile
  y = 410;
  section("個人資料", y);
  y += 90;
  const profItems = [
    ["身高", profile.heightCm + " cm"], ["體重", profile.weightKg + " kg"],
    ["年齡", profile.age + " 歲"], ["性別", sexLabel],
    ["活動量", activityLabel], ["目標", goalLabel],
  ];
  const colW = (W - PAD * 2) / 3;
  profItems.forEach((p, i) => {
    const px = PAD + (i % 3) * colW;
    const py = y + Math.floor(i / 3) * 48;
    g.fillStyle = "#9a8b76"; g.font = "500 20px 'Noto Sans TC', sans-serif";
    g.fillText(p[0], px, py);
    g.fillStyle = "#29231a"; g.font = "600 22px 'Noto Serif TC', serif";
    g.fillText(p[1], px + 90, py);
  });

  // Macros
  y += 140;
  section("三大營養素", y);
  y += 90;
  const macroColors = ["#c8923a", "#b85a2a", "#4a6b32"];
  const mGap = 20;
  const mw = (W - PAD * 2 - mGap * 2) / 3;
  const mh = 150;
  macros.forEach((m, i) => {
    const mx = PAD + i * (mw + mGap);
    g.fillStyle = "#ffffff"; g.strokeStyle = "#e3d6bb"; g.lineWidth = 1.5;
    roundRect(g, mx, y, mw, mh, 16, true, true);
    g.fillStyle = macroColors[i];
    g.fillRect(mx, y, 6, mh);
    g.fillStyle = "#29231a";
    g.font = "600 22px 'Noto Sans TC', sans-serif";
    g.fillText(m.label, mx + 24, y + 42);
    g.fillStyle = macroColors[i];
    g.font = "700 40px 'Noto Serif TC', serif";
    g.fillText(Math.round(m.grams) + " g", mx + 24, y + 92);
    g.fillStyle = "#6b5e4d";
    g.font = "500 17px 'Noto Sans TC', sans-serif";
    g.fillText(`${Math.round(m.cal)} kcal · ${m.ratio.toFixed(1)}%`, mx + 24, y + 124);
  });

  // Food groups
  y += mh + 60;
  section("六大類食物建議份數", y);
  y += 90;
  const tgtMax = Math.max(...foodGroups.map((fg) => recommendation.recommendedServings[fg.id]), 1);
  const rowH = 80;
  foodGroups.forEach((fg, i) => {
    const tgt = recommendation.recommendedServings[fg.id];
    const fy = y + i * rowH;
    g.fillStyle = "#29231a"; g.font = "600 22px 'Noto Sans TC', sans-serif";
    g.fillText(fg.label, PAD, fy + 22);
    g.fillStyle = "#6b5e4d"; g.font = "500 17px 'Noto Sans TC', sans-serif";
    g.fillText(`建議 ${fmtNum(tgt)} 份`, PAD, fy + 50);

    const trackX = PAD + 320;
    const trackW = W - PAD - trackX - 90; // reserve space for serving number on right
    const trackH = 22;
    const trackY = fy + 22;
    g.fillStyle = "rgba(0,0,0,0.06)";
    g.fillRect(trackX, trackY, trackW, trackH);
    const fillW = (tgt / tgtMax) * trackW;
    const grad = g.createLinearGradient(trackX, 0, trackX + trackW, 0);
    grad.addColorStop(0, "#f1dfb6"); grad.addColorStop(1, "#b85a2a");
    g.fillStyle = grad;
    g.fillRect(trackX, trackY, fillW, trackH);

    // Serving number annotation right after the bar end
    g.fillStyle = "#b85a2a";
    g.font = "700 24px 'Noto Serif TC', serif";
    g.fillText(`${fmtNum(tgt)} 份`, trackX + fillW + 12, trackY + 18);
  });

  // Footer
  g.fillStyle = "#9a8b76";
  g.font = "500 16px 'Noto Sans TC', sans-serif";
  g.fillText("此報表為估算值，實際飲食仍需依個人健康狀況、運動安排與營養師建議調整。", PAD, H - 50);

  return new Promise((resolve, reject) => {
    c.toBlob((blob) => {
      if (!blob) { reject(new Error("無法產生 JPG")); return; }
      triggerDownload(blob, filename);
      resolve({ filename });
    }, "image/jpeg", 0.92);
  });
}

function roundRect(g, x, y, w, h, r, fill, stroke) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
  if (fill) g.fill();
  if (stroke) g.stroke();
}

function exportPDF(ctx, filename) {
  const { profile, recommendation, summary, servings, goalLabel, activityLabel, sexLabel, foodGroups, macros } = ctx;
  const win = window.open("", "_blank");
  if (!win) {
    throw new Error("瀏覽器封鎖了新視窗，請允許彈出視窗或改用 JPG / CSV / Excel 匯出。");
  }

  const macroRows = macros.map((m) => `
    <tr><td>${escapeHtml(m.label)}</td>
        <td class="num">${Math.round(m.cal)} kcal</td>
        <td class="num">${Math.round(m.grams)} g</td>
        <td class="num">${m.ratio.toFixed(1)}%</td></tr>`).join("");
  const tgtMaxPdf = Math.max(...foodGroups.map((fg) => recommendation.recommendedServings[fg.id]), 1);
  const groupRows = foodGroups.map((gp) => {
    const tgt = recommendation.recommendedServings[gp.id];
    const pct = (tgt / tgtMaxPdf) * 100;
    return `<tr>
      <td><strong>${escapeHtml(gp.label)}</strong></td>
      <td class="bar-cell">
        <div class="bar-wrap">
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
        </div>
      </td>
      <td class="num bar-value">${escapeHtml(fmtNum(tgt))} 份</td>
    </tr>`;
  }).join("");

  const html = `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8">
    <title>${escapeHtml(filename)}</title>
    <style>
      @page { size: A4; margin: 16mm 14mm; }
      * { box-sizing: border-box; }
      body { font-family: "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif; color: #29231a; margin: 0; font-size: 15px; line-height: 1.55; }
      h1 { font-family: "Noto Serif TC", serif; font-size: 36px; margin: 0 0 6px; color: #29231a; }
      h2 { font-family: "Noto Serif TC", serif; font-size: 22px; margin: 26px 0 12px; color: #b85a2a; border-bottom: 1.5px solid #e3d6bb; padding-bottom: 6px; }
      .meta { color: #6b5e4d; font-size: 15px; margin-bottom: 18px; }
      .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 14px; }
      .stat { background: #fbf6ec; border: 1px solid #e3d6bb; border-radius: 12px; padding: 16px 18px; }
      .stat .label { color: #9a8b76; font-size: 13px; letter-spacing: 0.14em; text-transform: uppercase; }
      .stat .value { font-family: "Noto Serif TC", serif; font-size: 30px; font-weight: 700; margin-top: 8px; color: #b85a2a; }
      .stat .unit { color: #6b5e4d; font-size: 14px; margin-left: 6px; font-weight: 500; }
      table { width: 100%; border-collapse: collapse; font-size: 16px; }
      th, td { padding: 10px 14px; border-bottom: 1px solid #ece2cb; text-align: left; }
      th { background: #f3ead6; color: #29231a; font-weight: 600; font-size: 15px; }
      td.num, th.num { text-align: right; font-family: "Consolas", monospace; }
      .bar-cell { width: 60%; padding: 8px 12px; }
      .bar-wrap { width: 100%; }
      .bar-track { width: 100%; height: 18px; background: rgba(0,0,0,0.06); border-radius: 4px; overflow: hidden; }
      .bar-fill { height: 100%; background: linear-gradient(90deg, #f1dfb6 0%, #b85a2a 100%); border-radius: 4px; }
      .bar-value { font-family: "Noto Serif TC", serif; font-size: 18px; font-weight: 700; color: #b85a2a; white-space: nowrap; }
      .footer { margin-top: 28px; color: #9a8b76; font-size: 13px; line-height: 1.7; }
      .actions { margin: 16px 0 8px; padding: 12px 14px; background: #faf3df; border: 1px dashed #c8b89c; border-radius: 8px; font-size: 14px; color: #6b5e4d; }
      @media print { .actions { display: none; } }
    </style>
  </head><body>
    <div class="actions">
      系統會自動開啟列印對話框 — 在「目的地」選「儲存為 PDF」即可下載。如未自動跳出，可按 Cmd / Ctrl + P。
    </div>
    <h1>飲食計劃 · Daily Nutrition Report</h1>
    <p class="meta">產生時間：${new Date().toLocaleString("zh-Hant")}</p>

    <div class="stats">
      <div class="stat"><div class="label">每日建議熱量</div><div class="value">${recommendation.targetCalories}<span class="unit">kcal</span></div></div>
      <div class="stat"><div class="label">目前份數熱量</div><div class="value">${Math.round(summary.totalCal)}<span class="unit">kcal</span></div></div>
      <div class="stat"><div class="label">BMI</div><div class="value">${recommendation.bmi.toFixed(1)}<span class="unit">${escapeHtml(recommendation.bmiStatus)}</span></div></div>
      <div class="stat"><div class="label">活動量 / 年齡</div><div class="value" style="font-size:24px;">${escapeHtml(activityLabel)}<span class="unit">${profile.age} 歲</span></div></div>
    </div>

    <h2>個人資料</h2>
    <table>
      <tr><th>身高</th><td>${profile.heightCm} cm</td><th>體重</th><td>${profile.weightKg} kg</td></tr>
      <tr><th>年齡</th><td>${profile.age} 歲</td><th>性別</th><td>${escapeHtml(sexLabel)}</td></tr>
      <tr><th>活動量</th><td>${escapeHtml(activityLabel)}</td><th>目標</th><td>${escapeHtml(goalLabel)}</td></tr>
    </table>

    <h2>三大營養素</h2>
    <table>
      <thead><tr><th>類別</th><th class="num">熱量</th><th class="num">克數</th><th class="num">比例</th></tr></thead>
      <tbody>${macroRows}</tbody>
    </table>

    <h2>六大類食物建議份數</h2>
    <table>
      <thead><tr><th>類別</th><th>份數分布</th><th class="num">建議份數</th></tr></thead>
      <tbody>${groupRows}</tbody>
    </table>

    <p class="footer">此報表為簡化版估算，實際飲食仍需依個人健康狀況、運動安排與營養師建議調整。</p>
    <script>
      window.addEventListener("load", () => {
        document.title = ${JSON.stringify(filename.replace(/\.pdf$/, ""))};
        setTimeout(() => window.print(), 250);
      });
    </script>
  </body></html>`;

  win.document.open(); win.document.write(html); win.document.close();
  return { filename, note: "請在列印對話框選「儲存為 PDF」" };
}

function runExport(id, ctx, filename) {
  if (id === "csv") return exportCSV(ctx, filename);
  if (id === "xls") return exportXLS(ctx, filename);
  if (id === "jpg") return exportJPG(ctx, filename);
  if (id === "pdf") return exportPDF(ctx, filename);
  throw new Error("未知格式：" + id);
}

function CalculatorPage() {
  const [profile, setProfile] = React.useState(loadProfile);
  const [servings, setServings] = React.useState(() => buildRecommendation(loadProfile()).recommendedServings);
  const [exporting, setExporting] = React.useState(null);
  const [exportProgress, setExportProgress] = React.useState(0);
  const [exportMsg, setExportMsg] = React.useState(null);

  const recommendation = React.useMemo(() => buildRecommendation(profile), [profile]);

  // Reset servings to recommendation when profile changes.
  const profileKey = `${profile.heightCm}-${profile.weightKg}-${profile.age}-${profile.sex}-${profile.activity}-${profile.goal}`;
  React.useEffect(() => {
    setServings(recommendation.recommendedServings);
  }, [profileKey]);

  React.useEffect(() => {
    try { localStorage.setItem("nutrition.profile", JSON.stringify(profile)); } catch (e) {}
  }, [profile]);

  const summary = React.useMemo(() => nutritionFromServings(servings), [servings]);
  const calorieDelta = summary.totalCal - recommendation.targetCalories;
  const isCustom = FOOD_GROUPS.some((g) => servings[g.id] !== recommendation.recommendedServings[g.id]);

  const goalLabel = GOAL_OPTIONS.find((g) => g.value === profile.goal).label;
  const activityLabel = ACTIVITY_OPTIONS.find((a) => a.value === profile.activity).label;

  const macros = [
    { id: "cho", label: "CHO 碳水", grams: summary.totals.cho, cal: summary.macroCal.cho, ratio: summary.ratios.cho, hue: "grain" },
    { id: "pro", label: "PRO 蛋白", grams: summary.totals.pro, cal: summary.macroCal.pro, ratio: summary.ratios.pro, hue: "protein" },
    { id: "fat", label: "FAT 脂肪", grams: summary.totals.fat, cal: summary.macroCal.fat, ratio: summary.ratios.fat, hue: "veg" },
  ];

  const macroColors = { cho: "var(--hue-grain)", pro: "var(--hue-protein)", fat: "var(--hue-veg)" };

  function setServing(id, val) {
    setServings((s) => ({ ...s, [id]: clampServing(id, val) }));
  }

  function handleExport(id) {
    if (exporting) return;
    setExporting(id); setExportProgress(0); setExportMsg(null);

    const ctx = {
      profile, servings,
      recommendation, summary,
      goalLabel, activityLabel,
      sexLabel: SEX_OPTIONS.find((s) => s.value === profile.sex)?.label || "—",
      foodGroups: FOOD_GROUPS,
      macros,
    };

    const filename = `飲食計劃-${new Date().toISOString().slice(0, 10)}.${id === "jpg" ? "jpg" : id === "xls" ? "xls" : id}`;
    const start = performance.now();
    const total = 700 + Math.random() * 300;

    const tick = () => {
      const p = Math.min(1, (performance.now() - start) / total);
      setExportProgress(p);
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        Promise.resolve()
          .then(() => runExport(id, ctx, filename))
          .then((info) => {
            setExporting(null);
            setExportMsg({
              ok: true,
              filename: info?.filename || filename,
              note: info?.note || "",
            });
          })
          .catch((err) => {
            console.error(err);
            setExporting(null);
            setExportMsg({ ok: false, filename: filename, note: err?.message || "匯出失敗，請再試一次" });
          });
      }
    };
    requestAnimationFrame(tick);
  }

  return (
    <>
      <PageHead
        eyebrow="DAILY NUTRITION CALCULATOR"
        title='每日<em>飲食份數</em>與營養素'
        sub="輸入身高、體重、年齡與目標，系統會即時估算每日建議熱量、六大類食物份數與三大營養素。所有調整即時更新。"
      />

      <section className="container workspace">
        {/* ── Sidebar ───────────────────────────────────── */}
        <aside className="sidebar">
          <article className="card rise" style={{ "--motion-delay": "60ms" }}>
            <div className="card-head">
              <div>
                <span className="eyebrow">輸入區</span>
                <h2>個人資料</h2>
              </div>
            </div>

            <div className="form-grid">
              <NumField label="身高" unit="cm" value={profile.heightCm} min={100} max={230} step={1}
                onChange={(v) => setProfile((p) => ({ ...p, heightCm: v }))}/>
              <NumField label="體重" unit="kg" value={profile.weightKg} min={30} max={200} step={0.5}
                onChange={(v) => setProfile((p) => ({ ...p, weightKg: v }))}/>
              <NumField label="年齡" unit="years" value={profile.age} min={10} max={100} step={1}
                onChange={(v) => setProfile((p) => ({ ...p, age: v }))}/>
              <div className="field">
                <div className="field-label">性別</div>
                <div className="seg">
                  {SEX_OPTIONS.map((o) => (
                    <button key={o.value} aria-pressed={profile.sex === o.value}
                      onClick={() => setProfile((p) => ({ ...p, sex: o.value }))}>{o.label}</button>
                  ))}
                </div>
              </div>
              <div className="field field-full">
                <div className="field-label">活動量</div>
                <div className="seg">
                  {ACTIVITY_OPTIONS.map((o) => (
                    <button key={o.value} aria-pressed={profile.activity === o.value}
                      onClick={() => setProfile((p) => ({ ...p, activity: o.value }))}>{o.label}</button>
                  ))}
                </div>
              </div>
              <div className="field field-full">
                <div className="field-label">飲食目標</div>
                <div className="goal-pills">
                  {GOAL_OPTIONS.map((g) => (
                    <button key={g.value} className="goal-pill" aria-pressed={profile.goal === g.value}
                      onClick={() => setProfile((p) => ({ ...p, goal: g.value }))}>
                      <strong>{g.label}</strong>
                      <span>{g.hint}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </article>

        </aside>

        {/* ── Main column ───────────────────────────────── */}
        <div className="main-col">
          {/* Stats */}
          <div className="stats">
            <StatCard label="每日建議熱量" value={recommendation.targetCalories} unit="kcal"
              hint={`${goalLabel}模式 · ${profile.weightKg} kg × ${GOAL_OPTIONS.find((g) => g.value === profile.goal).calorieFactor}`}
              corner="01" delay={80}/>
            <StatCard label="目前份數熱量" value={Math.round(summary.totalCal)} unit="kcal"
              hint={Math.abs(calorieDelta) < 30
                ? "與建議值接近"
                : (calorieDelta > 0 ? `高於建議 ${Math.round(calorieDelta)} kcal` : `低於建議 ${Math.round(Math.abs(calorieDelta))} kcal`)}
              corner="02" delay={140}/>
            <StatCard label="BMI" value={recommendation.bmi} decimals={1} unit={recommendation.bmiStatus}
              hint="由身高、體重估算" corner="03" delay={200}/>
            <StatCard label="份數分配基準" value={activityLabel} unit={`${profile.age} 歲`}
              hint="活動量、年齡會微調分配" corner="04" delay={260}/>
          </div>

          {/* Servings editor */}
          <article className="card rise" style={{ "--motion-delay": "180ms" }}>
            <div className="card-head">
              <div>
                <span className="eyebrow">結果區　·　Servings Editor</span>
                <h2>每日六大類食物份數</h2>
              </div>
              <button className="btn ghost" onClick={() => setServings(recommendation.recommendedServings)} disabled={!isCustom}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M11 6.5a4.5 4.5 0 11-1.32-3.18M11 1v3h-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                恢復系統建議
              </button>
            </div>
            <p className="note" style={{ marginTop: -6, marginBottom: 16 }}>
              拖曳滑桿、按 +/-，或直接輸入數字。系統會即時更新熱量與三大營養素比例。
            </p>

            <div className="editor-grid">
              {FOOD_GROUPS.map((g, i) => {
                const cur = servings[g.id];
                const tgt = recommendation.recommendedServings[g.id];
                const lim = SERVING_LIMITS[g.id];
                const isCustom = cur !== tgt;
                return (
                  <div key={g.id} className={"serving-card rise " + (isCustom ? "customized" : "")}
                    style={{ "--motion-delay": `${200 + i * 50}ms`, ...hueVars(g.hue) }}>
                    <div className="serving-head">
                      <div>
                        <h3>{g.label}</h3>
                        <p>{g.description}</p>
                      </div>
                      <div className="badge" style={hueVars(g.hue)}>{g.short}</div>
                    </div>
                    <div className="serving-slider">
                      <div className="track">
                        <div className="fill" style={{ width: `${(cur / lim.max) * 100}%`, "--hue": `var(--hue-${g.hue})` }}/>
                      </div>
                      <div className="target-marker" style={{ left: `${(tgt / lim.max) * 100}%`, "--hue": `var(--hue-${g.hue})` }}/>
                      <input type="range" min={0} max={lim.max} step={0.5} value={cur}
                        style={{ "--hue": `var(--hue-${g.hue})` }}
                        onChange={(e) => setServing(g.id, Number(e.target.value))}/>
                    </div>
                    <div className="serving-controls">
                      <button className="stepper" onClick={() => setServing(g.id, cur - 0.5)}>−</button>
                      <div className="serving-value">
                        <Counter value={cur} decimals={cur % 1 === 0 ? 0 : 1}/><small>份</small>
                      </div>
                      <button className="stepper" onClick={() => setServing(g.id, cur + 0.5)}>＋</button>
                    </div>
                    <div className="serving-meta">
                      <span>建議 {fmt(tgt)} 份</span>
                      {isCustom ? <span className="delta">{cur > tgt ? "+" : ""}{fmt(cur - tgt)}</span> : <span>已套用建議</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          {/* Macro mini cards */}
          <div className="macro-grid">
            {macros.map((m, i) => (
              <article key={m.id} className="macro-card rise" style={{ "--motion-delay": `${260 + i * 60}ms`, ...hueVars(m.hue) }}>
                <div className="stripe"/>
                <span className="label">{m.label}</span>
                <strong className="grams"><Counter value={m.grams} decimals={0}/> g</strong>
                <span className="meta"><Counter value={m.cal} decimals={0}/> kcal · <Counter value={m.ratio} decimals={1}/>%</span>
              </article>
            ))}
          </div>

          {/* Charts */}
          <article className="card rise" style={{ "--motion-delay": "320ms" }}>
            <div className="card-head">
              <div>
                <span className="eyebrow">圖表　·　Charts</span>
                <h2>三大營養素 與 各類份數</h2>
              </div>
            </div>
            <div className="donut-wrap" style={{ marginBottom: 28 }}>
              <Donut
                segments={macros.map((m) => ({ value: m.cal, color: macroColors[m.id] }))}
                centerValue={<Counter value={Math.round(summary.totalCal)}/>}
                centerLabel="kcal"
              />
              <div className="legend">
                {macros.map((m) => (
                  <div key={m.id} className="legend-row">
                    <span className="swatch" style={{ background: macroColors[m.id] }}/>
                    <span className="name">{m.label}<small><Counter value={Math.round(m.cal)}/> kcal · <Counter value={Math.round(m.grams)}/> g</small></span>
                    <span className="pct"><Counter value={m.ratio} decimals={1}/>%</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ borderTop: "1px solid var(--line-soft)", paddingTop: 22 }}>
              <BarList
                showStatus={false}
                targetOnly={true}
                rows={FOOD_GROUPS.map((g) => ({
                  id: g.id, label: g.label, short: g.short, hue: g.hue,
                  value: servings[g.id], target: recommendation.recommendedServings[g.id],
                  color: `var(--hue-${g.hue})`,
                }))}
              />
            </div>
          </article>

          {/* Export */}
          <article className="card rise" style={{ "--motion-delay": "380ms" }}>
            <div className="card-head">
              <div>
                <span className="eyebrow">匯出　·　Export</span>
                <h2>下載報表與試算表</h2>
              </div>
            </div>
            <p className="note" style={{ marginTop: -6, marginBottom: 16 }}>
              PDF / JPG 為視覺報表；CSV 可直接匯入 Google 試算表；XLS 可在 Excel 開啟。
            </p>
            <div className="export-bar">
              {EXPORT_ACTIONS.map((a) => {
                const isMe = exporting === a.id;
                return (
                  <button
                    key={a.id}
                    className={"export-btn is-" + a.id + (isMe ? " is-loading" : "")}
                    disabled={!!exporting}
                    onClick={() => handleExport(a.id)}
                  >
                    {isMe ? <span className="spinner"/> : <span className="export-tag">{a.icon}</span>}
                    <span className="export-label">{isMe ? "匯出中…" : a.label}</span>
                    {isMe && <span className="progress" style={{ width: `${exportProgress * 100}%` }}/>}
                  </button>
                );
              })}
            </div>
            {exportMsg && (
              <div className={"export-status" + (exportMsg.ok ? "" : " is-error")}>
                <span className="export-status-tag">
                  {exportMsg.ok ? "下載完成" : "匯出失敗"}
                </span>
                <span className="export-status-file">{exportMsg.filename}</span>
                {exportMsg.note && <span className="export-status-note">{exportMsg.note}</span>}
              </div>
            )}
          </article>

          {/* Detail table */}
          <article className="card rise" style={{ "--motion-delay": "420ms" }}>
            <div className="card-head">
              <div>
                <span className="eyebrow">明細　·　Breakdown</span>
                <h2>每類食物計算明細</h2>
              </div>
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>食物類別</th>
                    <th>份數</th>
                    <th>每份 CHO</th>
                    <th>每份 PRO</th>
                    <th>每份 FAT</th>
                    <th>CHO 計算</th>
                    <th>PRO 計算</th>
                    <th>FAT 計算</th>
                    <th>小計熱量</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.rows.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <div className="row-title">
                          <div className="badge" style={{ width: 26, height: 26, fontSize: 12, ...hueVars(r.hue) }}>{r.short}</div>
                          <div>
                            <strong style={{ display: "block" }}>{r.label}</strong>
                            <span style={{ fontSize: 11.5, color: "var(--ink-mute)" }}>{r.description}</span>
                          </div>
                        </div>
                      </td>
                      <td className="num">{fmt(r.servings)}</td>
                      <td className="num">{r.cho} g</td>
                      <td className="num">{r.pro} g</td>
                      <td className="num">{r.fat} g</td>
                      <td className="num">{fmt(r.servings)} × {r.cho} = {fmt(r.choTotal)}</td>
                      <td className="num">{fmt(r.servings)} × {r.pro} = {fmt(r.proTotal)}</td>
                      <td className="num">{fmt(r.servings)} × {r.fat} = {fmt(r.fatTotal)}</td>
                      <td className="num">{Math.round(r.subtotalCalories)} kcal</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>總計</td>
                    <td className="num"><Counter value={FOOD_GROUPS.reduce((a, g) => a + servings[g.id], 0)} decimals={1}/></td>
                    <td/><td/><td/>
                    <td className="num"><Counter value={Math.round(summary.totals.cho)}/> g</td>
                    <td className="num"><Counter value={Math.round(summary.totals.pro)}/> g</td>
                    <td className="num"><Counter value={Math.round(summary.totals.fat)}/> g</td>
                    <td className="num"><Counter value={Math.round(summary.totalCal)}/> kcal</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </article>

          <p className="disclaimer">此結果為估算值，實際飲食仍需依個人健康狀況、運動安排與營養師建議調整。</p>
        </div>
      </section>
    </>
  );
}

function StatCard({ label, value, unit, hint, corner, delay, decimals = 0 }) {
  const isNumeric = typeof value === "number";
  return (
    <article className="stat rise" style={{ "--motion-delay": `${delay}ms` }}>
      <span className="label">{label}</span>
      <strong className={"value" + (isNumeric ? "" : " is-text")}>
        <span key={String(value)} className="value-flip">
          {isNumeric ? <Counter value={value} decimals={decimals}/> : value}
        </span>
        <small>{unit}</small>
      </strong>
      <p className="hint">{hint}</p>
      <span className="corner-mark">{corner}</span>
    </article>
  );
}

function NumField({ label, unit, value, min, max, step, onChange }) {
  return (
    <div className="field">
      <div className="field-label">{label} <span className="unit">{unit}</span></div>
      <div className="numeric">
        <button className="step" onClick={() => onChange(Math.max(min, Math.round((value - step) / step) * step))}>−</button>
        <input type="number" value={value} min={min} max={max} step={step}
          onChange={(e) => { const v = Number(e.target.value); if (Number.isFinite(v)) onChange(Math.min(max, Math.max(min, v))); }}/>
        <button className="step" onClick={() => onChange(Math.min(max, Math.round((value + step) / step) * step))}>＋</button>
      </div>
    </div>
  );
}

window.CalculatorPage = CalculatorPage;
