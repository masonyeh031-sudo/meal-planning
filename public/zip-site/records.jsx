// ===== 7-day Records page =====
const RECORDING_UNIT = 0.5;

const MEALS = [
  { id: "breakfast", label: "早餐", icon: "🌅", tint: "var(--cream-soft)" },
  { id: "lunch",     label: "午餐", icon: "☀️", tint: "var(--orange-soft)" },
  { id: "dinner",    label: "晚餐", icon: "🌙", tint: "var(--blue-soft)" },
  { id: "snack",     label: "點心", icon: "🍪", tint: "var(--green-soft)" },
  { id: "midnight",  label: "宵夜", icon: "🌃", tint: "var(--lilac-soft)" },
];

const DAY_LABELS = ["週一", "週二", "週三", "週四", "週五", "週六", "週日"];
const EXPORT_ACTIONS = [
  { format: "photo", label: "照片卡", icon: "📸" },
  { format: "png", label: "圖片 PNG", icon: "🖼️" },
  { format: "pdf", label: "PDF", icon: "📄" },
  { format: "jpg", label: "JPG", icon: "🧾" },
];
const PDF_A4_WIDTH = 595.28;
const PDF_A4_HEIGHT = 841.89;

function emptyDay() {
  return { breakfast: [], lunch: [], dinner: [], snack: [], midnight: [] };
}
function emptyWeek() {
  return DAY_LABELS.map(() => emptyDay());
}

function loadRecords() {
  try {
    const raw = localStorage.getItem("meal-records-v1");
    if (!raw) return emptyWeek();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== 7) return emptyWeek();
    return parsed;
  } catch { return emptyWeek(); }
}
function saveRecords(w) {
  try { localStorage.setItem("meal-records-v1", JSON.stringify(w)); } catch {}
}

function groupServingKcal(groupId, servings = RECORDING_UNIT) {
  const group = window.NUTRITION.FOOD_GROUPS.find((item) => item.id === groupId);
  if (!group) return 0;
  return Math.round((group.cho * 4 + group.pro * 4 + group.fat * 9) * servings);
}

const QUICK_GROUP_RECORDS = window.NUTRITION.FOOD_GROUPS.map((group) => ({
  name: group.label,
  icon: group.icon,
  amt: `${RECORDING_UNIT} 份`,
  kcal: groupServingKcal(group.id),
  groupId: group.id,
  servings: RECORDING_UNIT,
  desc: group.desc,
}));

const QUICK_FOOD_META = Object.fromEntries(
  QUICK_GROUP_RECORDS.map((food) => [food.name, { groupId: food.groupId, servings: food.servings, icon: food.icon }])
);

function normalizeRecordFood(food) {
  const meta = QUICK_FOOD_META[food.name] || {};
  return {
    ...food,
    groupId: food.groupId || meta.groupId || null,
    servings: Number.isFinite(food.servings) ? food.servings : (Number.isFinite(meta.servings) ? meta.servings : 0),
    icon: food.icon || meta.icon || "🍽️",
  };
}

function sumDayServings(day) {
  const totals = Object.fromEntries(window.NUTRITION.FOOD_GROUPS.map((g) => [g.id, 0]));
  MEALS.forEach((meal) => {
    (day[meal.id] || []).forEach((food) => {
      const normalized = normalizeRecordFood(food);
      if (normalized.groupId && normalized.groupId in totals) {
        totals[normalized.groupId] += normalized.servings || 0;
      }
    });
  });
  return totals;
}

function buildServingChartData(currentServings, targetServings) {
  return window.NUTRITION.FOOD_GROUPS.map((group) => {
    const current = +(currentServings?.[group.id] || 0).toFixed(1);
    const target = +(targetServings?.[group.id] || 0).toFixed(1);
    const delta = +(current - target).toFixed(1);
    return {
      ...group,
      current,
      target,
      delta,
      completion: target > 0 ? current / target : 0,
    };
  });
}

function shortFoodGroupLabel(label) {
  return label.replace("油脂與堅果種子類", "油脂堅果").replace("全穀雜糧類", "全穀").replace("豆魚蛋肉類", "豆魚蛋肉");
}

function formatPercent(value) {
  return `${Math.round(value)}%`;
}

