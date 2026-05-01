export type Sex = "male" | "female";
export type ActivityLevel = "low" | "medium" | "high";
export type Goal = "cut" | "maintain" | "bulk";

export interface UserProfile {
  heightCm: number;
  weightKg: number;
  age: number;
  sex: Sex;
  activity: ActivityLevel;
  goal: Goal;
}

export const SEX_OPTIONS: Array<{ value: Sex; label: string }> = [
  { value: "male", label: "男性" },
  { value: "female", label: "女性" },
];

export const ACTIVITY_OPTIONS: Array<{ value: ActivityLevel; label: string }> = [
  { value: "low", label: "低活動量" },
  { value: "medium", label: "中活動量" },
  { value: "high", label: "高活動量" },
];

export const GOAL_OPTIONS: Array<{ value: Goal; label: string; calorieFactor: number }> = [
  { value: "cut", label: "減脂", calorieFactor: 25 },
  { value: "maintain", label: "維持", calorieFactor: 30 },
  { value: "bulk", label: "增肌", calorieFactor: 35 },
];

export const FOOD_GROUPS = [
  {
    id: "grains",
    label: "全穀根莖類",
    description: "飯、麵、地瓜、燕麥",
    cho: 15,
    pro: 2,
    fat: 0,
    color: "#4f83ff",
  },
  {
    id: "dairy",
    label: "奶類",
    description: "牛奶、優格、起司",
    cho: 12,
    pro: 8,
    fat: 8,
    color: "#6ec9ff",
  },
  {
    id: "protein",
    label: "豆魚肉蛋類",
    description: "豆腐、魚、肉、蛋",
    cho: 0,
    pro: 7,
    fat: 5,
    color: "#4bc4a3",
  },
  {
    id: "vegetables",
    label: "蔬菜類",
    description: "深色與淺色蔬菜",
    cho: 5,
    pro: 1,
    fat: 0,
    color: "#74d58c",
  },
  {
    id: "fruits",
    label: "水果類",
    description: "各式新鮮水果",
    cho: 15,
    pro: 0,
    fat: 0,
    color: "#7edbd1",
  },
  {
    id: "fats",
    label: "油脂與堅果種子類",
    description: "油脂、堅果、芝麻、酪梨",
    cho: 0,
    pro: 0,
    fat: 5,
    color: "#94b3c2",
  },
] as const;

export type FoodGroupId = (typeof FOOD_GROUPS)[number]["id"];

export type ServingsPlan = Record<FoodGroupId, number>;

export interface NutritionRow {
  id: FoodGroupId;
  label: string;
  description: string;
  servings: number;
  perServing: {
    cho: number;
    pro: number;
    fat: number;
  };
  choTotal: number;
  proTotal: number;
  fatTotal: number;
  subtotalCalories: number;
  color: string;
}

export interface NutritionSummary {
  rows: NutritionRow[];
  totals: {
    cho: number;
    pro: number;
    fat: number;
  };
  macroCalories: {
    cho: number;
    pro: number;
    fat: number;
  };
  macroRatios: {
    cho: number;
    pro: number;
    fat: number;
  };
  totalCalories: number;
}

export interface NutritionRecommendation {
  targetCalories: number;
  bmi: number;
  bmiStatus: string;
  recommendedServings: ServingsPlan;
  summary: NutritionSummary;
}

const CALORIE_TEMPLATES: Array<{ max: number; servings: ServingsPlan }> = [
  {
    max: 1500,
    servings: {
      grains: 6,
      dairy: 1.5,
      protein: 4.5,
      vegetables: 4,
      fruits: 2,
      fats: 4,
    },
  },
  {
    max: 1800,
    servings: {
      grains: 8,
      dairy: 1.5,
      protein: 5.5,
      vegetables: 4.5,
      fruits: 2,
      fats: 4.5,
    },
  },
  {
    max: 2100,
    servings: {
      grains: 10,
      dairy: 2,
      protein: 6,
      vegetables: 5,
      fruits: 2.5,
      fats: 5,
    },
  },
  {
    max: 2400,
    servings: {
      grains: 12,
      dairy: 2,
      protein: 6.5,
      vegetables: 5,
      fruits: 3,
      fats: 5.5,
    },
  },
  {
    max: 2700,
    servings: {
      grains: 13,
      dairy: 2.5,
      protein: 7.5,
      vegetables: 5.5,
      fruits: 3.5,
      fats: 6.5,
    },
  },
  {
    max: Number.POSITIVE_INFINITY,
    servings: {
      grains: 15,
      dairy: 2.5,
      protein: 8,
      vegetables: 6,
      fruits: 4,
      fats: 6.5,
    },
  },
];

