import {
  ACTIVITY_OPTIONS,
  FOOD_GROUPS,
  GOAL_OPTIONS,
  SEX_OPTIONS,
  type NutritionRecommendation,
  type NutritionSummary,
  type ServingsPlan,
  type UserProfile,
} from "@/lib/nutrition-calculator";

export type NutritionExportFormat = "pdf" | "jpg" | "google-sheets" | "excel";

interface NutritionExportRow {
  label: string;
  description: string;
  servings: number;
  recommendedServings: number;
  perServingCho: number;
  perServingPro: number;
  perServingFat: number;
  choTotal: number;
  proTotal: number;
  fatTotal: number;
  subtotalCalories: number;
  color: string;
}

interface NutritionExportPayload {
  createdAtLabel: string;
  fileStamp: string;
  profile: {
    heightCm: number;
    weightKg: number;
    age: number;
    sexLabel: string;
    activityLabel: string;
    goalLabel: string;
  };
  recommendation: {
    targetCalories: number;
    bmi: number;
    bmiStatus: string;
  };
  current: {
    totalCalories: number;
    calorieDelta: number;
    totalServings: number;
  };
  macros: Array<{
    label: string;
    grams: number;
    calories: number;
    ratio: number;
    color: string;
  }>;
  rows: NutritionExportRow[];
}

interface NutritionExportInput {
  profile: UserProfile;
  servings: ServingsPlan;
  recommendation: NutritionRecommendation;
  summary: NutritionSummary;
}

const REPORT_WIDTH = 1600;
const PAGE_PADDING = 72;
const CARD_RADIUS = 28;
const CARD_GAP = 28;
const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;

function formatNumber(value: number) {
  if (Number.isInteger(value)) {
    return value.toString();
  }

  return value.toFixed(1);
}

function formatCaloriesDelta(value: number) {
  if (Math.abs(value) < 0.5) {
    return "與建議值接近";
  }

  return value > 0
    ? `高於建議 ${Math.round(value)} kcal`
    : `低於建議 ${Math.round(Math.abs(value))} kcal`;
}

