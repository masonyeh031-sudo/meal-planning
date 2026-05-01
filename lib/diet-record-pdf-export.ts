import { GOAL_OPTIONS, type UserProfile } from "@/lib/nutrition-calculator";
import type { DietCategoryCoverage, DietWeeklyReview } from "@/lib/diet-record-insights";
import type { DietWeekSummary } from "@/lib/diet-records";

const REPORT_WIDTH = 1600;
const PAGE_PADDING = 72;
const CARD_RADIUS = 28;
const CARD_GAP = 28;
const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;

interface DietComparisonExportInput {
  nutritionProfile: UserProfile | null;
  targetCalories: number | null;
  trackedDaysCount: number;
  daysNearTarget: number;
  daysOverTarget: number;
  daysUnderTarget: number;
  weekDelta: number | null;
  weekSummary: DietWeekSummary;
  categoryCoverage: DietCategoryCoverage[];
  weeklyReview: DietWeeklyReview;
}

interface DietComparisonExportPayload {
  fileStamp: string;
  createdAtLabel: string;
  profileLabel: string;
  goalLabel: string;
  targetCalories: number | null;
  trackedDaysCount: number;
  daysNearTarget: number;
  daysOverTarget: number;
  daysUnderTarget: number;
  weekDelta: number | null;
  weekSummary: DietWeekSummary;
  categoryCoverage: DietCategoryCoverage[];
  weeklyReview: DietWeeklyReview;
}

function formatCalories(value: number) {
  return Math.round(value).toLocaleString("en-US");
}

function formatSignedCalories(value: number) {
  const rounded = Math.round(Math.abs(value)).toLocaleString("en-US");
  return value >= 0 ? `+${rounded} kcal` : `-${rounded} kcal`;
}

