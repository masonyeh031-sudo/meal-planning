// ===== Nutrition data + calculation (preserved from original) =====
const FOOD_GROUPS = [
  { id: "grains",     label: "全穀雜糧類",       icon: "🍚", desc: "飯、麵、地瓜、燕麥",       cho: 15, pro: 2, fat: 0, color: "var(--cho-deep)",  tint: "var(--green-soft)",  accent: "var(--green)"  },
  { id: "protein",    label: "豆魚蛋肉類",       icon: "🥚", desc: "豆腐、魚、肉、蛋",         cho: 0,  pro: 7, fat: 5, color: "var(--pro-deep)",  tint: "var(--orange-soft)", accent: "var(--orange)" },
  { id: "dairy",      label: "乳品類",           icon: "🥛", desc: "牛奶、優格、起司",         cho: 12, pro: 8, fat: 8, color: "var(--kcal-deep)", tint: "var(--blue-soft)",   accent: "var(--blue)"   },
  { id: "vegetables", label: "蔬菜類",           icon: "🥦", desc: "深色與淺色蔬菜",           cho: 5,  pro: 1, fat: 0, color: "var(--bmi-deep)",  tint: "#e0f3f0",           accent: "#8ed5cc"      },
  { id: "fruits",     label: "水果類",           icon: "🍎", desc: "各式新鮮水果",             cho: 15, pro: 0, fat: 0, color: "#c14e4e",          tint: "var(--pink-soft)",   accent: "var(--pink)"   },
  { id: "fats",       label: "油脂與堅果種子類", icon: "🥜", desc: "油脂、堅果、芝麻、酪梨",  cho: 0,  pro: 0, fat: 5, color: "var(--fat-deep)",  tint: "var(--lilac-soft)",  accent: "var(--lilac)"  },
];

const SEX_OPTIONS = [
  { value: "male", label: "男性 ♂" },
  { value: "female", label: "女性 ♀" },
];
const ACTIVITY_OPTIONS = [
  { value: "low", label: "低活動量（少運動）" },
  { value: "medium", label: "中活動量（規律走動）" },
  { value: "high", label: "高活動量（常運動）" },
];
const GOAL_OPTIONS = [
  { value: "cut", label: "減脂", factor: 25, icon: "🔥" },
  { value: "maintain", label: "維持", factor: 30, icon: "🎯" },
  { value: "bulk", label: "增肌", factor: 35, icon: "💪" },
];

const SERVING_LIMITS = {
  grains: { min: 3, max: 18 },
  dairy: { min: 1, max: 4 },
  protein: { min: 3, max: 12 },
  vegetables: { min: 3, max: 8 },
  fruits: { min: 1, max: 6 },
  fats: { min: 2, max: 10 },
};

const CALORIE_TEMPLATES = [
  { max: 1500, s: { grains: 6,  dairy: 1.5, protein: 4.5, vegetables: 4,   fruits: 2,   fats: 4 } },
  { max: 1800, s: { grains: 8,  dairy: 1.5, protein: 5.5, vegetables: 4.5, fruits: 2,   fats: 4.5 } },
  { max: 2100, s: { grains: 10, dairy: 2,   protein: 6,   vegetables: 5,   fruits: 2.5, fats: 5 } },
  { max: 2400, s: { grains: 12, dairy: 2,   protein: 6.5, vegetables: 5,   fruits: 3,   fats: 5.5 } },
  { max: 2700, s: { grains: 13, dairy: 2.5, protein: 7.5, vegetables: 5.5, fruits: 3.5, fats: 6.5 } },
  { max: Infinity, s: { grains: 15, dairy: 2.5, protein: 8, vegetables: 6, fruits: 4, fats: 6.5 } },
];

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const roundHalf = v => Math.round(v * 2) / 2;
const normSrv = (id, v) => roundHalf(clamp(v, SERVING_LIMITS[id].min, SERVING_LIMITS[id].max));
const fmt = v => Number.isInteger(v) ? String(v) : v.toFixed(1);

