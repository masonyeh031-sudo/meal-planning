export const DIET_RECORD_CATEGORIES = [
  {
    id: "grains",
    label: "全榖雜糧類",
    color: "#8cc6a1",
    softColor: "#edf7ef",
  },
  {
    id: "protein",
    label: "豆魚蛋肉類",
    color: "#f5a96b",
    softColor: "#fff3e8",
  },
  {
    id: "dairy",
    label: "乳品類",
    color: "#8dbefc",
    softColor: "#edf5ff",
  },
  {
    id: "vegetables",
    label: "蔬菜類",
    color: "#7dcf9a",
    softColor: "#ecfbf1",
  },
  {
    id: "fruits",
    label: "水果類",
    color: "#ffbc77",
    softColor: "#fff5e8",
  },
  {
    id: "fats",
    label: "油脂與堅果種子類",
    color: "#b8b4a7",
    softColor: "#f4f1eb",
  },
] as const;

export const DIET_RECORD_MEALS = [
  { id: "breakfast", label: "早餐" },
  { id: "lunch", label: "午餐" },
  { id: "dinner", label: "晚餐" },
  { id: "afternoonTea", label: "下午茶" },
  { id: "lateNightSnack", label: "宵夜" },
] as const;

export type DietFoodCategoryId = (typeof DIET_RECORD_CATEGORIES)[number]["id"];
export type DietMealId = (typeof DIET_RECORD_MEALS)[number]["id"];

export interface DietFoodEntry {
  id: string;
  name: string;
  amount: string;
  category: DietFoodCategoryId;
  calories: string;
  note: string;
}

export interface DietDayRecord {
  day: number;
  label: string;
  date: string;
  meals: Record<DietMealId, DietFoodEntry[]>;
}

export type DietWeekRecords = DietDayRecord[];

export interface DietCategorySummary {
  categoryId: DietFoodCategoryId;
  label: string;
  color: string;
  softColor: string;
  count: number;
  totalCalories: number;
}

export interface DietDaySummary {
  mealCalories: Record<DietMealId, number>;
  totalCalories: number;
  categoryStats: DietCategorySummary[];
  categoriesConsumed: DietCategorySummary[];
  validItems: number;
  invalidItems: number;
}

export interface DietWeekSummary {
  totalCalories: number;
  averageCalories: number;
  dailyTotals: Array<{
    day: number;
    label: string;
    date: string;
    totalCalories: number;
  }>;
  highestDay: {
    day: number;
    label: string;
    date: string;
    totalCalories: number;
  } | null;
  lowestDay: {
    day: number;
    label: string;
    date: string;
    totalCalories: number;
  } | null;
  categoryStats: DietCategorySummary[];
  totalItems: number;
  invalidItems: number;
}

export type DietRecordExportFormat = "json" | "csv";

const DIET_RECORDS_STORAGE_KEY = "meal-planning:seven-day-diet-records";
const DEFAULT_CATEGORY: DietFoodCategoryId = "grains";

function createRecordId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function toLocalDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function sanitizeString(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return "";
}

function sanitizeDateString(value: unknown, fallback: string) {
  const text = sanitizeString(value);
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : fallback;
}

function isValidCategoryId(value: unknown): value is DietFoodCategoryId {
  return DIET_RECORD_CATEGORIES.some((category) => category.id === value);
}

function createEmptyMeals(): Record<DietMealId, DietFoodEntry[]> {
  return DIET_RECORD_MEALS.reduce(
    (accumulator, meal) => {
      accumulator[meal.id] = [];
      return accumulator;
    },
    {} as Record<DietMealId, DietFoodEntry[]>,
  );
}

function normalizeFoodEntry(value: unknown): DietFoodEntry | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<DietFoodEntry>;

  return {
    id: sanitizeString(candidate.id) || createRecordId("food"),
    name: sanitizeString(candidate.name),
    amount: sanitizeString(candidate.amount),
    category: isValidCategoryId(candidate.category) ? candidate.category : DEFAULT_CATEGORY,
    calories: sanitizeString(candidate.calories),
    note: sanitizeString(candidate.note),
  };
}