function createFileStamp(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}${month}${day}-${hours}${minutes}`;
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

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
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
      new TextEncoder().encode(
        `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`,
      ),
    ],
  });
  objects.unshift({
    id: 1,
    chunks: [new TextEncoder().encode("<< /Type /Catalog /Pages 2 0 R >>")],
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

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  const letters = text.split("");
  const lines: string[] = [];
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
  drawRoundedRect(context, x, y, width, height, CARD_RADIUS, "rgba(255,255,255,0.94)");
  context.fillStyle = "#5f7d72";
  context.font = '700 22px "Noto Sans TC", "PingFang TC", sans-serif';
  context.fillText(label, x + 28, y + 40);

  context.fillStyle = "#203232";
  context.font = '700 38px "Noto Sans TC", "PingFang TC", sans-serif';
  context.fillText(value, x + 28, y + 92);

  context.fillStyle = "#627172";
  context.font = '500 20px "Noto Sans TC", "PingFang TC", sans-serif';
  wrapText(context, detail, width - 56).forEach((line, index) => {
    context.fillText(line, x + 28, y + height - 28 - (1 - index) * 26);
  });
}

function buildPayload(input: DietComparisonExportInput): DietComparisonExportPayload {
  const now = new Date();
  const createdAtLabel = new Intl.DateTimeFormat("zh-TW", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(now);

  const goalLabel =
    input.nutritionProfile !== null
      ? GOAL_OPTIONS.find((option) => option.value === input.nutritionProfile.goal)?.label ?? "維持"
      : "未設定";
  const profileLabel =
    input.nutritionProfile !== null
      ? `${input.nutritionProfile.heightCm} cm / ${input.nutritionProfile.weightKg} kg / ${goalLabel}`
      : "尚未連接個人資料";

  return {
    fileStamp: createFileStamp(now),
    createdAtLabel,
    profileLabel,
    goalLabel,
    targetCalories: input.targetCalories,
    trackedDaysCount: input.trackedDaysCount,
    daysNearTarget: input.daysNearTarget,
    daysOverTarget: input.daysOverTarget,
    daysUnderTarget: input.daysUnderTarget,
    weekDelta: input.weekDelta,
    weekSummary: input.weekSummary,
    categoryCoverage: input.categoryCoverage,
    weeklyReview: input.weeklyReview,
  };
}

async function renderComparisonCanvas(payload: DietComparisonExportPayload) {
  if ("fonts" in document) {
    await document.fonts.ready;
  }

  const reportHeight = 2280;
  const canvas = document.createElement("canvas");
  canvas.width = REPORT_WIDTH;
  canvas.height = reportHeight;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("無法建立飲食紀錄報表。");
  }

  const gradient = context.createLinearGradient(0, 0, REPORT_WIDTH, reportHeight);
  gradient.addColorStop(0, "#fcfefc");
  gradient.addColorStop(1, "#eef5ef");
  context.fillStyle = gradient;
  context.fillRect(0, 0, REPORT_WIDTH, reportHeight);

  context.globalAlpha = 0.18;
  context.fillStyle = "#8cc6a1";
  context.beginPath();
  context.arc(220, 140, 170, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#f5a96b";
  context.beginPath();
  context.arc(1420, 220, 180, 0, Math.PI * 2);
  context.fill();
  context.globalAlpha = 1;

  const contentWidth = REPORT_WIDTH - PAGE_PADDING * 2;

  context.fillStyle = "#5f9d78";
  context.font = '700 20px "Noto Sans TC", "PingFang TC", sans-serif';
  context.fillText("7-Day Food Journal", PAGE_PADDING, 74);

  context.fillStyle = "#203232";
  context.font = '700 56px "Noto Sans TC", "PingFang TC", sans-serif';
  context.fillText("七天熱量對比與飲食評估報表", PAGE_PADDING, 136);

  context.fillStyle = "#627172";
  context.font = '500 24px "Noto Sans TC", "PingFang TC", sans-serif';
  wrapText(
    context,
    "根據七天飲食紀錄，整理每日熱量、建議熱量對比、六大類攝取不足提醒與本週飲食評語。",
    1080,
  ).forEach((line, index) => {
    context.fillText(line, PAGE_PADDING, 182 + index * 32);
  });

  const chips = [
    payload.profileLabel,
    payload.targetCalories !== null
      ? `建議熱量 ${formatCalories(payload.targetCalories)} kcal / 日`
      : "尚未設定每日建議熱量",
    `匯出時間 ${payload.createdAtLabel}`,
  ];

  let chipX = PAGE_PADDING;
  context.font = '600 18px "Noto Sans TC", "PingFang TC", sans-serif';
  chips.forEach((chip) => {
    const chipWidth = context.measureText(chip).width + 36;
    drawRoundedRect(context, chipX, 228, chipWidth, 40, 20, "rgba(255,255,255,0.88)");
    context.fillStyle = "#203232";
    context.fillText(chip, chipX + 18, 254);
    chipX += chipWidth + 12;
  });

  const metricY = 300;
  const metricWidth = (contentWidth - CARD_GAP * 3) / 4;

  drawMetricCard(
    context,
    PAGE_PADDING,
    metricY,
    metricWidth,
    158,
    "七天總熱量",
    `${formatCalories(payload.weekSummary.totalCalories)} kcal`,
    "所有已記錄熱量的七天總和。",
  );
  drawMetricCard(
    context,
    PAGE_PADDING + metricWidth + CARD_GAP,
    metricY,
    metricWidth,
    158,
    "平均每日熱量",
    `${formatCalories(payload.weekSummary.averageCalories)} kcal`,
    "用七天總熱量除以 7。",
  );
  drawMetricCard(
    context,
    PAGE_PADDING + (metricWidth + CARD_GAP) * 2,
    metricY,
    metricWidth,
    158,
    "有效記錄天數",
    `${payload.trackedDaysCount} 天`,
    "只統計有實際熱量紀錄的日期。",
  );
  drawMetricCard(
    context,
    PAGE_PADDING + (metricWidth + CARD_GAP) * 3,
    metricY,
    metricWidth,
    158,
    "與建議總量差距",
    payload.weekDelta !== null ? formatSignedCalories(payload.weekDelta) : "未設定",
    payload.targetCalories !== null
      ? "以每日建議熱量乘上 7 天作為比較基準。"
      : "先到飲食計算器設定個人資料後，這裡才會顯示熱量比較。",
  );

  const compareY = 486;
  const compareWidth = (contentWidth - CARD_GAP * 2) / 3;
  const compareCards = [
    {
      label: "接近建議值",
      value: `${payload.daysNearTarget} 天`,
      detail: "每日熱量與建議值差距在 ±150 kcal 內。",
      tint: "rgba(140,198,161,0.18)",
    },
    {
      label: "高於建議值",
      value: `${payload.daysOverTarget} 天`,
      detail: "代表這幾天的實際熱量明顯高於目標。",
      tint: "rgba(245,169,107,0.18)",
    },
    {
      label: "低於建議值",
      value: `${payload.daysUnderTarget} 天`,
      detail: "代表這幾天的實際熱量明顯低於目標。",
      tint: "rgba(141,190,252,0.18)",
    },
  ];

  compareCards.forEach((card, index) => {
    drawRoundedRect(
      context,
      PAGE_PADDING + index * (compareWidth + CARD_GAP),
      compareY,
      compareWidth,
      130,
      CARD_RADIUS,
      card.tint,
    );
    context.fillStyle = "#203232";
    context.font = '700 22px "Noto Sans TC", "PingFang TC", sans-serif';
    context.fillText(card.label, PAGE_PADDING + index * (compareWidth + CARD_GAP) + 28, compareY + 42);
    context.font = '700 38px "Noto Sans TC", "PingFang TC", sans-serif';
    context.fillText(card.value, PAGE_PADDING + index * (compareWidth + CARD_GAP) + 28, compareY + 92);
    context.fillStyle = "#627172";
    context.font = '500 18px "Noto Sans TC", "PingFang TC", sans-serif';
    wrapText(context, card.detail, compareWidth - 56).forEach((line, lineIndex) => {
      context.fillText(
        line,
        PAGE_PADDING + index * (compareWidth + CARD_GAP) + 28,
        compareY + 118 + lineIndex * 20,
      );
    });
  });

  const chartY = 658;
  drawRoundedRect(
    context,
    PAGE_PADDING,
    chartY,
    contentWidth,
    470,
    CARD_RADIUS,
    "rgba(255,255,255,0.94)",
  );
  context.fillStyle = "#5f9d78";
  context.font = '700 18px "Noto Sans TC", "PingFang TC", sans-serif';
  context.fillText("七天熱量對比", PAGE_PADDING + 28, chartY + 38);
  context.fillStyle = "#203232";
  context.font = '700 32px "Noto Sans TC", "PingFang TC", sans-serif';
  context.fillText("每日實際熱量與建議熱量", PAGE_PADDING + 28, chartY + 82);
  context.fillStyle = "#627172";
  context.font = '500 20px "Noto Sans TC", "PingFang TC", sans-serif';
  context.fillText(
    payload.targetCalories !== null
      ? "藍色區塊代表每日建議熱量位置，綠橘漸層代表實際熱量。"
      : "目前尚未設定每日建議熱量，因此圖表只顯示實際熱量。",
    PAGE_PADDING + 28,
    chartY + 116,
  );

  const maxCalories = Math.max(
    ...payload.weekSummary.dailyTotals.map((day) => day.totalCalories),
    payload.targetCalories ?? 0,
    1,
  );
  let rowY = chartY + 156;

  payload.weekSummary.dailyTotals.forEach((day) => {
    const delta = payload.targetCalories !== null ? day.totalCalories - payload.targetCalories : null;
    context.fillStyle = "#203232";
    context.font = '700 20px "Noto Sans TC", "PingFang TC", sans-serif';
    context.fillText(day.label, PAGE_PADDING + 28, rowY);
    context.fillStyle = "#627172";
    context.font = '500 18px "Noto Sans TC", "PingFang TC", sans-serif';
    context.fillText(day.date || "未設定日期", PAGE_PADDING + 28, rowY + 26);

    const trackX = PAGE_PADDING + 170;
    const trackY = rowY - 12;
    const trackWidth = contentWidth - 410;
    drawRoundedRect(context, trackX, trackY, trackWidth, 18, 9, "#e6efe8");

    if (payload.targetCalories !== null) {
      drawRoundedRect(
        context,
        trackX,
        trackY,
        (payload.targetCalories / maxCalories) * trackWidth,
        18,
        9,
        "rgba(141,190,252,0.22)",
      );
      context.strokeStyle = "rgba(57,104,159,0.58)";
      context.lineWidth = 2;
      const targetX = trackX + (payload.targetCalories / maxCalories) * trackWidth;
      context.beginPath();
      context.moveTo(targetX, trackY - 7);
      context.lineTo(targetX, trackY + 25);
      context.stroke();
    }

    drawRoundedRect(
      context,
      trackX,
      trackY,
      (day.totalCalories / maxCalories) * trackWidth,
      18,
      9,
      "rgba(140,198,161,0.95)",
    );

    context.fillStyle = "#203232";
    context.font = '700 18px "Noto Sans TC", "PingFang TC", sans-serif';
    context.fillText(`${formatCalories(day.totalCalories)} kcal`, PAGE_PADDING + contentWidth - 205, rowY);
    context.fillStyle = "#627172";
    context.font = '500 16px "Noto Sans TC", "PingFang TC", sans-serif';
    context.fillText(
      delta !== null && day.totalCalories > 0 ? formatSignedCalories(delta) : "尚無對比",
      PAGE_PADDING + contentWidth - 205,
      rowY + 24,
    );

    rowY += 42;
  });

  const categoryY = 1164;
  drawRoundedRect(
    context,
    PAGE_PADDING,
    categoryY,
    contentWidth,
    488,
    CARD_RADIUS,
    "rgba(255,255,255,0.94)",
  );
  context.fillStyle = "#5f9d78";
  context.font = '700 18px "Noto Sans TC", "PingFang TC", sans-serif';
  context.fillText("六大類提醒", PAGE_PADDING + 28, categoryY + 38);
  context.fillStyle = "#203232";
  context.font = '700 32px "Noto Sans TC", "PingFang TC", sans-serif';
  context.fillText("攝取不足與分布觀察", PAGE_PADDING + 28, categoryY + 82);

  const reminderCardWidth = (contentWidth - CARD_GAP * 2) / 3;
  const reminderCardHeight = 164;
  payload.categoryCoverage.slice(0, 6).forEach((category, index) => {
    const column = index % 3;
    const row = Math.floor(index / 3);
    const cardX = PAGE_PADDING + column * (reminderCardWidth + CARD_GAP);
    const cardY = categoryY + 118 + row * (reminderCardHeight + 20);
    const tint =
      category.status === "missing"
        ? "rgba(222,120,92,0.12)"
        : category.status === "low"
          ? "rgba(245,169,107,0.14)"
          : category.status === "watch"
            ? "rgba(141,190,252,0.14)"
            : "rgba(140,198,161,0.12)";

    drawRoundedRect(context, cardX, cardY, reminderCardWidth, reminderCardHeight, 22, tint);
    context.fillStyle = category.color;
    context.font = '700 22px "Noto Sans TC", "PingFang TC", sans-serif';
    context.fillText(category.label, cardX + 24, cardY + 38);
    context.fillStyle = "#203232";
    context.font = '700 18px "Noto Sans TC", "PingFang TC", sans-serif';
    context.fillText(
      `${category.dayCount} / ${category.trackedDaysCount || 7} 天`,
      cardX + 24,
      cardY + 68,
    );
    context.fillStyle = "#627172";
    context.font = '500 16px "Noto Sans TC", "PingFang TC", sans-serif';
    wrapText(context, category.message, reminderCardWidth - 48).slice(0, 2).forEach((line, lineIndex) => {
      context.fillText(line, cardX + 24, cardY + 98 + lineIndex * 22);
    });
    context.fillStyle = "#203232";
    context.font = '600 15px "Noto Sans TC", "PingFang TC", sans-serif';
    wrapText(context, `建議：${category.recommendation}`, reminderCardWidth - 48)
      .slice(0, 2)
      .forEach((line, lineIndex) => {
        context.fillText(line, cardX + 24, cardY + 142 + lineIndex * 18);
      });
  });

  const reviewY = 1688;
  drawRoundedRect(
    context,
    PAGE_PADDING,
    reviewY,
    contentWidth,
    414,
    CARD_RADIUS,
    "rgba(255,255,255,0.94)",
  );
  context.fillStyle = "#5f9d78";
  context.font = '700 18px "Noto Sans TC", "PingFang TC", sans-serif';
  context.fillText("本週評語卡", PAGE_PADDING + 28, reviewY + 38);
  context.fillStyle = "#203232";
  context.font = '700 36px "Noto Sans TC", "PingFang TC", sans-serif';
  context.fillText(payload.weeklyReview.title, PAGE_PADDING + 28, reviewY + 88);
  context.fillStyle = "#627172";
  context.font = '500 21px "Noto Sans TC", "PingFang TC", sans-serif';
  wrapText(context, payload.weeklyReview.summary, contentWidth - 56).forEach((line, index) => {
    context.fillText(line, PAGE_PADDING + 28, reviewY + 128 + index * 28);
  });

  let highlightY = reviewY + 196;
  payload.weeklyReview.highlights.forEach((highlight) => {
    context.fillStyle = "#8cc6a1";
    context.beginPath();
    context.arc(PAGE_PADDING + 36, highlightY - 6, 5, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#203232";
    context.font = '600 20px "Noto Sans TC", "PingFang TC", sans-serif';
    wrapText(context, highlight, contentWidth - 92).forEach((line, index) => {
      context.fillText(line, PAGE_PADDING + 54, highlightY + index * 24);
    });
    highlightY += 52;
  });

  drawRoundedRect(
    context,
    PAGE_PADDING + 28,
    reviewY + 306,
    contentWidth - 56,
    78,
    20,
    "rgba(140,198,161,0.12)",
  );
  context.fillStyle = "#203232";
  context.font = '700 18px "Noto Sans TC", "PingFang TC", sans-serif';
  context.fillText("下週建議", PAGE_PADDING + 48, reviewY + 336);
  context.fillStyle = "#627172";
  context.font = '500 18px "Noto Sans TC", "PingFang TC", sans-serif';
  wrapText(context, payload.weeklyReview.nextStep, contentWidth - 112).forEach((line, index) => {
    context.fillText(line, PAGE_PADDING + 48, reviewY + 364 + index * 20);
  });

  drawRoundedRect(
    context,
    PAGE_PADDING,
    reviewY + 442,
    contentWidth,
    92,
    CARD_RADIUS,
    "rgba(95,157,120,0.10)",
  );
  context.fillStyle = "#203232";
  context.font = '600 22px "Noto Sans TC", "PingFang TC", sans-serif';
  context.fillText(
    "此報表為七天飲食紀錄的整理結果，仍建議搭配個人健康狀況與營養師建議調整。",
    PAGE_PADDING + 28,
    reviewY + 494,
  );

  return canvas;
}

export async function exportDietComparisonPdf(input: DietComparisonExportInput) {
  const payload = buildPayload(input);
  const canvas = await renderComparisonCanvas(payload);
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
  const filename = `diet-comparison-report-${payload.fileStamp}.pdf`;
  downloadBlob(blob, filename);
  return filename;
}
