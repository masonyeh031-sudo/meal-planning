// Plain JS — data + nutrition logic shared across all pages.
// Mirrors meal-planning/lib/* but condensed for the prototype.

(function (root) {
  const SEX_OPTIONS = [
    { value: "male", label: "男性" },
    { value: "female", label: "女性" },
  ];

  const ACTIVITY_OPTIONS = [
    { value: "low", label: "低活動量" },
    { value: "medium", label: "中活動量" },
    { value: "high", label: "高活動量" },
  ];

  const GOAL_OPTIONS = [
    { value: "cut", label: "減脂", calorieFactor: 25, hint: "體重 × 25 kcal" },
    { value: "maintain", label: "維持", calorieFactor: 30, hint: "體重 × 30 kcal" },
    { value: "bulk", label: "增肌", calorieFactor: 35, hint: "體重 × 35 kcal" },
  ];

  // Warm-palette swatches per food group (overridable by theme).
  const FOOD_GROUPS = [
    {
      id: "grains",
      label: "全穀雜糧類",
      short: "穀",
      description: "飯、麵、地瓜、燕麥",
      cho: 15, pro: 2, fat: 0,
      hue: "grain",
    },
    {
      id: "protein",
      label: "豆魚蛋肉類",
      short: "蛋",
      description: "豆腐、魚、肉、蛋",
      cho: 0, pro: 7, fat: 5,
      hue: "protein",
    },
    {
      id: "dairy",
      label: "低脂奶類",
      short: "奶",
      description: "牛奶、優格、起司",
      cho: 12, pro: 8, fat: 8,
      hue: "dairy",
    },
    {
      id: "vegetables",
      label: "蔬菜類",
      short: "菜",
      description: "深色與淺色蔬菜",
      cho: 5, pro: 1, fat: 0,
      hue: "veg",
    },
    {
      id: "fruits",
      label: "水果類",
      short: "果",
      description: "各式新鮮水果",
      cho: 15, pro: 0, fat: 0,
      hue: "fruit",
    },
    {
      id: "fats",
      label: "油脂與堅果種子類",
      short: "油",
      description: "油脂、堅果、芝麻、酪梨",
      cho: 0, pro: 0, fat: 5,
      hue: "fat",
    },
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
    { max: 1500, servings: { grains: 6, dairy: 1.5, protein: 4.5, vegetables: 4, fruits: 2, fats: 4 } },
    { max: 1800, servings: { grains: 8, dairy: 1.5, protein: 5.5, vegetables: 4.5, fruits: 2, fats: 4.5 } },
    { max: 2100, servings: { grains: 10, dairy: 2, protein: 6, vegetables: 5, fruits: 2.5, fats: 5 } },
    { max: 2400, servings: { grains: 12, dairy: 2, protein: 6.5, vegetables: 5, fruits: 3, fats: 5.5 } },
    { max: 2700, servings: { grains: 13, dairy: 2.5, protein: 7.5, vegetables: 5.5, fruits: 3.5, fats: 6.5 } },
    { max: Infinity, servings: { grains: 15, dairy: 2.5, protein: 8, vegetables: 6, fruits: 4, fats: 6.5 } },
  ];

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const roundHalf = (v) => Math.round(v * 2) / 2;

  function recommendedCalories(weightKg, goal) {
    const f = (GOAL_OPTIONS.find((g) => g.value === goal) || GOAL_OPTIONS[1]).calorieFactor;
    return Math.round(weightKg * f);
  }

  function bmiOf(heightCm, weightKg) {
    const h = heightCm / 100;
    if (h <= 0) return 0;
    return weightKg / (h * h);
  }

  function bmiStatus(bmi) {
    if (bmi < 18.5) return "過輕";
    if (bmi < 24) return "正常範圍";
    if (bmi < 27) return "過重";
    return "肥胖";
  }

  function clampServing(id, v) {
    if (!Number.isFinite(v)) return 0;
    return roundHalf(clamp(v, 0, SERVING_LIMITS[id].max));
  }

  function templateFor(targetCal) {
    return CALORIE_TEMPLATES.find((t) => targetCal <= t.max) || CALORIE_TEMPLATES[2];
  }

  function nutritionFromServings(servings) {
    const rows = FOOD_GROUPS.map((g) => {
      const s = clampServing(g.id, servings[g.id] || 0);
      const choTotal = s * g.cho;
      const proTotal = s * g.pro;
      const fatTotal = s * g.fat;
      return {
        ...g,
        servings: s,
        choTotal, proTotal, fatTotal,
        subtotalCalories: choTotal * 4 + proTotal * 4 + fatTotal * 9,
      };
    });
    const totals = rows.reduce(
      (a, r) => ({ cho: a.cho + r.choTotal, pro: a.pro + r.proTotal, fat: a.fat + r.fatTotal }),
      { cho: 0, pro: 0, fat: 0 }
    );
    const macroCal = { cho: totals.cho * 4, pro: totals.pro * 4, fat: totals.fat * 9 };
    const totalCal = macroCal.cho + macroCal.pro + macroCal.fat;
    const ratios = totalCal > 0
      ? { cho: macroCal.cho / totalCal * 100, pro: macroCal.pro / totalCal * 100, fat: macroCal.fat / totalCal * 100 }
      : { cho: 0, pro: 0, fat: 0 };
    return { rows, totals, macroCal, ratios, totalCal };
  }

  function recommendedServings(profile, targetCal, bmi) {
    const s = { ...templateFor(targetCal).servings };
    if (profile.goal === "cut") { s.grains -= 1; s.fruits -= 0.5; s.vegetables += 0.5; s.fats -= 0.5; }
    if (profile.goal === "bulk") { s.grains += 1; s.fruits += 0.5; s.protein += 0.5; s.fats += 0.5; }
    if (profile.activity === "low") { s.grains -= 0.5; s.fats -= 0.5; }
    if (profile.activity === "high") { s.grains += 1; s.fruits += 0.5; s.dairy += 0.5; s.fats += 0.5; }
    if (profile.age < 18) { s.dairy += 0.5; s.fruits += 0.5; }
    else if (profile.age >= 50) { s.vegetables += 0.5; s.dairy += 0.5; s.fats -= 0.5; }
    if (profile.sex === "male") s.protein += 0.5;
    if (bmi < 18.5) { s.grains += 0.5; s.dairy += 0.5; s.fruits += 0.5; }
    else if (bmi >= 27) { s.vegetables += 0.5; s.fats -= 0.5; }
    for (const g of FOOD_GROUPS) {
      const lim = SERVING_LIMITS[g.id];
      s[g.id] = roundHalf(clamp(s[g.id], lim.min, lim.max));
    }
    // Calorie tuning via grain + fat.
    const cal1 = nutritionFromServings(s).totalCal;
    s.grains = roundHalf(clamp(s.grains + (targetCal - cal1) / 68, SERVING_LIMITS.grains.min, SERVING_LIMITS.grains.max));
    const cal2 = nutritionFromServings(s).totalCal;
    s.fats = roundHalf(clamp(s.fats + (targetCal - cal2) / 45, SERVING_LIMITS.fats.min, SERVING_LIMITS.fats.max));
    return s;
  }

  function buildRecommendation(profile) {
    const safe = {
      heightCm: clamp(profile.heightCm || 170, 100, 230),
      weightKg: clamp(profile.weightKg || 65, 30, 200),
      age: clamp(profile.age || 30, 10, 100),
      sex: profile.sex,
      activity: profile.activity,
      goal: profile.goal,
    };
    const target = recommendedCalories(safe.weightKg, safe.goal);
    const bmi = bmiOf(safe.heightCm, safe.weightKg);
    const recServings = recommendedServings(safe, target, bmi);
    return {
      targetCalories: target,
      bmi,
      bmiStatus: bmiStatus(bmi),
      recommendedServings: recServings,
      summary: nutritionFromServings(recServings),
    };
  }

  // Food guide content (condensed from food-guide.ts)
  const FOOD_GUIDE = [
    {
      id: "grains", title: "全穀雜糧類", badge: "穀", hue: "grain",
      role: "提供身體活動需要的能量，可以把它想成主食類。",
      portion: "1 份大約是飯 1/4 碗，或麵、地瓜、南瓜這類半碗左右。",
      quickLook: "飯 1/4 碗",
      exchanges: ["飯 1/4 碗", "薄吐司 1 片", "饅頭 1/4 個", "玉米 1 小段", "麵、冬粉、米粉約 1/2 碗", "地瓜、芋頭、南瓜約 1/2 碗", "燕麥片約 3 湯匙"],
      reminder: "主食不是壞食物，重點是份量剛剛好。",
    },
    {
      id: "protein", title: "豆魚蛋肉類", badge: "蛋", hue: "protein",
      role: "幫助身體成長、修復與維持肌肉。",
      portion: "1 份大約是一掌心瘦肉、1 顆蛋、1 杯豆漿或半盒嫩豆腐。",
      quickLook: "1 掌心",
      exchanges: ["肉、魚、海鮮熟重約 30 g", "雞蛋 1 顆", "豆漿 240 c.c.", "傳統豆腐 2 小格", "嫩豆腐半盒", "豆包 2/3 個", "蝦仁約 4 隻"],
      reminder: "盡量先選豆、魚、蛋與較瘦的肉類。",
    },
    {
      id: "dairy", title: "低脂奶類", badge: "奶", hue: "dairy",
      role: "提供鈣質與蛋白質。",
      portion: "1 份大約是一杯牛奶、1 盒優格或 2 片低脂起司。",
      quickLook: "1 杯",
      exchanges: ["低脂鮮奶 240 c.c.", "低脂奶粉 3 湯匙", "低脂起司 2 片", "優格 180 g", "優酪乳 200 g"],
      reminder: "盡量選低脂、無糖版本。",
    },
    {
      id: "vegetables", title: "蔬菜類", badge: "菜", hue: "veg",
      role: "建議每天都要吃足，顏色越多越好。",
      portion: "1 份大約是熟菜 1/2 碗，也可以想成 1 小盤青菜或一大把生菜。",
      quickLook: "熟菜 1/2 碗",
      exchanges: ["生重約 100 g", "煮熟約 1/2 碗", "1 小碟青菜", "生菜沙拉 1 份"],
      reminder: "深綠、白色、紅橘色輪流搭配更完整。",
    },
    {
      id: "fruits", title: "水果類", badge: "果", hue: "fruit",
      role: "補充維生素、礦物質與纖維。",
      portion: "1 份大約是一個拳頭大的新鮮水果，或切塊水果 8 分滿小碗。",
      quickLook: "1 拳頭",
      exchanges: ["蘋果 1 個", "柳丁 1 個", "香蕉半根", "葡萄 13 顆", "小番茄 13 顆", "切塊水果 8 分滿小碗"],
      reminder: "不建議用果汁、果乾取代水果。",
    },
    {
      id: "fats", title: "油脂與堅果種子類", badge: "油", hue: "fat",
      role: "必需的能量來源，但要適量；堅果種子建議原味。",
      portion: "1 份大約是 1 茶匙油，或 1 湯匙堅果種子。",
      quickLook: "1 茶匙",
      exchanges: ["油脂約 1 茶匙", "瓜子、開心果、核桃約 1 湯匙", "帶殼花生約 2 湯匙", "杏仁粉約 1 湯匙", "沙茶醬、芝麻醬約 1/2 湯匙"],
      reminder: "原味堅果比調味堅果更適合日常吃。",
    },
  ];

  const PLATE_RATIO = [
    { label: "蔬菜", ratio: "1/2 盤", note: "餐盤的一半留給青菜與菇類。", hue: "veg" },
    { label: "全穀雜糧", ratio: "1/4 盤", note: "飯、麵、地瓜、吐司放這格。", hue: "grain" },
    { label: "豆魚蛋肉", ratio: "1/4 盤", note: "主菜抓一掌心大小最好估。", hue: "protein" },
  ];

  const HAND_PORTION = [
    { label: "豆魚蛋肉", badge: "掌", measure: "約 1 掌心", note: "雞胸、魚、豆腐、1 顆蛋。" },
    { label: "水果", badge: "拳", measure: "約 1 拳頭", note: "整顆蘋果、柳丁。" },
    { label: "蔬菜", badge: "碗", measure: "熟菜約 1/2 碗", note: "每餐至少半碗。" },
    { label: "全穀雜糧", badge: "飯", measure: "飯約 1/4–1/2 碗", note: "依一天份數調整。" },
    { label: "奶類", badge: "杯", measure: "約 1 杯", note: "牛奶、優格、優酪乳。" },
    { label: "油脂堅果", badge: "匙", measure: "約 1 茶匙", note: "份量小但能量集中。" },
  ];

  const PRINCIPLE_STEPS = [
    {
      step: "01", title: "估算每日熱量",
      detail: "根據體重與目標，先估算每日所需熱量。",
      formula: ["減脂：體重 × 25 kcal", "維持：體重 × 30 kcal", "增肌：體重 × 35 kcal"],
      example: "體重 65 kg、維持：65 × 30 = 1950 kcal",
    },
    {
      step: "02", title: "分配三大營養素比例",
      detail: "將總熱量分配給 CHO、PRO、FAT。",
      formula: ["CHO 碳水：50%", "PRO 蛋白質：25%", "FAT 脂肪：25%"],
      example: "比例可依目標、活動量微調。",
    },
    {
      step: "03", title: "把熱量換算成克數",
      detail: "因為每克營養素提供的熱量不同，要換算成克數。",
      formula: ["CHO(g) = 熱量 × 50% ÷ 4", "PRO(g) = 熱量 × 25% ÷ 4", "FAT(g) = 熱量 × 25% ÷ 9"],
      example: "CHO/PRO 每克 4 kcal、FAT 每克 9 kcal。",
    },
    {
      step: "04", title: "反推每日建議份數",
      detail: "用食物代換表把克數換算成每日份數。",
      formula: ["主食、蔬菜、水果由 CHO 反推", "豆魚蛋肉由 PRO 反推", "油脂堅果由 FAT 反推"],
      example: "簡化版估算，方便日常理解。",
    },
  ];

  const SERVING_FORMULAS = [
    { label: "全穀雜糧類", formula: "CHO × 60% ÷ 15" },
    { label: "水果類", formula: "CHO × 20% ÷ 15" },
    { label: "蔬菜類", formula: "CHO × 20% ÷ 5" },
    { label: "豆魚蛋肉類", formula: "PRO ÷ 7" },
    { label: "奶類", formula: "固定 1～2 份" },
    { label: "油脂與堅果種子類", formula: "FAT ÷ 5" },
  ];

  // Helpers used by records page
  const DAYS = ["一", "二", "三", "四", "五", "六", "日"];
  const MEALS = [
    { id: "breakfast", label: "早餐", icon: "☀" },
    { id: "lunch", label: "午餐", icon: "◐" },
    { id: "dinner", label: "晚餐", icon: "☾" },
    { id: "snack", label: "點心", icon: "✦" },
  ];

  function todayDate(offset = 0) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  Object.assign(root, {
    SEX_OPTIONS, ACTIVITY_OPTIONS, GOAL_OPTIONS, FOOD_GROUPS, FOOD_GUIDE,
    PLATE_RATIO, HAND_PORTION, PRINCIPLE_STEPS, SERVING_FORMULAS,
    SERVING_LIMITS, DAYS, MEALS,
    recommendedCalories, bmiOf, bmiStatus, clampServing,
    nutritionFromServings, buildRecommendation, todayDate,
    clamp, roundHalf,
  });
})(window);