function clampServing(id, v) {
  if (!Number.isFinite(v)) return 0;
  return roundHalf(clamp(v, 0, SERVING_LIMITS[id].max));
}

function calcKcal(weightKg, goal) {
  const g = GOAL_OPTIONS.find(o => o.value === goal) || GOAL_OPTIONS[1];
  return Math.round(weightKg * g.factor);
}
function calcBmi(h, w) {
  const m = h / 100; if (m <= 0) return 0;
  return w / (m * m);
}
function bmiStatus(b) {
  if (b < 18.5) return "過輕";
  if (b < 24) return "正常範圍";
  if (b < 27) return "過重";
  return "肥胖";
}

function nutritionFromServings(servings) {
  const rows = FOOD_GROUPS.map(g => {
    const s = clampServing(g.id, servings[g.id]);
    const cho = s * g.cho, pro = s * g.pro, fat = s * g.fat;
    return {
      id: g.id, label: g.label, icon: g.icon, color: g.color,
      servings: s, perServing: { cho: g.cho, pro: g.pro, fat: g.fat },
      choTotal: cho, proTotal: pro, fatTotal: fat,
      kcal: cho * 4 + pro * 4 + fat * 9,
    };
  });
  const totals = rows.reduce((a, r) => ({
    cho: a.cho + r.choTotal, pro: a.pro + r.proTotal, fat: a.fat + r.fatTotal,
  }), { cho: 0, pro: 0, fat: 0 });
  const macroKcal = { cho: totals.cho * 4, pro: totals.pro * 4, fat: totals.fat * 9 };
  const total = macroKcal.cho + macroKcal.pro + macroKcal.fat;
  const ratios = total > 0
    ? { cho: macroKcal.cho / total * 100, pro: macroKcal.pro / total * 100, fat: macroKcal.fat / total * 100 }
    : { cho: 0, pro: 0, fat: 0 };
  return { rows, totals, macroKcal, ratios, total };
}

function tplForKcal(k) {
  return CALORIE_TEMPLATES.find(t => k <= t.max) || CALORIE_TEMPLATES[2];
}

function buildRecommended(profile) {
  const target = calcKcal(profile.weightKg, profile.goal);
  const bmi = calcBmi(profile.heightCm, profile.weightKg);
  const s = { ...tplForKcal(target).s };

  if (profile.goal === "cut") { s.grains -= 1; s.fruits -= 0.5; s.vegetables += 0.5; s.fats -= 0.5; }
  if (profile.goal === "bulk") { s.grains += 1; s.fruits += 0.5; s.protein += 0.5; s.fats += 0.5; }
  if (profile.activity === "low") { s.grains -= 0.5; s.fats -= 0.5; }
  if (profile.activity === "high") { s.grains += 1; s.fruits += 0.5; s.dairy += 0.5; s.fats += 0.5; }
  if (profile.age < 18) { s.dairy += 0.5; s.fruits += 0.5; }
  else if (profile.age >= 50) { s.vegetables += 0.5; s.dairy += 0.5; s.fats -= 0.5; }
  if (profile.sex === "male") s.protein += 0.5;
  if (bmi < 18.5) { s.grains += 0.5; s.dairy += 0.5; s.fruits += 0.5; }
  else if (bmi >= 27) { s.vegetables += 0.5; s.fats -= 0.5; }

  for (const g of FOOD_GROUPS) s[g.id] = normSrv(g.id, s[g.id]);

  const k1 = nutritionFromServings(s).total;
  s.grains = normSrv("grains", s.grains + (target - k1) / 68);
  const k2 = nutritionFromServings(s).total;
  s.fats = normSrv("fats", s.fats + (target - k2) / 45);

  return { target, bmi, bmiStatus: bmiStatus(bmi), recommended: s };
}