function normalizeDayRecord(
  value: unknown,
  index: number,
  fallback: DietDayRecord,
): DietDayRecord {
  if (!value || typeof value !== "object") {
    return fallback;
  }

  const candidate = value as Partial<DietDayRecord>;
  const meals = createEmptyMeals();
  const rawMeals = candidate.meals;

  for (const meal of DIET_RECORD_MEALS) {
    const rawItems =
      rawMeals && typeof rawMeals === "object"
        ? (rawMeals as Partial<Record<DietMealId, unknown>>)[meal.id]
        : [];

    meals[meal.id] = Array.isArray(rawItems)
      ? rawItems
          .map((item) => normalizeFoodEntry(item))
          .filter((item): item is DietFoodEntry => item !== null)
      : [];
  }

  return {
    day:
      typeof candidate.day === "number" && Number.isFinite(candidate.day)
        ? candidate.day
        : index + 1,
    label: sanitizeString(candidate.label) || `Day ${index + 1}`,
    date: sanitizeDateString(candidate.date, fallback.date),
    meals,
  };
}

function createCategorySummaryMap() {
  return DIET_RECORD_CATEGORIES.reduce(
    (accumulator, category) => {
      accumulator[category.id] = {
        categoryId: category.id,
        label: category.label,
        color: category.color,
        softColor: category.softColor,
        count: 0,
        totalCalories: 0,
      };
      return accumulator;
    },
    {} as Record<DietFoodCategoryId, DietCategorySummary>,
  );
}

function isItemTouched(item: DietFoodEntry) {
  return Boolean(
    item.name.trim() || item.amount.trim() || item.calories.trim() || item.note.trim(),
  );
}

function getDownloadFilename(extension: string) {
  return `seven-day-diet-records-${toLocalDateInputValue(new Date())}.${extension}`;
}

function escapeCsvCell(value: string | number) {
  const text = String(value ?? "");

  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function downloadTextFile(filename: string, content: string, mimeType: string) {
  if (typeof window === "undefined") {
    throw new Error("此功能需要在瀏覽器中執行。");
  }

  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const anchor = window.document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

export function createEmptyDietFoodEntry(): DietFoodEntry {
  return {
    id: createRecordId("food"),
    name: "",
    amount: "",
    category: DEFAULT_CATEGORY,
    calories: "",
    note: "",
  };
}

export function createEmptyDietWeekRecords() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);

    return {
      day: index + 1,
      label: `Day ${index + 1}`,
      date: toLocalDateInputValue(date),
      meals: createEmptyMeals(),
    } satisfies DietDayRecord;
  });
}

export function getDietCategoryMeta(categoryId: DietFoodCategoryId) {
  return (
    DIET_RECORD_CATEGORIES.find((category) => category.id === categoryId) ??
    DIET_RECORD_CATEGORIES[0]
  );
}

export function getDietMealLabel(mealId: DietMealId) {
  return DIET_RECORD_MEALS.find((meal) => meal.id === mealId)?.label ?? mealId;
}

export function isValidCaloriesInput(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return false;
  }

  const numericValue = Number(trimmed);
  return Number.isFinite(numericValue) && numericValue >= 0;
}

export function getCaloriesValue(value: string) {
  return isValidCaloriesInput(value) ? Number(value) : 0;
}

export function validateDietFoodEntry(item: Pick<DietFoodEntry, "name" | "calories">) {
  const errors: string[] = [];

  if (!sanitizeString(item.name).trim()) {
    errors.push("食物名稱不能空白");
  }

  if (!isValidCaloriesInput(sanitizeString(item.calories))) {
    errors.push("熱量請輸入有效的數字");
  }

  return errors;
}

export function loadDietWeekRecords() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(DIET_RECORDS_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    const fallback = createEmptyDietWeekRecords();

    return fallback.map((day, index) =>
      normalizeDayRecord(Array.isArray(parsed) ? parsed[index] : null, index, day),
    );
  } catch {
    return null;
  }
}

export function saveDietWeekRecords(records: DietWeekRecords) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DIET_RECORDS_STORAGE_KEY, JSON.stringify(records));
}

export function clearDietWeekRecordsStorage() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(DIET_RECORDS_STORAGE_KEY);
}