const SERVING_LIMITS: Record<FoodGroupId, { min: number; max: number }> = {
  grains: { min: 3, max: 18 },
  dairy: { min: 1, max: 4 },
  protein: { min: 3, max: 12 },
  vegetables: { min: 3, max: 8 },
  fruits: { min: 1, max: 6 },
  fats: { min: 2, max: 10 },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundToHalf(value: number) {
  return Math.round(value * 2) / 2;
}

function normalizeRecommendedServing(foodId: FoodGroupId, value: number) {
  const { min, max } = SERVING_LIMITS[foodId];
  return roundToHalf(clamp(value, min, max));
}

function sanitizeProfile(profile: UserProfile): UserProfile {
  return {
    heightCm: clamp(profile.heightCm || 0, 100, 230),
    weightKg: clamp(profile.weightKg || 0, 30, 200),
    age: clamp(profile.age || 0, 10, 100),
    sex: profile.sex,
    activity: profile.activity,
    goal: profile.goal,
  };
}

export function calculateRecommendedCalories(weightKg: number, goal: Goal) {
  const factor =
    GOAL_OPTIONS.find((option) => option.value === goal)?.calorieFactor ?? 30;

  return Math.round(weightKg * factor);
}

export function calculateBmi(heightCm: number, weightKg: number) {
  const heightMeter = heightCm / 100;

  if (heightMeter <= 0) {
    return 0;
  }

  return weightKg / (heightMeter * heightMeter);
}

export function getBmiStatus(bmi: number) {
  if (bmi < 18.5) {
    return "過輕";
  }

  if (bmi < 24) {
    return "正常範圍";
  }

  if (bmi < 27) {
    return "過重";
  }

  return "肥胖";
}

export function clampServingValue(foodId: FoodGroupId, value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return roundToHalf(clamp(value, 0, SERVING_LIMITS[foodId].max));
}

export function calculateNutritionFromServings(servings: ServingsPlan): NutritionSummary {
  const rows = FOOD_GROUPS.map((group) => {
    const currentServings = clampServingValue(group.id, servings[group.id]);
    const choTotal = currentServings * group.cho;
    const proTotal = currentServings * group.pro;
    const fatTotal = currentServings * group.fat;
    const subtotalCalories = choTotal * 4 + proTotal * 4 + fatTotal * 9;

    return {
      id: group.id,
      label: group.label,
      description: group.description,
      servings: currentServings,
      perServing: {
        cho: group.cho,
        pro: group.pro,
        fat: group.fat,
      },
      choTotal,
      proTotal,
      fatTotal,
      subtotalCalories,
      color: group.color,
    } satisfies NutritionRow;
  });

  const totals = rows.reduce(
    (accumulator, row) => ({
      cho: accumulator.cho + row.choTotal,
      pro: accumulator.pro + row.proTotal,
      fat: accumulator.fat + row.fatTotal,
    }),
    { cho: 0, pro: 0, fat: 0 },
  );

  const macroCalories = {
    cho: totals.cho * 4,
    pro: totals.pro * 4,
    fat: totals.fat * 9,
  };

  const totalCalories = macroCalories.cho + macroCalories.pro + macroCalories.fat;

  const macroRatios =
    totalCalories > 0
      ? {
          cho: (macroCalories.cho / totalCalories) * 100,
          pro: (macroCalories.pro / totalCalories) * 100,
          fat: (macroCalories.fat / totalCalories) * 100,
        }
      : { cho: 0, pro: 0, fat: 0 };

  return {
    rows,
    totals,
    macroCalories,
    macroRatios,
    totalCalories,
  };
}

function getTemplateForCalories(targetCalories: number) {
  return CALORIE_TEMPLATES.find((template) => targetCalories <= template.max) ?? CALORIE_TEMPLATES[2];
}

function createRecommendedServings(profile: UserProfile, targetCalories: number, bmi: number) {
  const servings = { ...getTemplateForCalories(targetCalories).servings };

  switch (profile.goal) {
    case "cut":
      servings.grains -= 1;
      servings.fruits -= 0.5;
      servings.vegetables += 0.5;
      servings.fats -= 0.5;
      break;
    case "bulk":
      servings.grains += 1;
      servings.fruits += 0.5;
      servings.protein += 0.5;
      servings.fats += 0.5;
      break;
    default:
      break;
  }

  switch (profile.activity) {
    case "low":
      servings.grains -= 0.5;
      servings.fats -= 0.5;
      break;
    case "high":
      servings.grains += 1;
      servings.fruits += 0.5;
      servings.dairy += 0.5;
      servings.fats += 0.5;
      break;
    default:
      break;
  }

  if (profile.age < 18) {
    servings.dairy += 0.5;
    servings.fruits += 0.5;
  } else if (profile.age >= 50) {
    servings.vegetables += 0.5;
    servings.dairy += 0.5;
    servings.fats -= 0.5;
  }

  if (profile.sex === "male") {
    servings.protein += 0.5;
  }

  if (bmi < 18.5) {
    servings.grains += 0.5;
    servings.dairy += 0.5;
    servings.fruits += 0.5;
  } else if (bmi >= 27) {
    servings.vegetables += 0.5;
    servings.fats -= 0.5;
  }

  for (const group of FOOD_GROUPS) {
    servings[group.id] = normalizeRecommendedServing(group.id, servings[group.id]);
  }

  const planCalories = calculateNutritionFromServings(servings).totalCalories;
  const grainAdjustment = (targetCalories - planCalories) / 68;
  servings.grains = normalizeRecommendedServing("grains", servings.grains + grainAdjustment);

  const caloriesAfterGrain = calculateNutritionFromServings(servings).totalCalories;
  const fatAdjustment = (targetCalories - caloriesAfterGrain) / 45;
  servings.fats = normalizeRecommendedServing("fats", servings.fats + fatAdjustment);

  return servings;
}

export function buildNutritionRecommendation(profile: UserProfile): NutritionRecommendation {
  const safeProfile = sanitizeProfile(profile);
  const targetCalories = calculateRecommendedCalories(safeProfile.weightKg, safeProfile.goal);
  const bmi = calculateBmi(safeProfile.heightCm, safeProfile.weightKg);
  const recommendedServings = createRecommendedServings(safeProfile, targetCalories, bmi);
  const summary = calculateNutritionFromServings(recommendedServings);

  return {
    targetCalories,
    bmi,
    bmiStatus: getBmiStatus(bmi),
    recommendedServings,
    summary,
  };
}