const DEFAULT_PROFILE = {
  heightCm: 165, weightKg: 60, age: 25,
  sex: "female", activity: "medium", goal: "maintain",
};

// Food guide content
const FOOD_GUIDE = [
  {
    id: "grains", title: "全穀雜糧類", icon: "🍚", tag: "Carbs",
    tint: "var(--green-soft)", accent: "var(--green-deep)",
    role: "主要提供身體活動所需的能量。",
    portion: "1 份 ≈ 飯 1/4 碗，或麵、地瓜、南瓜半碗左右。",
    examples: ["飯 1/4 碗", "薄吐司 1 片", "燕麥片 3 湯匙", "地瓜 1/2 碗", "玉米 1/4 碗"],
    tip: "份量剛剛好就好，不用每餐都很多。"
  },
  {
    id: "protein", title: "豆魚蛋肉類", icon: "🥚", tag: "Protein",
    tint: "var(--orange-soft)", accent: "var(--orange-deep)",
    role: "幫助身體成長、修復與維持肌肉。",
    portion: "1 份 ≈ 一掌心瘦肉、1 顆蛋、1 杯豆漿或半盒嫩豆腐。",
    examples: ["雞蛋 1 顆", "豆漿 240 c.c.", "嫩豆腐 1/2 盒", "魚肉 1 掌心", "雞胸 1 掌心"],
    tip: "先選豆、魚、蛋與較瘦的肉類。"
  },
  {
    id: "dairy", title: "乳品類", icon: "🥛", tag: "Dairy",
    tint: "var(--blue-soft)", accent: "var(--kcal-deep)",
    role: "主要提供鈣質與優質蛋白質。",
    portion: "1 份 ≈ 1 杯牛奶、1 盒優格或 2 片低脂起司。",
    examples: ["牛奶 240 c.c.", "優格 180 g", "起司 2 片", "優酪乳 200 g"],
    tip: "盡量選低脂、無糖版本。"
  },
  {
    id: "vegetables", title: "蔬菜類", icon: "🥦", tag: "Veggies",
    tint: "#e0f3f0", accent: "var(--bmi-deep)",
    role: "提供豐富纖維、維生素與礦物質。",
    portion: "1 份 ≈ 熟菜 1/2 碗，或一小盤青菜。",
    examples: ["熟菜 1/2 碗", "生菜 1 大把", "菇類 1/2 碗", "海帶 1/2 碗"],
    tip: "深綠、白、紅橘色輪流搭配最完整。"
  },
  {
    id: "fruits", title: "水果類", icon: "🍎", tag: "Fruits",
    tint: "var(--pink-soft)", accent: "#c14e4e",
    role: "補充維生素 C、礦物質與纖維。",
    portion: "1 份 ≈ 一個拳頭大的水果，或切塊水果 8 分滿小碗。",
    examples: ["蘋果 1 個", "香蕉 1/2 根", "葡萄 13 顆", "奇異果 1.5 個"],
    tip: "直接吃比果汁更有飽足感。"
  },
  {
    id: "fats", title: "油脂與堅果種子類", icon: "🥜", tag: "Fats",
    tint: "var(--lilac-soft)", accent: "var(--fat-deep)",
    role: "提供必需脂肪酸與脂溶性維生素。",
    portion: "1 份 ≈ 1 茶匙油，或 1 湯匙原味堅果。",
    examples: ["油 1 茶匙", "堅果 1 湯匙", "花生 10 粒", "芝麻醬 1/2 湯匙"],
    tip: "原味堅果比調味更適合日常吃。"
  },
];

window.NUTRITION = {
  FOOD_GROUPS, SEX_OPTIONS, ACTIVITY_OPTIONS, GOAL_OPTIONS,
  DEFAULT_PROFILE, FOOD_GUIDE,
  buildRecommended, nutritionFromServings, clampServing,
  calcBmi, bmiStatus, calcKcal, fmt, clamp, roundHalf,
};