export function summarizeDietDay(record: DietDayRecord): DietDaySummary {
  const mealCalories = DIET_RECORD_MEALS.reduce(
    (accumulator, meal) => {
      accumulator[meal.id] = 0;
      return accumulator;
    },
    {} as Record<DietMealId, number>,
  );

  const categoryMap = createCategorySummaryMap();
  let validItems = 0;
  let invalidItems = 0;

  for (const meal of DIET_RECORD_MEALS) {
    for (const item of record.meals[meal.id]) {
      if (!isItemTouched(item)) {
        continue;
      }

      const itemErrors = validateDietFoodEntry(item);
      const calories = getCaloriesValue(item.calories);

      if (itemErrors.length > 0) {
        invalidItems += 1;
      } else {
        validItems += 1;
      }

      if (!item.name.trim()) {
        continue;
      }

      mealCalories[meal.id] += calories;
      categoryMap[item.category].count += 1;
      categoryMap[item.category].totalCalories += calories;
    }
  }

  const categoryStats = DIET_RECORD_CATEGORIES.map((category) => categoryMap[category.id]);
  const totalCalories = Object.values(mealCalories).reduce((sum, value) => sum + value, 0);

  return {
    mealCalories,
    totalCalories,
    categoryStats,
    categoriesConsumed: categoryStats.filter((category) => category.count > 0),
    validItems,
    invalidItems,
  };
}

export function summarizeDietWeek(records: DietWeekRecords): DietWeekSummary {
  const dailySummaries = records.map((record) => summarizeDietDay(record));
  const dailyTotals = records.map((record, index) => ({
    day: record.day,
    label: record.label,
    date: record.date,
    totalCalories: dailySummaries[index].totalCalories,
  }));

  const totalCalories = dailyTotals.reduce((sum, record) => sum + record.totalCalories, 0);
  const averageCalories = records.length > 0 ? totalCalories / records.length : 0;
  const categoryMap = createCategorySummaryMap();

  for (const summary of dailySummaries) {
    for (const category of summary.categoryStats) {
      categoryMap[category.categoryId].count += category.count;
      categoryMap[category.categoryId].totalCalories += category.totalCalories;
    }
  }

  const daysWithCalories = dailyTotals.filter((day) => day.totalCalories > 0);
  const highestDay =
    daysWithCalories.length > 0
      ? daysWithCalories.reduce((current, next) =>
          next.totalCalories > current.totalCalories ? next : current,
        )
      : null;
  const lowestDay =
    daysWithCalories.length > 0
      ? daysWithCalories.reduce((current, next) =>
          next.totalCalories < current.totalCalories ? next : current,
        )
      : null;

  return {
    totalCalories,
    averageCalories,
    dailyTotals,
    highestDay,
    lowestDay,
    categoryStats: DIET_RECORD_CATEGORIES.map((category) => categoryMap[category.id]),
    totalItems: dailySummaries.reduce((sum, summary) => sum + summary.validItems, 0),
    invalidItems: dailySummaries.reduce((sum, summary) => sum + summary.invalidItems, 0),
  };
}

export function buildDietWeekJson(records: DietWeekRecords) {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      records,
      summary: summarizeDietWeek(records),
    },
    null,
    2,
  );
}

export function buildDietWeekCsv(records: DietWeekRecords) {
  const lines = [
    [
      "Day",
      "Date",
      "Meal",
      "FoodName",
      "Amount",
      "Category",
      "Calories",
      "Note",
      "MealSubtotalCalories",
      "DayTotalCalories",
    ].join(","),
  ];

  for (const dayRecord of records) {
    const daySummary = summarizeDietDay(dayRecord);

    for (const meal of DIET_RECORD_MEALS) {
      const mealItems = dayRecord.meals[meal.id].filter((item) => isItemTouched(item));

      for (const item of mealItems) {
        lines.push(
          [
            escapeCsvCell(dayRecord.label),
            escapeCsvCell(dayRecord.date),
            escapeCsvCell(meal.label),
            escapeCsvCell(item.name),
            escapeCsvCell(item.amount),
            escapeCsvCell(getDietCategoryMeta(item.category).label),
            escapeCsvCell(item.calories),
            escapeCsvCell(item.note),
            escapeCsvCell(daySummary.mealCalories[meal.id]),
            escapeCsvCell(daySummary.totalCalories),
          ].join(","),
        );
      }
    }
  }

  return lines.join("\n");
}

export function exportDietWeekRecords(
  format: DietRecordExportFormat,
  records: DietWeekRecords,
) {
  if (format === "json") {
    const filename = getDownloadFilename("json");
    downloadTextFile(filename, buildDietWeekJson(records), "application/json;charset=utf-8");
    return filename;
  }

  const filename = getDownloadFilename("csv");
  downloadTextFile(filename, buildDietWeekCsv(records), "text/csv;charset=utf-8");
  return filename;
}