function createFileStamp(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}${month}${day}-${hours}${minutes}`;
}

function resolveCssColor(value, fallback = "#9ed5a4") {
  if (!value) return fallback;
  const trimmed = String(value).trim();
  const match = /^var\((--[^)]+)\)$/.exec(trimmed);
  if (!match) return trimmed;
  const resolved = getComputedStyle(document.documentElement).getPropertyValue(match[1]).trim();
  return resolved || fallback;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("匯出失敗，無法建立檔案。"));
        return;
      }
      resolve(blob);
    }, type, quality);
  });
}

function dataUrlToBytes(dataUrl) {
  const encoded = dataUrl.split(",")[1] ?? "";
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function createPdfBlob(images) {
  const encoder = new TextEncoder();
  const objects = [];
  const pageIds = [];
  let nextId = 3;

  images.forEach((image) => {
    const pageId = nextId;
    const imageId = nextId + 1;
    const contentId = nextId + 2;
    nextId += 3;
    pageIds.push(pageId);

    const drawWidth = PDF_A4_WIDTH;
    const drawHeight = drawWidth * (image.height / image.width);
    const offsetY = Math.max(0, (PDF_A4_HEIGHT - drawHeight) / 2);
    const contentStream = `q
${drawWidth.toFixed(2)} 0 0 ${drawHeight.toFixed(2)} 0 ${offsetY.toFixed(2)} cm
/Im0 Do
Q`;
    const contentBytes = encoder.encode(contentStream);

    objects.push({
      id: pageId,
      chunks: [
        encoder.encode(
          `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_A4_WIDTH.toFixed(2)} ${PDF_A4_HEIGHT.toFixed(2)}] /Resources << /XObject << /Im0 ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`,
        ),
      ],
    });
    objects.push({
      id: imageId,
      chunks: [
        encoder.encode(
          `<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.bytes.length} >>
stream
`,
        ),
        image.bytes,
        encoder.encode(`
endstream`),
      ],
    });
    objects.push({
      id: contentId,
      chunks: [
        encoder.encode(`<< /Length ${contentBytes.length} >>
stream
`),
        contentBytes,
        encoder.encode(`
endstream`),
      ],
    });
  });

  objects.unshift({
    id: 2,
    chunks: [encoder.encode(`<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`)],
  });
  objects.unshift({
    id: 1,
    chunks: [encoder.encode("<< /Type /Catalog /Pages 2 0 R >>")],
  });

  const sortedObjects = [...objects].sort((left, right) => left.id - right.id);
  const maxId = sortedObjects.at(-1)?.id ?? 0;
  const offsets = new Array(maxId + 1).fill(0);
  const parts = [encoder.encode("%PDF-1.4\n")];
  let offset = parts[0].length;

  sortedObjects.forEach((object) => {
    offsets[object.id] = offset;
    const objectHeader = encoder.encode(`${object.id} 0 obj\n`);
    const objectFooter = encoder.encode("\nendobj\n");
    parts.push(objectHeader);
    offset += objectHeader.length;

    object.chunks.forEach((chunk) => {
      parts.push(chunk);
      offset += chunk.length;
    });

    parts.push(objectFooter);
    offset += objectFooter.length;
  });

  const xrefOffset = offset;
  let xref = `xref
0 ${maxId + 1}
0000000000 65535 f
`;

  for (let id = 1; id <= maxId; id += 1) {
    xref += `${String(offsets[id]).padStart(10, "0")} 00000 n
`;
  }

  const trailer = `trailer
