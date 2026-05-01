import {
  GOAL_OPTIONS,
  calculateRecommendedCalories,
  type ServingsPlan,
  type UserProfile,
} from "@/lib/nutrition-calculator";

export const FORMULA_MACRO_RATIOS = {
  cho: 0.5,
  pro: 0.25,
  fat: 0.25,
} as const;

export const CALCULATION_SAMPLE_PROFILE: UserProfile = {
  heightCm: 175,
  weightKg: 75,
  age: 22,
  sex: "male",
  activity: "medium",
  goal: "maintain",
};

export const FOOD_EXCHANGE_TABLE = [
  {
    id: "grains",
    label: "全穀根莖類",
    cho: 15,
    pro: 2,
    fat: 0,
    examples: "飯、麵、地瓜、吐司",
    formula: "CHO × 60% ÷ 15",
  },
  {
    id: "dairy",
    label: "奶類",
    cho: 12,
    pro: 8,
    fat: 8,
    examples: "牛奶、優格、無糖豆漿",
    formula: "固定 1～2 份，常用 2 份",
  },
  {
    id: "protein",
    label: "豆魚肉蛋類",
    cho: 0,
    pro: 7,
    fat: 5,
    examples: "雞肉、魚、蛋、豆腐",
    formula: "PRO ÷ 7",
  },
  {
    id: "vegetables",
    label: "蔬菜類",
    cho: 5,
    pro: 1,
    fat: 0,
    examples: "青菜、花椰菜、菇類",
    formula: "CHO × 20% ÷ 5",
  },
  {
    id: "fruits",
    label: "水果類",
    cho: 15,
    pro: 0,
    fat: 0,
    examples: "蘋果、香蕉、芭樂",
    formula: "CHO × 20% ÷ 15",
  },
  {
    id: "fats",
    label: "油脂與堅果種子類",
    cho: 0,
    pro: 0,
    fat: 5,
    examples: "堅果、橄欖油、酪梨",
    formula: "FAT ÷ 5",
  },
] as const;

export interface FormulaExample {
  profile: UserProfile;
  goalLabel: string;
  targetCalories: number;
  macroGrams: {
    cho: number;
    pro: number;
    fat: number;
  };
  macroCalories: {
    cho: number;
    pro: number;
    fat: number;
  };
  servings: ServingsPlan;
}

export function buildFormulaExample(profile: UserProfile): FormulaExample {
  const targetCalories = calculateRecommendedCalories(profile.weightKg, profile.goal);
  const macroCalories = {
    cho: targetCalories * FORMULA_MACRO_RATIOS.cho,
    pro: targetCalories * FORMULA_MACRO_RATIOS.pro,
    fat: targetCalories * FORMULA_MACRO_RATIOS.fat,
  };

  const macroGrams = {
    cho: macroCalories.cho / 4,
    pro: macroCalories.pro / 4,
    fat: macroCalories.fat / 9,
  };

  const servings: ServingsPlan = {
    grains: (macroGrams.cho * 0.6) / 15,
    dairy: 2,
    protein: macroGrams.pro / 7,
    vegetables: (macroGrams.cho * 0.2) / 5,
    fruits: (macroGrams.cho * 0.2) / 15,
    fats: macroGrams.fat / 5,
  };

  const goalLabel =
    GOAL_OPTIONS.find((option) => option.value === profile.goal)?.label ?? "維持";

  return {
    profile,
    goalLabel,
    targetCalories,
    macroGrams,
    macroCalories,
    servings,
  };
}
