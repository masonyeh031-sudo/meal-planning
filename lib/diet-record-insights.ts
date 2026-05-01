import {
  DIET_RECORD_CATEGORIES,
  type DietCategorySummary,
  type DietDaySummary,
  type DietFoodCategoryId,
  type DietWeekSummary,
} from "@/lib/diet-records";

export interface DietCategoryCoverage {
  categoryId: DietFoodCategoryId;
  label: string;
  color: string;
  softColor: string;
  totalCount: number;
  totalCalories: number;
  dayCount: number;
  trackedDaysCount: number;
  status: "good" | "watch" | "low" | "missing";
  message: string;
  recommendation: string;
}

export interface DietWeeklyReview {
  tone: "balanced" | "over" | "under" | "incomplete";
  title: string;
  summary: string;
  highlights: string[];
  nextStep: string;
}

const CATEGORY_RECOMMENDATIONS: Record<DietFoodCategoryId, string> = {
  grains: "可以把主食平均分散到早餐與午餐，避免整天幾乎沒有全榖雜糧類。",
  protein: "建議在主餐固定安排蛋白質來源，例如雞蛋、豆腐、魚肉或雞胸肉。",
  dairy: "乳品類偏少時，可補進無糖優格、牛奶或高蛋白乳品。",
  vegetables: "蔬菜類偏少時，可優先在午餐與晚餐各補 1 份青菜。",
  fruits: "水果類不足時，可在下午茶或早餐加入一份水果。",
  fats: "油脂與堅果種子類偏少時，可加入少量堅果或好油脂來源。",
};

function formatCalories(value: number) {
  return Math.round(value).toLocaleString("en-US");
}

function buildCoverageMessage(
  label: string,
  status: DietCategoryCoverage["status"],
  dayCount: number,
  trackedDaysCount: number,
) {
  if (trackedDaysCount === 0) {
    return `本週尚未有可用的熱量紀錄，先完成 1 天記錄後會開始分析 ${label}。`;
  }

  if (status === "missing") {
    return `本週 ${trackedDaysCount} 天紀錄中，完全沒有出現 ${label}。`;
  }

  if (status === "low") {
    return `${label} 只出現在 ${dayCount} / ${trackedDaysCount} 天，攝取偏少。`;
  }

  if (status === "watch") {
    return `${label} 出現在 ${dayCount} / ${trackedDaysCount} 天，仍可再穩定一些。`;
  }

  return `${label} 出現在 ${dayCount} / ${trackedDaysCount} 天，整體算穩定。`;
}

function findTopCategory(categoryStats: DietCategorySummary[]) {
  return [...categoryStats]
    .filter((category) => category.count > 0)
    .sort((left, right) => right.count - left.count)[0] ?? null;
}

export function buildDietCategoryCoverage(
  daySummaries: DietDaySummary[],
  trackedDaysCount: number,
) {
  return DIET_RECORD_CATEGORIES.map((category) => {
    let totalCount = 0;
    let totalCalories = 0;
    let dayCount = 0;

    for (const daySummary of daySummaries) {
      const dayCategory = daySummary.categoryStats.find(
        (item) => item.categoryId === category.id,
      );

      if (!dayCategory) {
        continue;
      }

      totalCount += dayCategory.count;
      totalCalories += dayCategory.totalCalories;

      if (dayCategory.count > 0) {
        dayCount += 1;
      }
    }

    let status: DietCategoryCoverage["status"] = "good";

    if (trackedDaysCount === 0) {
      status = "watch";
    } else if (dayCount === 0) {
      status = "missing";
    } else if (dayCount <= Math.max(1, Math.floor(trackedDaysCount / 3))) {
      status = "low";
    } else if (dayCount <= Math.max(1, Math.ceil(trackedDaysCount / 2))) {
      status = "watch";
    }

    return {
      categoryId: category.id,
      label: category.label,
      color: category.color,
      softColor: category.softColor,
      totalCount,
      totalCalories,
      dayCount,
      trackedDaysCount,
      status,
      message: buildCoverageMessage(category.label, status, dayCount, trackedDaysCount),
      recommendation: CATEGORY_RECOMMENDATIONS[category.id],
    } satisfies DietCategoryCoverage;
  }).sort((left, right) => {
    const severityOrder = { missing: 0, low: 1, watch: 2, good: 3 };
    return severityOrder[left.status] - severityOrder[right.status];
  });
}