<< /Size ${maxId + 1} /Root 1 0 R >>
startxref
${xrefOffset}
%%EOF`;

  parts.push(encoder.encode(xref));
  parts.push(encoder.encode(trailer));

  return new Blob(parts, { type: "application/pdf" });
}

function wrapCanvasText(context, text, maxWidth) {
  const letters = String(text || "").split("");
  const lines = [];
  let currentLine = "";

  for (const letter of letters) {
    const candidate = currentLine + letter;
    if (context.measureText(candidate).width <= maxWidth || currentLine.length === 0) {
      currentLine = candidate;
      continue;
    }
    lines.push(currentLine);
    currentLine = letter;
  }

  if (currentLine) lines.push(currentLine);
  return lines;
}

function drawRoundedRect(context, x, y, width, height, radius, fillStyle, strokeStyle) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
  context.fillStyle = fillStyle;
  context.fill();
  if (strokeStyle) {
    context.strokeStyle = strokeStyle;
    context.lineWidth = 1;
    context.stroke();
  }
}

function buildDailyExportPayload({ dayLabel, day, targetKcal, dayKcal, itemCount, dayServings, recommendedServings }) {
  const now = new Date();
  const chartData = buildServingChartData(dayServings, recommendedServings);
  const meals = MEALS.map((meal) => {
    const list = (day[meal.id] || []).map(normalizeRecordFood);
    const calories = list.reduce((sum, item) => sum + (item.kcal || 0), 0);
    return {
      ...meal,
      calories,
      count: list.length,
      preview: list.slice(0, 3).map((item) => item.name).join("、") || "尚未記錄",
    };
  });

  return {
    fileStamp: createFileStamp(now),
    createdAtLabel: new Intl.DateTimeFormat("zh-TW", { dateStyle: "medium", timeStyle: "short" }).format(now),
    dayLabel,
    dayKcal: Math.round(dayKcal),
    targetKcal: Math.round(targetKcal),
    completion: Math.min(100, Math.round((dayKcal / Math.max(1, targetKcal)) * 100)),
    itemCount,
    meals,
    chartData,
  };
}

async function renderDailyRecordCanvas(payload, variant = "landscape") {
  if ("fonts" in document) {
    await document.fonts.ready;
  }

  const isPortrait = variant === "photo";
  const width = isPortrait ? 1080 : 1600;
  const height = isPortrait ? 2200 : 1080;
  const padding = isPortrait ? 48 : 64;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("無法建立今日紀錄匯出圖檔。");
  }

  const chartMax = Math.max(
    1,
    ...payload.chartData.map((item) => Math.max(item.current, item.target, RECORDING_UNIT)),
  );

  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#fffdf8");
  gradient.addColorStop(1, "#eef6ef");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  context.globalAlpha = 0.18;
  context.fillStyle = "#f7c887";
  context.beginPath();
  context.arc(width - padding - 20, 120, isPortrait ? 120 : 160, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#9fd7ad";
  context.beginPath();
  context.arc(padding + 80, height - 130, isPortrait ? 130 : 180, 0, Math.PI * 2);
  context.fill();
  context.globalAlpha = 1;

  context.fillStyle = "#5f9d78";
  context.font = '700 20px "Noto Sans TC", "PingFang TC", sans-serif';
  context.fillText("Daily Food Journal", padding, padding - 4);

  context.fillStyle = "#203232";
  context.font = isPortrait
    ? '700 48px "Noto Sans TC", "PingFang TC", sans-serif'
    : '700 56px "Noto Sans TC", "PingFang TC", sans-serif';
  context.fillText(`${payload.dayLabel} · 今日飲食摘要`, padding, padding + 54);

  context.fillStyle = "#627172";
  context.font = '500 22px "Noto Sans TC", "PingFang TC", sans-serif';
  wrapCanvasText(
    context,
    `匯出時間 ${payload.createdAtLabel}，整理今日熱量、各餐紀錄與六大類份數進度。`,
    width - padding * 2,
  ).forEach((line, index) => {
    context.fillText(line, padding, padding + 94 + index * 30);
  });

  const metricY = isPortrait ? padding + 150 : padding + 132;
  const metricGap = 18;
  const metricWidth = isPortrait
    ? width - padding * 2
    : (width - padding * 2 - metricGap * 3) / 4;
  const metricHeight = 132;
  const metrics = [
    ["今日熱量", `${payload.dayKcal} kcal`, `目標 ${payload.targetKcal} kcal`],
    ["完成度", `${payload.completion}%`, `共記錄 ${payload.itemCount} 項`],
    ["餐次", `${payload.meals.filter((meal) => meal.count > 0).length} 餐`, "早餐到宵夜的實際紀錄"],
    ["份數重點", `${[...payload.chartData].sort((a, b) => b.current - a.current)[0]?.label || "尚未記錄"}`, "今天份數最高的類別"],
  ];

  metrics.forEach(([label, value, detail], index) => {
    const x = isPortrait ? padding : padding + index * (metricWidth + metricGap);
    const y = isPortrait ? metricY + index * (metricHeight + 14) : metricY;
    drawRoundedRect(context, x, y, metricWidth, metricHeight, 28, "rgba(255,255,255,0.92)", "rgba(31,44,42,0.08)");
    context.fillStyle = "#6a7d79";
    context.font = '700 20px "Noto Sans TC", "PingFang TC", sans-serif';
    context.fillText(label, x + 24, y + 38);
    context.fillStyle = "#203232";
    context.font = '700 34px "Noto Sans TC", "PingFang TC", sans-serif';
    wrapCanvasText(context, value, metricWidth - 48).forEach((line, lineIndex) => {
      context.fillText(line, x + 24, y + 78 + lineIndex * 34);
    });
    context.fillStyle = "#6c7b7b";
    context.font = '500 18px "Noto Sans TC", "PingFang TC", sans-serif';
    wrapCanvasText(context, detail, metricWidth - 48).forEach((line, lineIndex) => {
      context.fillText(line, x + 24, y + 112 + lineIndex * 24);
    });
  });

  const mealPanelY = isPortrait ? metricY + metrics.length * (metricHeight + 14) + 18 : metricY + metricHeight + 28;
  const mealPanelWidth = isPortrait ? width - padding * 2 : width * 0.44 - padding;
  const chartPanelX = isPortrait ? padding : padding + mealPanelWidth + 24;
  const chartPanelWidth = isPortrait ? width - padding * 2 : width - chartPanelX - padding;
  const mealPanelHeight = isPortrait ? 700 : 620;
  const chartPanelHeight = isPortrait ? 590 : 620;

  drawRoundedRect(context, padding, mealPanelY, mealPanelWidth, mealPanelHeight, 32, "rgba(255,255,255,0.92)", "rgba(31,44,42,0.08)");
  context.fillStyle = "#203232";
  context.font = '700 30px "Noto Sans TC", "PingFang TC", sans-serif';
  context.fillText("今日各餐紀錄", padding + 28, mealPanelY + 48);
  context.fillStyle = "#6c7b7b";
  context.font = '500 18px "Noto Sans TC", "PingFang TC", sans-serif';
  context.fillText("每餐的小計熱量與已記錄食物數量。", padding + 28, mealPanelY + 78);

  const mealCardWidth = isPortrait ? mealPanelWidth - 56 : (mealPanelWidth - 84) / 2;
  const mealCardHeight = 100;
  payload.meals.forEach((meal, index) => {
    const x = isPortrait
      ? padding + 28
      : padding + 28 + (index % 2) * (mealCardWidth + 28);
    const y = isPortrait
      ? mealPanelY + 108 + index * (mealCardHeight + 12)
      : mealPanelY + 108 + Math.floor(index / 2) * (mealCardHeight + 14);
    drawRoundedRect(context, x, y, mealCardWidth, mealCardHeight, 24, "rgba(250,249,244,0.98)", "rgba(31,44,42,0.08)");
    context.fillStyle = "#203232";
    context.font = '700 24px "Noto Sans TC", "PingFang TC", sans-serif';
    context.fillText(`${meal.icon} ${meal.label}`, x + 18, y + 34);
    context.fillStyle = "#5a6d69";
    context.font = '700 22px "Noto Sans TC", "PingFang TC", sans-serif';
    context.fillText(`${Math.round(meal.calories)} kcal`, x + 18, y + 66);
    context.fillStyle = "#7a8785";
    context.font = '500 16px "Noto Sans TC", "PingFang TC", sans-serif';
    const preview = meal.count > 0 ? `${meal.count} 項 · ${meal.preview}` : "尚未記錄";
    wrapCanvasText(context, preview, mealCardWidth - 36).slice(0, 2).forEach((line, lineIndex) => {
      context.fillText(line, x + 18, y + 90 + lineIndex * 20);
    });
  });

  drawRoundedRect(context, chartPanelX, mealPanelY, chartPanelWidth, chartPanelHeight, 32, "rgba(255,255,255,0.92)", "rgba(31,44,42,0.08)");
  context.fillStyle = "#203232";
  context.font = '700 30px "Noto Sans TC", "PingFang TC", sans-serif';
  context.fillText("今日各類食物份數", chartPanelX + 28, mealPanelY + 48);
  context.fillStyle = "#6c7b7b";
  context.font = '500 18px "Noto Sans TC", "PingFang TC", sans-serif';
  context.fillText("目前份數、建議份數與進度一併整理。", chartPanelX + 28, mealPanelY + 78);

  const barYStart = mealPanelY + 116;
  payload.chartData.forEach((item, index) => {
    const y = barYStart + index * 72;
    const accent = resolveCssColor(item.accent, "#9ed5a4");
    const tint = resolveCssColor(item.tint, "#eef6ef");
    const barWidth = chartPanelWidth - 240;
    const barX = chartPanelX + 180;
    const currentWidth = item.current > 0 ? Math.max(10, (item.current / chartMax) * barWidth) : 0;
    const targetX = barX + Math.min(barWidth, (item.target / chartMax) * barWidth);

    context.fillStyle = "#203232";
    context.font = '700 20px "Noto Sans TC", "PingFang TC", sans-serif';
    context.fillText(`${item.icon} ${shortFoodGroupLabel(item.label)}`, chartPanelX + 28, y + 24);

    drawRoundedRect(context, barX, y, barWidth, 22, 11, tint, "rgba(31,44,42,0.06)");
    if (currentWidth > 0) {
      drawRoundedRect(context, barX, y, currentWidth, 22, 11, accent);
    }
    context.strokeStyle = "#203232";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(targetX, y - 6);
    context.lineTo(targetX, y + 28);
    context.stroke();

    context.fillStyle = "#5d6f6c";
    context.font = '600 16px "Noto Sans TC", "PingFang TC", sans-serif';
    context.fillText(`${window.NUTRITION.fmt(item.current)} / ${window.NUTRITION.fmt(item.target)} 份`, barX, y + 50);
    context.fillText(
      Math.abs(item.delta) < 0.1
        ? "剛好達標"
        : item.delta >= 0
          ? `多 ${window.NUTRITION.fmt(Math.abs(item.delta))} 份`
          : `少 ${window.NUTRITION.fmt(Math.abs(item.delta))} 份`,
      chartPanelX + chartPanelWidth - 160,
      y + 50,
    );
  });

  return canvas;
}

async function exportDailyRecordSnapshot(format, payload) {
  switch (format) {
    case "photo": {
      const canvas = await renderDailyRecordCanvas(payload, "photo");
      const blob = await canvasToBlob(canvas, "image/jpeg", 0.95);
      const filename = `diet-record-photo-${payload.fileStamp}.jpg`;
      downloadBlob(blob, filename);
      return filename;
    }
    case "png": {
      const canvas = await renderDailyRecordCanvas(payload, "landscape");
      const blob = await canvasToBlob(canvas, "image/png");
      const filename = `diet-record-image-${payload.fileStamp}.png`;
      downloadBlob(blob, filename);
      return filename;
    }
    case "jpg": {
      const canvas = await renderDailyRecordCanvas(payload, "landscape");
      const blob = await canvasToBlob(canvas, "image/jpeg", 0.94);
      const filename = `diet-record-summary-${payload.fileStamp}.jpg`;
      downloadBlob(blob, filename);
      return filename;
    }
    case "pdf": {
      const canvas = await renderDailyRecordCanvas(payload, "landscape");
      const bytes = dataUrlToBytes(canvas.toDataURL("image/jpeg", 0.94));
      const blob = createPdfBlob([{ bytes, width: canvas.width, height: canvas.height }]);
      const filename = `diet-record-summary-${payload.fileStamp}.pdf`;
      downloadBlob(blob, filename);
      return filename;
    }
    default:
      throw new Error("不支援的匯出格式。");
  }
}

function ServingTouchChart({ currentServings, targetServings }) {
  const chartData = useMemo(
    () => buildServingChartData(currentServings, targetServings),
    [currentServings, targetServings],
  );
  const suggestedId = useMemo(() => {
    return [...chartData]
      .sort((left, right) => right.current - left.current || right.target - left.target)[0]?.id
      || chartData[0]?.id
      || "grains";
  }, [chartData]);
  const [activeId, setActiveId] = useState(suggestedId);

  useEffect(() => {
    setActiveId(suggestedId);
  }, [suggestedId]);

  const chartMax = Math.max(
    1,
    ...chartData.map((item) => Math.max(item.current, item.target, RECORDING_UNIT)),
  );
  const activeItem = chartData.find((item) => item.id === activeId) || chartData[0];

  if (!activeItem) return null;

  return (
    <article className="card serving-touch-board">
      <div className="card-eyebrow"><span aria-hidden="true">🫶</span>互動圖表</div>
      <h2 className="card-title">今天哪一類吃得比較多？</h2>
      <p className="card-sub">滑過去或點一下每個色塊，就能看到今天在那一類累積了多少份。</p>

      <div className="serving-touch-detail" style={{ "--std": activeItem.color, "--stt": activeItem.tint }}>
        <div className="serving-touch-badge" aria-hidden="true">{activeItem.icon}</div>
        <div className="serving-touch-copy">
          <span className="serving-touch-kicker">目前選到</span>
          <strong>{activeItem.label}</strong>
          <p>
            今天這一類已累積 <b>{window.NUTRITION.fmt(activeItem.current)} 份</b>，
            建議是 {window.NUTRITION.fmt(activeItem.target)} 份。
          </p>
        </div>
        <div className="serving-touch-metrics">
          <span>{formatPercent(Math.min(activeItem.completion, 1.4) * 100)} 達成度</span>
          <span>
            {Math.abs(activeItem.delta) < 0.1
              ? "剛好達標"
              : activeItem.delta >= 0
                ? `多 ${window.NUTRITION.fmt(Math.abs(activeItem.delta))} 份`
                : `少 ${window.NUTRITION.fmt(Math.abs(activeItem.delta))} 份`}
          </span>
        </div>
      </div>

      <div className="serving-touch-chart" role="list" aria-label="今日各類食物份數互動圖表">
        {chartData.map((item) => {
          const heightPercent = item.current > 0 ? Math.max(10, (item.current / chartMax) * 100) : 0;
          const targetPercent = Math.min(100, (item.target / chartMax) * 100);
          return (
            <button
              key={item.id}
              type="button"
              role="listitem"
              className={"serving-touch-bar" + (item.id === activeId ? " is-active" : "")}
              style={{ "--st": item.accent, "--std": item.color, "--stt": item.tint, "--fill": `${heightPercent}%`, "--target": `${targetPercent}%` }}
              onMouseEnter={() => setActiveId(item.id)}
              onFocus={() => setActiveId(item.id)}
              onClick={() => setActiveId(item.id)}
            >
              <span className="serving-touch-bar-top">{item.icon}</span>
              <span className="serving-touch-track">
                <span className="serving-touch-fill" />
                <span className="serving-touch-target" />
              </span>
              <span className="serving-touch-label">{shortFoodGroupLabel(item.label)}</span>
              <span className="serving-touch-value">{window.NUTRITION.fmt(item.current)} 份</span>
            </button>
          );
        })}
      </div>
    </article>
  );
}

function RecordsPage({ targetKcal, recommendedServings, onToast }) {
  const [week, setWeek] = useState(() => loadRecords());
  const [activeDay, setActiveDay] = useState(0);
  const [activeMeal, setActiveMeal] = useState("breakfast");
  const [exportingFormat, setExportingFormat] = useState(null);

  useEffect(() => { saveRecords(week); }, [week]);

  const day = week[activeDay] || emptyDay();
  const dayKcal = MEALS.reduce((acc, m) => acc + (day[m.id]?.reduce((a, f) => a + (f.kcal || 0), 0) || 0), 0);
  const itemCount = MEALS.reduce((acc, m) => acc + (day[m.id]?.length || 0), 0);
  const completion = Math.min(100, (dayKcal / Math.max(1, targetKcal)) * 100);
  const dayServings = sumDayServings(day);

  function add(food) {
    setWeek(w => {
      const next = w.map((d, i) => i === activeDay ? { ...d } : d);
      const cur = next[activeDay];
      cur[activeMeal] = [...(cur[activeMeal] || []), { ...food, id: Date.now() + Math.random() }];
      return next;
    });
    onToast({ icon: "✨", text: `已加入 ${food.icon} ${food.name}` });
  }
  function remove(mealId, foodId) {
    setWeek(w => {
      const next = w.map((d, i) => i === activeDay ? { ...d } : d);
      const cur = next[activeDay];
      cur[mealId] = (cur[mealId] || []).filter(f => f.id !== foodId);
      return next;
    });
  }
  function clearMeal(mealId) {
    const meal = MEALS.find((item) => item.id === mealId);
    const list = day[mealId] || [];
    if (list.length === 0) return;
    if (!confirm(`確定要清空${meal?.label || "這一餐"}嗎？`)) return;
    setWeek(w => {
      const next = w.map((d, i) => i === activeDay ? { ...d } : d);
      const cur = next[activeDay];
      cur[mealId] = [];
      return next;
    });
    onToast({ icon: "🧹", text: `已清空${meal?.label || "這一餐"}` });
  }

  function dayTotalK(d) {
    return MEALS.reduce((a, m) => a + (d[m.id]?.reduce((x, f) => x + (f.kcal || 0), 0) || 0), 0);
  }

  async function handleExport(format) {
    try {
      setExportingFormat(format);
      const payload = buildDailyExportPayload({
        dayLabel: DAY_LABELS[activeDay],
        day,
        targetKcal,
        dayKcal,
        itemCount,
        dayServings,
        recommendedServings,
      });
      const filename = await exportDailyRecordSnapshot(format, payload);
      onToast({ icon: "💾", text: `已匯出 ${filename}` });
    } catch (error) {
      onToast({ icon: "⚠️", text: error instanceof Error ? error.message : "匯出失敗，請再試一次。" });
    } finally {
      setExportingFormat(null);
    }
  }

  return (
    <>
      <section className="shell guide-hero">
        <SectionTitle
          eyebrow="Diet Records · 七日紀錄"
          title="記下這一週的飲食"
          sub="用六大類快速記錄早餐、午餐、晚餐、點心與宵夜，每按一次就以 0.5 份累計。資料會自動存在你的瀏覽器中。"
        />
      </section>
      <section className="shell records">
        <aside style={{ display: "grid", gap: 12, alignContent: "start" }}>
          <article className="card" style={{ padding: 18 }}>
            <div className="card-eyebrow"><span aria-hidden="true">📅</span>本週</div>
            <h3 className="card-title" style={{ fontSize: 18 }}>選擇日期</h3>
            <div className="day-list" style={{ marginTop: 12 }}>
              {DAY_LABELS.map((d, i) => {
                const k = Math.round(dayTotalK(week[i]));
                return (
                  <button
                    key={i}
                    className={"day-pill" + (activeDay === i ? " is-active" : "")}
                    onClick={() => setActiveDay(i)}
                  >
                    <span className="day-name">{d}</span>
                    <span className="day-meta">{k > 0 ? `${k} kcal` : "未紀錄"}</span>
                  </button>
                );
              })}
            </div>
          </article>

          <article className="card is-tinted-cream" style={{ padding: 18 }}>
            <div className="card-eyebrow"><span aria-hidden="true">📊</span>今日總覽</div>
            <h3 className="card-title" style={{ fontSize: 18 }}>{DAY_LABELS[activeDay]}</h3>
            <div style={{ display: "grid", gap: 14, marginTop: 14 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span style={{ color: "var(--ink-soft)", fontWeight: 700 }}>熱量</span>
                  <span style={{ fontWeight: 700 }}>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 20 }}>{Math.round(dayKcal)}</span>
                    <span style={{ color: "var(--ink-soft)" }}> / {targetKcal} kcal</span>
                  </span>
                </div>
                <div className="stat-bar"><i style={{ width: `${completion}%`, background: "var(--orange)" }} /></div>
                <div style={{ marginTop: 6, fontSize: 12, color: "var(--ink-soft)" }}>
                  完成度 {completion.toFixed(0)}% · 已紀錄 {itemCount} 項
                </div>
              </div>
              <div className="records-summary-note">
                已改成每餐都能個別清空，從下方的早餐、午餐、晚餐、點心、宵夜卡片操作就可以。
              </div>
              <div className="records-export-panel">
                <div className="records-export-title">匯出今日摘要</div>
                <div className="records-export-actions">
                  {EXPORT_ACTIONS.map((action) => {
                    const busy = exportingFormat === action.format;
                    return (
                      <button
                        key={action.format}
                        className="btn records-export-btn"
                        onClick={() => handleExport(action.format)}
                        disabled={exportingFormat !== null}
                      >
                        <span aria-hidden="true">{action.icon}</span>
                        {busy ? "匯出中..." : action.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </article>
        </aside>

        <div className="day-detail">
          <div className="quick-add">
            <div className="quick-add-title">
              <span aria-hidden="true">🥗</span>
              <span>六大類快速記錄 · 每按一次 + {RECORDING_UNIT} 份 到</span>
              <select
                className="select"
                style={{ padding: "4px 28px 4px 10px", fontSize: 12, fontWeight: 700, height: 28, marginLeft: 4 }}
                value={activeMeal}
                onChange={e => setActiveMeal(e.target.value)}
              >
                {MEALS.map(m => <option key={m.id} value={m.id}>{m.icon} {m.label}</option>)}
              </select>
            </div>
            <div className="quick-add-hint">用六大類份數快速累計今天的早餐、午餐、晚餐、點心與宵夜進度。</div>
            <div className="quick-chips">
              {QUICK_GROUP_RECORDS.map(f => (
                <button key={f.name} className="quick-chip" onClick={() => add(f)}>
                  <span className="quick-chip-ico" aria-hidden="true">{f.icon}</span>
                  <span className="quick-chip-main">
                    <span className="quick-chip-name">{f.name}</span>
                    <span className="quick-chip-meta">+ {f.amt} · {f.kcal} kcal</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {MEALS.map(m => {
            const list = day[m.id] || [];
            const k = list.reduce((a, f) => a + (f.kcal || 0), 0);
            return (
              <article key={m.id} className="meal-card">
                <div className="meal-head">
                  <div className="meal-name">
                    <span className="meal-ico" style={{ background: m.tint }}>{m.icon}</span>
                    {m.label}
                  </div>
                  <div className="meal-actions">
                    <span className="meal-kcal">{Math.round(k)} kcal</span>
                    <button
                      className="btn"
                      style={{ padding: "6px 12px", fontSize: 12 }}
                      onClick={() => { setActiveMeal(m.id); }}
                    >
                      <span aria-hidden="true">＋</span>選此餐
                    </button>
                    <button
                      className="btn btn-soft-danger"
                      style={{ padding: "6px 12px", fontSize: 12 }}
                      onClick={() => clearMeal(m.id)}
                      disabled={list.length === 0}
                    >
                      <span aria-hidden="true">🧹</span>清空{m.label}
                    </button>
                  </div>
                </div>
                {list.length === 0 ? (
                  <div className="empty-meal">
                    <span className="ico" aria-hidden="true">{m.icon}</span>
                    {activeDay === 0 && m.id === "breakfast"
                      ? "今天還沒有紀錄，先從早餐開始吧！"
                      : `${m.label}還是空的，點上方六大類快速記錄加入吧。`}
                  </div>
                ) : (
                  <div>
                    {list.map(f => (
                      <div key={f.id} className="food-row">
                        <div className="food-info">
                          <span className="ico" aria-hidden="true">{f.icon}</span>
                          <div>
                            <div className="food-name">{f.name}</div>
                            <div className="food-amt">{f.amt}</div>
                          </div>
                        </div>
                        <span className="food-kcal">{f.kcal} kcal</span>
                        <button className="food-x" onClick={() => remove(m.id, f.id)} aria-label="移除">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            );
          })}

          {window.ServingGuideBoard ? (
            <window.ServingGuideBoard
              targetServings={recommendedServings}
              currentServings={dayServings}
              title="今日各類食物份數"
              subtitle="現在改成每按一次就以 0.5 份累計，圖案也會跟著目前進度慢慢增加。"
              showProgress
            />
          ) : null}

          <ServingTouchChart
            currentServings={dayServings}
            targetServings={recommendedServings}
          />
        </div>
      </section>
    </>
  );
}
window.RecordsPage = RecordsPage;