function escapeCsvCell(value: string | number) {
  const text = String(value);
  const escaped = text.replaceAll('"', '""');
  return /[",\n]/.test(text) ? `"${escaped}"` : escaped;
}

function escapeXml(value: string | number) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function getLabel<T extends string>(
  options: Array<{ value: T; label: string }>,
  value: T,
) {
  return options.find((option) => option.value === value)?.label ?? value;
}

function createFileStamp(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}${month}${day}-${hours}${minutes}`;
}

function buildExportPayload({
  profile,
  servings,
  recommendation,
  summary,
}: NutritionExportInput): NutritionExportPayload {
  const now = new Date();
  const createdAtLabel = new Intl.DateTimeFormat("zh-TW", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(now);

  const rows = summary.rows.map((row) => ({
    label: row.label,
    description: row.description,
    servings: row.servings,
    recommendedServings: recommendation.recommendedServings[row.id],
    perServingCho: row.perServing.cho,
    perServingPro: row.perServing.pro,
    perServingFat: row.perServing.fat,
    choTotal: row.choTotal,
    proTotal: row.proTotal,
    fatTotal: row.fatTotal,
    subtotalCalories: row.subtotalCalories,
    color: row.color,
  }));

  return {
    createdAtLabel,
    fileStamp: createFileStamp(now),
    profile: {
      heightCm: profile.heightCm,
      weightKg: profile.weightKg,
      age: profile.age,
      sexLabel: getLabel(SEX_OPTIONS, profile.sex),
      activityLabel: getLabel(ACTIVITY_OPTIONS, profile.activity),
      goalLabel: getLabel(GOAL_OPTIONS, profile.goal),
    },
    recommendation: {
      targetCalories: recommendation.targetCalories,
      bmi: recommendation.bmi,
      bmiStatus: recommendation.bmiStatus,
    },
    current: {
      totalCalories: summary.totalCalories,
      calorieDelta: summary.totalCalories - recommendation.targetCalories,
      totalServings: FOOD_GROUPS.reduce((sum, group) => sum + servings[group.id], 0),
    },
    macros: [
      {
        label: "CHO 碳水",
        grams: summary.totals.cho,
        calories: summary.macroCalories.cho,
        ratio: summary.macroRatios.cho,
        color: "#4f83ff",
      },
      {
        label: "PRO 蛋白質",
        grams: summary.totals.pro,
        calories: summary.macroCalories.pro,
        ratio: summary.macroRatios.pro,
        color: "#4bc4a3",
      },
      {
        label: "FAT 脂肪",
        grams: summary.totals.fat,
        calories: summary.macroCalories.fat,
        ratio: summary.macroRatios.fat,
        color: "#94b3c2",
      },
    ],
    rows,
  };
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  const words = text.split("");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine + word;

    if (context.measureText(candidate).width <= maxWidth || currentLine.length === 0) {
      currentLine = candidate;
      continue;
    }

    lines.push(currentLine);
    currentLine = word;
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function drawRoundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillStyle: string,
  strokeStyle?: string,
) {
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

function drawMetricCard(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  value: string,
  detail: string,
) {
  drawRoundedRect(context, x, y, width, height, CARD_RADIUS, "rgba(255,255,255,0.92)");
  context.fillStyle = "#5a7480";
  context.font = '700 22px "Noto Sans TC", "PingFang TC", sans-serif';
  context.fillText(label, x + 28, y + 40);

  context.fillStyle = "#17313b";
  context.font = '700 40px "Noto Sans TC", "PingFang TC", sans-serif';
  context.fillText(value, x + 28, y + 96);

  context.fillStyle = "#5a7480";
  context.font = '500 22px "Noto Sans TC", "PingFang TC", sans-serif';
  context.fillText(detail, x + 28, y + height - 28);
}

function drawMacroCard(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  item: NutritionExportPayload["macros"][number],
) {
  drawRoundedRect(context, x, y, width, 126, CARD_RADIUS, "rgba(255,255,255,0.92)");
  context.fillStyle = item.color;
  context.font = '700 22px "Noto Sans TC", "PingFang TC", sans-serif';
  context.fillText(item.label, x + 28, y + 42);

  context.fillStyle = "#17313b";
  context.font = '700 42px "Noto Sans TC", "PingFang TC", sans-serif';
  context.fillText(`${Math.round(item.grams)} g`, x + 28, y + 92);

  context.fillStyle = "#5a7480";
  context.font = '500 20px "Noto Sans TC", "PingFang TC", sans-serif';
  context.fillText(
    `${Math.round(item.calories)} kcal / ${item.ratio.toFixed(1)}%`,
    x + width - 220,
    y + 92,
  );
}

function drawDonutChart(
  context: CanvasRenderingContext2D,
  payload: NutritionExportPayload,
  x: number,
  y: number,
  width: number,
) {
  drawRoundedRect(context, x, y, width, 360, CARD_RADIUS, "rgba(255,255,255,0.92)");
  context.fillStyle = "#4f83ff";
  context.font = '700 18px "Noto Sans TC", "PingFang TC", sans-serif';
  context.fillText("圖表", x + 28, y + 38);
  context.fillStyle = "#17313b";
  context.font = '700 32px "Noto Sans TC", "PingFang TC", sans-serif';
  context.fillText("三大營養素比例", x + 28, y + 82);

  const centerX = x + 180;
  const centerY = y + 208;
  const outerRadius = 96;
  const innerRadius = 56;
  const totalCalories = payload.macros.reduce((sum, item) => sum + item.calories, 0);
  let startAngle = -Math.PI / 2;

  payload.macros.forEach((item) => {
    const angle = totalCalories > 0 ? (item.calories / totalCalories) * Math.PI * 2 : 0;
    context.beginPath();
    context.moveTo(centerX, centerY);
    context.arc(centerX, centerY, outerRadius, startAngle, startAngle + angle);
    context.arc(centerX, centerY, innerRadius, startAngle + angle, startAngle, true);
    context.closePath();
    context.fillStyle = item.color;
    context.fill();
    startAngle += angle;
  });

  context.beginPath();
  context.arc(centerX, centerY, innerRadius - 8, 0, Math.PI * 2);
  context.fillStyle = "#ffffff";
  context.fill();

  context.fillStyle = "#17313b";
  context.textAlign = "center";
  context.font = '700 32px "Noto Sans TC", "PingFang TC", sans-serif';
  context.fillText(`${Math.round(payload.current.totalCalories)}`, centerX, centerY - 6);
  context.fillStyle = "#5a7480";
  context.font = '500 18px "Noto Sans TC", "PingFang TC", sans-serif';
  context.fillText("kcal", centerX, centerY + 24);
  context.textAlign = "left";

  let legendY = y + 128;
  payload.macros.forEach((item) => {
    context.fillStyle = item.color;
    context.beginPath();
    context.arc(x + 322, legendY - 8, 8, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#17313b";
    context.font = '700 22px "Noto Sans TC", "PingFang TC", sans-serif';
    context.fillText(item.label, x + 342, legendY);
    context.fillStyle = "#5a7480";
    context.font = '500 20px "Noto Sans TC", "PingFang TC", sans-serif';
    context.fillText(
      `${Math.round(item.grams)} g / ${item.ratio.toFixed(1)}%`,
      x + 342,
      legendY + 30,
    );
    legendY += 72;
  });
}

function drawServingChart(
  context: CanvasRenderingContext2D,
  payload: NutritionExportPayload,
  x: number,
  y: number,
  width: number,
) {
  drawRoundedRect(context, x, y, width, 360, CARD_RADIUS, "rgba(255,255,255,0.92)");
  context.fillStyle = "#4f83ff";
  context.font = '700 18px "Noto Sans TC", "PingFang TC", sans-serif';
  context.fillText("圖表", x + 28, y + 38);
  context.fillStyle = "#17313b";
  context.font = '700 32px "Noto Sans TC", "PingFang TC", sans-serif';
  context.fillText("各類食物份數", x + 28, y + 82);

  const maxValue = Math.max(
    1,
    ...payload.rows.flatMap((row) => [row.servings, row.recommendedServings]),
  );

  let currentY = y + 126;
  payload.rows.forEach((row) => {
    context.fillStyle = "#17313b";
    context.font = '700 20px "Noto Sans TC", "PingFang TC", sans-serif';
    context.fillText(row.label, x + 28, currentY);
    context.fillStyle = "#5a7480";
    context.font = '500 18px "Noto Sans TC", "PingFang TC", sans-serif';
    context.fillText(
      `目前 ${formatNumber(row.servings)} 份 / 建議 ${formatNumber(row.recommendedServings)} 份`,
      x + width - 320,
      currentY,
    );

    const trackX = x + 28;
    const trackY = currentY + 16;
    const trackWidth = width - 56;
    drawRoundedRect(context, trackX, trackY, trackWidth, 18, 9, "#e6eef3");
    drawRoundedRect(
      context,
      trackX,
      trackY,
      (row.recommendedServings / maxValue) * trackWidth,
      18,
      9,
      "rgba(79,131,255,0.15)",
    );
    drawRoundedRect(
      context,
      trackX,
      trackY,
      (row.servings / maxValue) * trackWidth,
      18,
      9,
      row.color,
    );

    currentY += 42;
  });
}

function drawTable(
  context: CanvasRenderingContext2D,
  payload: NutritionExportPayload,
  x: number,
  y: number,
  width: number,
) {
  const rowHeight = 56;
  const titleHeight = 92;
  const tableHeaderHeight = 52;
  const footerHeight = 62;
  const tableHeight =
    titleHeight + tableHeaderHeight + payload.rows.length * rowHeight + footerHeight;

  drawRoundedRect(context, x, y, width, tableHeight, CARD_RADIUS, "rgba(255,255,255,0.92)");
  context.fillStyle = "#4f83ff";
  context.font = '700 18px "Noto Sans TC", "PingFang TC", sans-serif';
  context.fillText("明細表", x + 28, y + 38);
  context.fillStyle = "#17313b";
  context.font = '700 32px "Noto Sans TC", "PingFang TC", sans-serif';
  context.fillText("每類食物計算明細", x + 28, y + 82);

  const columns = [
    { label: "食物類別", width: 214 },
    { label: "目前 / 建議份數", width: 124 },
    { label: "每份 CHO", width: 90 },
    { label: "每份 PRO", width: 90 },
    { label: "每份 FAT", width: 90 },
    { label: "CHO 計算", width: 150 },
    { label: "PRO 計算", width: 150 },
    { label: "FAT 計算", width: 150 },
    { label: "小計熱量", width: 130 },
  ];

  const tableX = x + 28;
  const tableY = y + titleHeight;
  const totalTableWidth = columns.reduce((sum, column) => sum + column.width, 0);
  const scale = Math.min(1, (width - 56) / totalTableWidth);
  let currentX = tableX;

  drawRoundedRect(
    context,
    tableX,
    tableY,
    totalTableWidth * scale,
    tableHeaderHeight,
    16,
    "#f2f7fa",
  );

  context.fillStyle = "#5a7480";
  context.font = '700 16px "Noto Sans TC", "PingFang TC", sans-serif';
  columns.forEach((column) => {
    context.fillText(column.label, currentX + 12, tableY + 32);
    currentX += column.width * scale;
  });

  let rowY = tableY + tableHeaderHeight;
  payload.rows.forEach((row, index) => {
    if (index % 2 === 0) {
      context.fillStyle = "rgba(243,249,251,0.8)";
      context.fillRect(tableX, rowY, totalTableWidth * scale, rowHeight);
    }

    currentX = tableX;
    context.fillStyle = row.color;
    context.beginPath();
    context.arc(currentX + 10, rowY + rowHeight / 2, 6, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#17313b";
    context.font = '700 18px "Noto Sans TC", "PingFang TC", sans-serif';
    context.fillText(row.label, currentX + 24, rowY + 24);
    context.fillStyle = "#5a7480";
    context.font = '500 14px "Noto Sans TC", "PingFang TC", sans-serif';
    context.fillText(row.description, currentX + 24, rowY + 44);

    currentX += columns[0].width * scale;
    context.fillStyle = "#17313b";
    context.font = '500 16px "Noto Sans TC", "PingFang TC", sans-serif';
    context.fillText(
      `${formatNumber(row.servings)} / ${formatNumber(row.recommendedServings)}`,
      currentX + 12,
      rowY + 34,
    );
    currentX += columns[1].width * scale;

    const values = [
      `${row.perServingCho} g`,
      `${row.perServingPro} g`,
      `${row.perServingFat} g`,
      `${formatNumber(row.servings)} × ${row.perServingCho} = ${formatNumber(row.choTotal)}`,
      `${formatNumber(row.servings)} × ${row.perServingPro} = ${formatNumber(row.proTotal)}`,
      `${formatNumber(row.servings)} × ${row.perServingFat} = ${formatNumber(row.fatTotal)}`,
      `${Math.round(row.subtotalCalories)} kcal`,
    ];

    values.forEach((value, valueIndex) => {
      context.fillText(value, currentX + 12, rowY + 34);
      currentX += columns[valueIndex + 2].width * scale;
    });

    rowY += rowHeight;
  });

  context.fillStyle = "#e6eef3";
  context.fillRect(tableX, rowY, totalTableWidth * scale, footerHeight);
  context.fillStyle = "#17313b";
  context.font = '700 18px "Noto Sans TC", "PingFang TC", sans-serif';
  context.fillText("總計", tableX + 12, rowY + 34);
  context.font = '700 16px "Noto Sans TC", "PingFang TC", sans-serif';
  context.fillText(
    `${formatNumber(payload.current.totalServings)} 份`,
    tableX + columns[0].width * scale + 12,
    rowY + 34,
  );

  const totalStartX =
    tableX + (columns[0].width + columns[1].width) * scale;
  const totalValues = [
    `${Math.round(payload.macros[0].grams)} g`,
    `${Math.round(payload.macros[1].grams)} g`,
    `${Math.round(payload.macros[2].grams)} g`,
    `${Math.round(payload.macros[0].calories)} kcal`,
    `${Math.round(payload.macros[1].calories)} kcal`,
    `${Math.round(payload.macros[2].calories)} kcal`,
    `${Math.round(payload.current.totalCalories)} kcal`,
  ];

  currentX = totalStartX;
  totalValues.forEach((value, index) => {
    context.fillText(value, currentX + 12, rowY + 34);
    currentX += columns[index + 2].width * scale;
  });

  return tableHeight;
}

async function renderReportCanvas(payload: NutritionExportPayload) {
  if ("fonts" in document) {
    await document.fonts.ready;
  }

  const chartY = 614;
  const tableY = 1010;
  const tableHeight = 92 + 52 + payload.rows.length * 56 + 62;
  const footerY = tableY + tableHeight + 40;
  const reportHeight = footerY + 140;
  const canvas = document.createElement("canvas");
  canvas.width = REPORT_WIDTH;
  canvas.height = reportHeight;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("無法建立匯出畫布。");
  }

  const gradient = context.createLinearGradient(0, 0, REPORT_WIDTH, reportHeight);
  gradient.addColorStop(0, "#fcfeff");
  gradient.addColorStop(1, "#eef7f8");
  context.fillStyle = gradient;
  context.fillRect(0, 0, REPORT_WIDTH, reportHeight);

  context.globalAlpha = 0.18;
  context.fillStyle = "#4f83ff";
  context.beginPath();
  context.arc(220, 120, 170, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#4bc4a3";
  context.beginPath();
  context.arc(1410, 160, 160, 0, Math.PI * 2);
  context.fill();
  context.globalAlpha = 1;

  const contentWidth = REPORT_WIDTH - PAGE_PADDING * 2;

  context.fillStyle = "#4f83ff";
  context.font = '700 20px "Noto Sans TC", "PingFang TC", sans-serif';
  context.fillText("Daily Nutrition Planner", PAGE_PADDING, 74);

  context.fillStyle = "#17313b";
  context.font = '700 56px "Noto Sans TC", "PingFang TC", sans-serif';
  context.fillText("每日飲食份數與營養素計算器", PAGE_PADDING, 136);

  context.fillStyle = "#5a7480";
  context.font = '500 24px "Noto Sans TC", "PingFang TC", sans-serif';
  wrapText(
    context,
    "依照身高、體重、年齡、性別、活動量與目標，自動估算每日建議熱量、六大類飲食份數與三大營養素。",
    980,
  ).forEach((line, index) => {
    context.fillText(line, PAGE_PADDING, 182 + index * 32);
  });

  const chips = [
    `${payload.profile.heightCm} cm / ${payload.profile.weightKg} kg`,
    payload.profile.goalLabel,
    payload.profile.activityLabel,
    `匯出時間 ${payload.createdAtLabel}`,
  ];

  let chipX = PAGE_PADDING;
  chips.forEach((chip) => {
    context.font = '600 18px "Noto Sans TC", "PingFang TC", sans-serif';
    const chipWidth = context.measureText(chip).width + 36;
    drawRoundedRect(context, chipX, 222, chipWidth, 40, 20, "rgba(255,255,255,0.84)");
    context.fillStyle = "#17313b";
    context.fillText(chip, chipX + 18, 248);
    chipX += chipWidth + 12;
  });

  const statCardY = 294;
  const statCardWidth = (contentWidth - CARD_GAP * 3) / 4;

  drawMetricCard(
    context,
    PAGE_PADDING,
    statCardY,
    statCardWidth,
    168,
    "每日建議熱量",
    `${payload.recommendation.targetCalories} kcal`,
    `${payload.profile.goalLabel}模式`,
  );
  drawMetricCard(
    context,
    PAGE_PADDING + (statCardWidth + CARD_GAP),
    statCardY,
    statCardWidth,
    168,
    "目前份數總熱量",
    `${Math.round(payload.current.totalCalories)} kcal`,
    formatCaloriesDelta(payload.current.calorieDelta),
  );
  drawMetricCard(
    context,
    PAGE_PADDING + (statCardWidth + CARD_GAP) * 2,
    statCardY,
    statCardWidth,
    168,
    "BMI",
    `${payload.recommendation.bmi.toFixed(1)}`,
    payload.recommendation.bmiStatus,
  );
  drawMetricCard(
    context,
    PAGE_PADDING + (statCardWidth + CARD_GAP) * 3,
    statCardY,
    statCardWidth,
    168,
    "基本資料",
    `${payload.profile.sexLabel} / ${payload.profile.age} 歲`,
    payload.profile.activityLabel,
  );

  const macroY = 490;
  const macroWidth = (contentWidth - CARD_GAP * 2) / 3;
  payload.macros.forEach((item, index) => {
    drawMacroCard(
      context,
      PAGE_PADDING + index * (macroWidth + CARD_GAP),
      macroY,
      macroWidth,
      item,
    );
  });

  drawDonutChart(context, payload, PAGE_PADDING, chartY, 540);
  drawServingChart(context, payload, PAGE_PADDING + 540 + CARD_GAP, chartY, 888);
  drawTable(context, payload, PAGE_PADDING, tableY, contentWidth);

  drawRoundedRect(
    context,
    PAGE_PADDING,
    footerY,
    contentWidth,
    92,
    CARD_RADIUS,
    "rgba(79,131,255,0.10)",
  );
  context.fillStyle = "#17313b";
  context.font = '600 22px "Noto Sans TC", "PingFang TC", sans-serif';
  context.fillText(
    "此結果為估算值，實際飲食仍需依個人健康狀況、運動安排與營養師建議調整。",
    PAGE_PADDING + 28,
    footerY + 52,
  );

  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("無法建立匯出檔案。"));
        return;
      }

      resolve(blob);
    }, type, quality);
  });
}

function dataUrlToBytes(dataUrl: string) {
  const encoded = dataUrl.split(",")[1] ?? "";
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function createPdfBlob(images: Array<{ bytes: Uint8Array; width: number; height: number }>) {
  const encoder = new TextEncoder();
  const objects: Array<{ id: number; chunks: Uint8Array[] }> = [];
  const pageIds: number[] = [];
  let nextId = 3;

  images.forEach((image) => {
    const pageId = nextId;
    const imageId = nextId + 1;
    const contentId = nextId + 2;
    nextId += 3;
    pageIds.push(pageId);

    const drawWidth = A4_WIDTH;
    const drawHeight = drawWidth * (image.height / image.width);
    const offsetY = Math.max(0, (A4_HEIGHT - drawHeight) / 2);
    const contentStream = `q
${drawWidth.toFixed(2)} 0 0 ${drawHeight.toFixed(2)} 0 ${offsetY.toFixed(2)} cm
/Im0 Do
Q`;
    const contentBytes = encoder.encode(contentStream);

    objects.push({
      id: pageId,
      chunks: [
        encoder.encode(
          `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${A4_WIDTH.toFixed(
            2,
          )} ${A4_HEIGHT.toFixed(
            2,
          )}] /Resources << /XObject << /Im0 ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`,
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
    chunks: [
      encoder.encode(
        `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`,
      ),
    ],
  });
  objects.unshift({
    id: 1,
    chunks: [encoder.encode("<< /Type /Catalog /Pages 2 0 R >>")],
  });

  const sortedObjects = [...objects].sort((left, right) => left.id - right.id);
  const maxId = sortedObjects.at(-1)?.id ?? 0;
  const offsets = new Array<number>(maxId + 1).fill(0);
  const parts: Uint8Array[] = [encoder.encode("%PDF-1.4\n")];
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

async function exportAsJpg(payload: NutritionExportPayload) {
  const canvas = await renderReportCanvas(payload);
  const blob = await canvasToBlob(canvas, "image/jpeg", 0.94);
  const filename = `nutrition-report-${payload.fileStamp}.jpg`;
  downloadBlob(blob, filename);
  return filename;
}

async function exportAsPdf(payload: NutritionExportPayload) {
  const canvas = await renderReportCanvas(payload);
  const sliceHeight = Math.floor(canvas.width * (A4_HEIGHT / A4_WIDTH));
  const pages: Array<{ bytes: Uint8Array; width: number; height: number }> = [];
  let sourceY = 0;

  while (sourceY < canvas.height) {
    const currentHeight = Math.min(sliceHeight, canvas.height - sourceY);
    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvas.width;
    pageCanvas.height = currentHeight;
    const pageContext = pageCanvas.getContext("2d");

    if (!pageContext) {
      throw new Error("無法建立 PDF 頁面。");
    }

    pageContext.fillStyle = "#ffffff";
    pageContext.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
    pageContext.drawImage(
      canvas,
      0,
      sourceY,
      canvas.width,
      currentHeight,
      0,
      0,
      pageCanvas.width,
      pageCanvas.height,
    );

    pages.push({
      bytes: dataUrlToBytes(pageCanvas.toDataURL("image/jpeg", 0.92)),
      width: pageCanvas.width,
      height: pageCanvas.height,
    });

    sourceY += currentHeight;
  }

  const blob = createPdfBlob(pages);
  const filename = `nutrition-report-${payload.fileStamp}.pdf`;
  downloadBlob(blob, filename);
  return filename;
}

function buildCsvContent(payload: NutritionExportPayload) {
  const rows = [
    ["每日飲食份數與營養素計算器"],
    ["匯出時間", payload.createdAtLabel],
    [],
    ["個人資料"],
    ["身高 (cm)", payload.profile.heightCm],
    ["體重 (kg)", payload.profile.weightKg],
    ["年齡", payload.profile.age],
    ["性別", payload.profile.sexLabel],
    ["活動量", payload.profile.activityLabel],
    ["飲食目標", payload.profile.goalLabel],
    [],
    ["結果摘要"],
    ["每日建議熱量 (kcal)", payload.recommendation.targetCalories],
    ["目前總熱量 (kcal)", Math.round(payload.current.totalCalories)],
    ["熱量差距", formatCaloriesDelta(payload.current.calorieDelta)],
    ["BMI", payload.recommendation.bmi.toFixed(1)],
    ["BMI 狀態", payload.recommendation.bmiStatus],
    [],
    ["三大營養素", "克數 (g)", "熱量 (kcal)", "比例"],
    ...payload.macros.map((item) => [
      item.label,
      Math.round(item.grams),
      Math.round(item.calories),
      `${item.ratio.toFixed(1)}%`,
    ]),
    [],
    [
      "食物類別",
      "說明",
      "目前份數",
      "建議份數",
      "每份 CHO",
      "每份 PRO",
      "每份 FAT",
      "CHO 總量",
      "PRO 總量",
      "FAT 總量",
      "小計熱量",
    ],
    ...payload.rows.map((row) => [
      row.label,
      row.description,
      formatNumber(row.servings),
      formatNumber(row.recommendedServings),
      row.perServingCho,
      row.perServingPro,
      row.perServingFat,
      formatNumber(row.choTotal),
      formatNumber(row.proTotal),
      formatNumber(row.fatTotal),
      Math.round(row.subtotalCalories),
    ]),
    [
      "總計",
      "",
      formatNumber(payload.current.totalServings),
      "",
      "",
      "",
      "",
      Math.round(payload.macros[0].grams),
      Math.round(payload.macros[1].grams),
      Math.round(payload.macros[2].grams),
      Math.round(payload.current.totalCalories),
    ],
  ];

  return `\uFEFF${rows
    .map((row) => row.map((cell) => escapeCsvCell(cell ?? "")).join(","))
    .join("\n")}`;
}

async function exportAsGoogleSheets(payload: NutritionExportPayload) {
  const blob = new Blob([buildCsvContent(payload)], {
    type: "text/csv;charset=utf-8",
  });
  const filename = `nutrition-report-google-sheets-${payload.fileStamp}.csv`;
  downloadBlob(blob, filename);
  return filename;
}

function buildExcelWorksheet(name: string, rows: Array<Array<string | number>>) {
  const xmlRows = rows
    .map((row) => {
      const xmlCells = row
        .map((cell) => {
          const value = String(cell);
          const type = Number.isFinite(Number(value)) && value.trim() !== "" ? "Number" : "String";
          return `<Cell><Data ss:Type="${type}">${escapeXml(value)}</Data></Cell>`;
        })
        .join("");

      return `<Row>${xmlCells}</Row>`;
    })
    .join("");

  return `<Worksheet ss:Name="${escapeXml(name)}"><Table>${xmlRows}</Table></Worksheet>`;
}

function buildExcelContent(payload: NutritionExportPayload) {
  const summaryRows: Array<Array<string | number>> = [
    ["每日飲食份數與營養素計算器"],
    ["匯出時間", payload.createdAtLabel],
    [],
    ["身高 (cm)", payload.profile.heightCm],
    ["體重 (kg)", payload.profile.weightKg],
    ["年齡", payload.profile.age],
    ["性別", payload.profile.sexLabel],
    ["活動量", payload.profile.activityLabel],
    ["飲食目標", payload.profile.goalLabel],
    ["每日建議熱量 (kcal)", payload.recommendation.targetCalories],
    ["目前總熱量 (kcal)", Math.round(payload.current.totalCalories)],
    ["熱量差距", formatCaloriesDelta(payload.current.calorieDelta)],
    ["BMI", payload.recommendation.bmi.toFixed(1)],
    ["BMI 狀態", payload.recommendation.bmiStatus],
    [],
    ["三大營養素", "克數 (g)", "熱量 (kcal)", "比例"],
    ...payload.macros.map((item) => [
      item.label,
      Math.round(item.grams),
      Math.round(item.calories),
      `${item.ratio.toFixed(1)}%`,
    ]),
  ];

  const detailRows: Array<Array<string | number>> = [
    [
      "食物類別",
      "說明",
      "目前份數",
      "建議份數",
      "每份 CHO",
      "每份 PRO",
      "每份 FAT",
      "CHO 總量",
      "PRO 總量",
      "FAT 總量",
      "小計熱量",
    ],
    ...payload.rows.map((row) => [
      row.label,
      row.description,
      formatNumber(row.servings),
      formatNumber(row.recommendedServings),
      row.perServingCho,
      row.perServingPro,
      row.perServingFat,
      formatNumber(row.choTotal),
      formatNumber(row.proTotal),
      formatNumber(row.fatTotal),
      Math.round(row.subtotalCalories),
    ]),
    [
      "總計",
      "",
      formatNumber(payload.current.totalServings),
      "",
      "",
      "",
      "",
      Math.round(payload.macros[0].grams),
      Math.round(payload.macros[1].grams),
      Math.round(payload.macros[2].grams),
      Math.round(payload.current.totalCalories),
    ],
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook
  xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:html="http://www.w3.org/TR/REC-html40"
>
  ${buildExcelWorksheet("摘要", summaryRows)}
  ${buildExcelWorksheet("飲食份數明細", detailRows)}
</Workbook>`;
}

async function exportAsExcel(payload: NutritionExportPayload) {
  const blob = new Blob([buildExcelContent(payload)], {
    type: "application/vnd.ms-excel;charset=utf-8",
  });
  const filename = `nutrition-report-${payload.fileStamp}.xls`;
  downloadBlob(blob, filename);
  return filename;
}

export async function exportNutritionReport(
  format: NutritionExportFormat,
  input: NutritionExportInput,
) {
  const payload = buildExportPayload(input);

  switch (format) {
    case "jpg":
      return exportAsJpg(payload);
    case "pdf":
      return exportAsPdf(payload);
    case "google-sheets":
      return exportAsGoogleSheets(payload);
    case "excel":
      return exportAsExcel(payload);
    default:
      throw new Error("不支援的匯出格式。");
  }
}