export function buildDietWeeklyReview(args: {
  weekSummary: DietWeekSummary;
  trackedDaysCount: number;
  targetCalories: number | null;
  daysNearTarget: number;
  daysOverTarget: number;
  daysUnderTarget: number;
  categoryCoverage: DietCategoryCoverage[];
}) {
  const {
    weekSummary,
    trackedDaysCount,
    targetCalories,
    daysNearTarget,
    daysOverTarget,
    daysUnderTarget,
    categoryCoverage,
  } = args;

  if (trackedDaysCount === 0) {
    return {
      tone: "incomplete",
      title: "本週還沒有足夠的飲食紀錄",
      summary: "目前沒有可分析的熱量資料，先從記錄 1 天完整三餐開始。",
      highlights: [
        "完成任一天的早餐、午餐、晚餐紀錄後，就能開始看到趨勢。",
        "先把常吃的主食、蛋白質與蔬果寫進去即可，不需要一次記得非常精細。",
      ],
      nextStep: "先完成至少 1 天的完整紀錄，再回來看熱量對比與六大類提醒。",
    } satisfies DietWeeklyReview;
  }

  const flaggedCategories = categoryCoverage.filter(
    (category) => category.status === "missing" || category.status === "low",
  );
  const topCategory = findTopCategory(weekSummary.categoryStats);
  const categoryWarningText =
    flaggedCategories.length > 0
      ? flaggedCategories
          .slice(0, 2)
          .map((category) => category.label)
          .join("、")
      : "六大類分布大致完整";

  if (targetCalories === null) {
    return {
      tone: "incomplete",
      title: "本週紀錄已建立，但尚未設定建議熱量",
      summary: "你已經開始穩定記錄飲食，接下來建議回到計算器設定身高、體重與目標，才能做熱量對比。",
      highlights: [
        `本週共記錄 ${weekSummary.totalItems} 筆食物，平均每日 ${formatCalories(
          weekSummary.averageCalories,
        )} kcal。`,
        topCategory
          ? `最常出現的類別是 ${topCategory.label}，共 ${topCategory.count} 筆。`
          : "目前尚未統計出主要食物類別。",
        flaggedCategories.length > 0
          ? `目前偏少的類別有 ${categoryWarningText}。`
          : "六大類食物目前都有出現。",
      ],
      nextStep: "先到飲食計算器設定個人資料，之後這裡就會自動顯示每日建議熱量比較。",
    } satisfies DietWeeklyReview;
  }

  if (daysOverTarget > daysUnderTarget && daysOverTarget >= Math.max(2, trackedDaysCount / 2)) {
    return {
      tone: "over",
      title: "本週整體熱量偏高",
      summary: `有 ${daysOverTarget} 天明顯高於建議熱量，整週熱量累積比建議值更高。`,
      highlights: [
        `${daysNearTarget} 天接近建議熱量，代表還是有幾天控制得不錯。`,
        topCategory
          ? `本週最常出現的是 ${topCategory.label}，共 ${topCategory.count} 筆。`
          : "本週已開始建立飲食習慣資料。",
        flaggedCategories.length > 0
          ? `需要補強的類別有 ${categoryWarningText}。`
          : "六大類分布比熱量表現更穩定。",
      ],
      nextStep: "下週可優先檢查點心、飲料或宵夜的熱量，並補足偏少的蔬菜、水果或乳品。",
    } satisfies DietWeeklyReview;
  }

  if (daysUnderTarget > daysOverTarget && daysUnderTarget >= Math.max(2, trackedDaysCount / 2)) {
    return {
      tone: "under",
      title: "本週整體熱量偏低",
      summary: `有 ${daysUnderTarget} 天低於建議熱量較多，若近期活動量高，可能需要補回主食或蛋白質。`,
      highlights: [
        `${daysNearTarget} 天接近建議熱量，代表部分日期的進食節奏仍然穩定。`,
        topCategory
          ? `目前最常出現的是 ${topCategory.label}，共 ${topCategory.count} 筆。`
          : "本週已開始建立飲食習慣資料。",
        flaggedCategories.length > 0
          ? `偏少的類別有 ${categoryWarningText}。`
          : "六大類分布目前沒有明顯缺口。`,
      ],
      nextStep: "若不是刻意減脂，建議把早餐或下午茶補進較穩定的主食、蛋白質與水果來源。",
    } satisfies DietWeeklyReview;
  }

  return {
    tone: "balanced",
    title: "本週熱量節奏大致穩定",
    summary: `${daysNearTarget} 天接近建議熱量，整體比完全偏高或偏低更平衡。`,
    highlights: [
      `平均每日熱量約 ${formatCalories(weekSummary.averageCalories)} kcal。`,
      topCategory
        ? `本週最常出現的類別是 ${topCategory.label}，共 ${topCategory.count} 筆。`
        : "本週已開始建立飲食習慣資料。",
      flaggedCategories.length > 0
        ? `仍可再補強 ${categoryWarningText}。`
        : "六大類食物都有穩定出現。",
    ],
    nextStep: "下週可維持目前熱量節奏，並優先把偏少的食物類別補得更平均。",
  } satisfies DietWeeklyReview;
}
