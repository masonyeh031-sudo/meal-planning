import type { FoodGroupId, ServingsPlan } from "./nutrition-calculator";

export interface FoodGuideItem {
  id: FoodGroupId;
  title: string;
  calculatorTitle: string;
  badge: string;
  accentColor: string;
  softColor: string;
  roleDescription: string;
  servingHighlight: string;
  quickLook: string;
  commonExchanges: string[];
  easyReads: string[];
  reminder: string;
  tooltipQuestion: string;
  tooltipAnswer: string;
}

export interface DailyServingSuggestion {
  id: FoodGroupId;
  title: string;
  badge: string;
  accentColor: string;
  softColor: string;
  servings: number;
  headline: string;
  alternatives: string[];
  mealSplit: string;
  reminder: string;
  tooltipQuestion: string;
  tooltipAnswer: string;
}

export const FOOD_GUIDE_ITEMS: FoodGuideItem[] = [
  {
    id: "grains",
    title: "全穀雜糧類",
    calculatorTitle: "全穀雜糧類",
    badge: "穀",
    accentColor: "#f2b575",
    softColor: "#fff4e6",
    roleDescription: "這一類主要提供身體活動需要的能量，可以把它想成主食類。",
    servingHighlight: "1 份大約是飯 1/4 碗，或麵、地瓜、南瓜這類半碗左右。",
    quickLook: "飯 1/4 碗",
    commonExchanges: [
      "飯 1/4 碗",
      "薄吐司 1 片",
      "市售饅頭 1/4 個",
      "冷凍饅頭 1/3 個",
      "玉米一小段或玉米粒 1/4 碗",
      "麵、冬粉、米粉、通心粉、地瓜、芋頭、南瓜約 1/2 碗",
      "熟綠豆、五穀粉約 2 湯匙",
      "燕麥片約 3 湯匙",
    ],
    easyReads: [
      "可以想成小半碗主食、1 片吐司，或一小段玉米。",
      "如果正餐有飯、麵、粥、地瓜，通常都算在這一類。",
      "記法上先抓主食量，再看要不要換成吐司、燕麥或地瓜。",
    ],
    reminder: "主食不是壞食物，重點是份量剛剛好，不用每餐都吃很多。",
    tooltipQuestion: "為什麼主食用碗跟片來記？",
    tooltipAnswer:
      "因為飯、吐司、麵類最常出現在日常餐桌，用碗、片、湯匙來記，比記公克更容易在點餐或備餐時快速判斷。",
  },
  {
    id: "protein",
    title: "豆魚蛋肉類",
    calculatorTitle: "豆魚蛋肉類",
    badge: "蛋",
    accentColor: "#f29b8f",
    softColor: "#fff0ec",
    roleDescription: "這一類主要幫助身體成長、修復與維持肌肉。",
    servingHighlight: "1 份大約是一掌心瘦肉、1 顆蛋、1 杯豆漿或半盒嫩豆腐。",
    quickLook: "1 掌心蛋白質",
    commonExchanges: [
      "肉、魚、海鮮熟重約 30 公克",
      "可想成 1 個掌心大小的薄片或 2 湯匙肉類",
      "2 湯匙肉類約等於 4 隻小蝦",
      "牡蠣、蛤蜊約 3 湯匙",
      "雞蛋 1 顆",
      "豆包 2/3 個",
      "黑豆干 1/3 塊",
      "豆漿 240 c.c.",
      "傳統豆腐 2 小格",
      "嫩豆腐半盒",
      "三角油豆腐 2 個",
    ],
    easyReads: [
      "最簡單的記法是一掌心瘦肉或 1 顆蛋。",
      "不一定每餐都吃肉，也可以用豆漿、豆腐、蛋去替換。",
      "外食時先看主菜有沒有一份像掌心大小的蛋白質。",
    ],
    reminder: "盡量先選豆、魚、蛋與較瘦的肉類，油炸與加工肉別吃太多。",
    tooltipQuestion: "為什麼肉類常用掌心表示？",
    tooltipAnswer:
      "掌心大小比較接近日常夾菜與看主菜的方式，不用秤重也能估一片雞胸、魚排或豆腐大概是不是一份。",
  },
  {
    id: "fruits",
    title: "水果類",
    calculatorTitle: "水果類",
    badge: "果",
    accentColor: "#ffb76e",
    softColor: "#fff4e7",
    roleDescription: "水果可以補充維生素、礦物質與纖維。",
    servingHighlight: "1 份大約是一個拳頭大的新鮮水果，或切塊水果 8 分滿小碗。",
    quickLook: "1 個拳頭大小水果",
    commonExchanges: [
      "切塊水果 8 分滿小碗",
      "葡萄約 13 顆",
      "小番茄約 13 顆",
      "奇異果 1.5 個",
      "香蕉半根",
      "蓮霧 1.5 到 2 個",
      "蘋果 1 個",
      "柳丁 1 個",
    ],
    easyReads: [
      "先記住 1 份大約是一個拳頭大小。",
      "蘋果、柳丁這種整顆水果最容易估算。",
      "切好的水果放小碗，八分滿大多就是一份左右。",
    ],
    reminder: "不建議優先用果汁、果乾取代水果，直接吃水果通常更好。",
    tooltipQuestion: "為什麼不建議用果汁代替水果？",
    tooltipAnswer:
      "水果直接吃能保留更多纖維，也比較有飽足感；果汁容易一下喝進太多糖分，卻沒有吃水果那麼有感。",
  },
  {
    id: "vegetables",
    title: "蔬菜類",
    calculatorTitle: "蔬菜類",
    badge: "菜",
    accentColor: "#88c98d",
    softColor: "#eef9ef",
    roleDescription: "蔬菜建議每天都要吃足，顏色越多越好。",
    servingHighlight: "1 份大約是熟菜 1/2 碗，也可以想成 1 小盤青菜或一大把生菜。",
    quickLook: "熟菜 1/2 碗",
    commonExchanges: [
      "生重約 100 公克",
      "煮熟約 1/2 碗",
      "也可想成 1 小碟青菜",
      "生菜沙拉 1 份通常看起來會很多",
    ],
    easyReads: [
      "熟菜最容易記，半碗就是 1 份。",
      "如果是生菜沙拉，體積通常比熟菜大很多。",
      "正餐先留位置給青菜，顏色越多越加分。",
    ],
    reminder: "不要只吃一種顏色的菜，深綠、白色、紅橘色輪流搭配更完整。",
    tooltipQuestion: "為什麼蔬菜常被建議吃到半盤？",
    tooltipAnswer:
      "蔬菜體積大、熱量相對低，能幫助增加飽足感與纖維攝取，所以很適合在正餐裡放比較多。",
  },
  {
    id: "dairy",
    title: "低脂奶類",
    calculatorTitle: "奶類",
    badge: "奶",
    accentColor: "#8fb8ff",
    softColor: "#edf5ff",
    roleDescription: "奶類主要提供鈣質與蛋白質。",
    servingHighlight: "1 份大約是一杯牛奶、1 盒優格或 2 片低脂起司。",
    quickLook: "1 杯牛奶",
    commonExchanges: [
      "低脂鮮奶 240 c.c.",
      "低脂奶粉 3 湯匙",
      "低脂起司 2 片",
      "優格 180 公克",
      "優酪乳 200 公克",
    ],
    easyReads: [
      "最簡單的記法就是 1 杯牛奶。",
      "也可以換成 1 盒優格或 2 片起司。",
      "早餐或下午點心最容易放進奶類。",
    ],
    reminder: "盡量選低脂、無糖版本，比較符合日常健康飲食。",
    tooltipQuestion: "奶類為什麼常放在早餐或點心？",
    tooltipAnswer:
      "奶類很容易用杯裝或盒裝直接補進一天飲食，放在早餐或點心通常最順手，也比較不容易忘記。",
  },
  {
    id: "fats",
    title: "油脂與堅果種子類",
    calculatorTitle: "油脂與堅果種子類",
    badge: "油",
    accentColor: "#d3b98c",
    softColor: "#f8f2e8",
    roleDescription: "油脂是必需的，但要適量，堅果種子類可以選擇原味較佳。",
    servingHighlight: "1 份大約是 1 茶匙油，或 1 湯匙堅果種子。",
    quickLook: "1 茶匙油脂",
    commonExchanges: [
      "油脂約 1 茶匙",
      "瓜子、開心果、核桃約 1 湯匙",
      "帶殼花生約 2 湯匙，約 10 粒",
      "杏仁粉、花生粉約 1 湯匙",
      "沙茶醬、芝麻醬、美乃滋約 1/2 湯匙",
    ],
    easyReads: [
      "可以先記成一小匙油或一小匙堅果。",
      "如果是醬料，也常常算進油脂類。",
      "堅果雖然健康，但份量小小的就很有熱量。",
    ],
    reminder: "原味堅果比調味堅果更適合日常吃，油脂類少量就很夠。",
    tooltipQuestion: "為什麼醬料也會算油脂類？",
    tooltipAnswer:
      "像沙茶醬、芝麻醬、美乃滋這些醬料本身就含有不少油脂，雖然看起來只有一點點，但熱量不低。",
  },
];

export const PLATE_RATIO_GUIDE = [
  {
    label: "蔬菜",
    ratio: "1/2 盤",
    note: "先把餐盤的一半留給青菜與菇類。",
    accentColor: "#88c98d",
    softColor: "#eef9ef",
  },
  {
    label: "全穀雜糧",
    ratio: "1/4 盤",
    note: "飯、麵、地瓜、吐司都可以放在這一格。",
    accentColor: "#f2b575",
    softColor: "#fff4e6",
  },
  {
    label: "豆魚蛋肉",
    ratio: "1/4 盤",
    note: "主菜抓一掌心大小會更好估。",
    accentColor: "#f29b8f",
    softColor: "#fff0ec",
  },
] as const;

export const HAND_PORTION_GUIDE = [
  {
    label: "豆魚蛋肉",
    badge: "掌",
    measure: "約 1 掌心",
    note: "一塊雞胸、魚肉、豆腐或 1 顆蛋都能用這個概念記。",
  },
  {
    label: "水果",
    badge: "拳",
    measure: "約 1 拳頭",
    note: "整顆蘋果、柳丁或小碗切塊水果都很好估。",
  },
  {
    label: "蔬菜",
    badge: "碗",
    measure: "熟菜約 1/2 碗",
    note: "正餐可以先抓每餐至少半碗青菜。",
  },
  {
    label: "全穀雜糧",
    badge: "飯",
    measure: "飯約 1/4 到 1/2 碗",
    note: "依一天份數決定每餐是小半碗還是半碗以上。",
  },
  {
    label: "奶類",
    badge: "杯",
    measure: "約 1 杯",
    note: "牛奶、優格、無糖優酪乳都能換算。",
  },
  {
    label: "油脂堅果",
    badge: "匙",
    measure: "約 1 茶匙",
    note: "一小匙油、一小匙堅果，份量不大但能量很集中。",
  },
] as const;

export const DAILY_FOOD_TIPS = [
  "今天記得讓青菜至少出現在兩餐以上。",
  "蛋白質可以想成一個掌心大小，比較好在便當或外食中估算。",
  "水果直接吃通常比果汁更適合，也比較有飽足感。",
  "堅果適量就好，小小一匙就有不少能量。",
] as const;

export function getFoodGuideItem(foodId: FoodGroupId) {
  return FOOD_GUIDE_ITEMS.find((item) => item.id === foodId) ?? FOOD_GUIDE_ITEMS[0];
}

function roundToStep(value: number, step: number) {
  return Math.round(value / step) * step;
}

function formatPortionValue(value: number, step = 0.5) {
  const roundedValue = roundToStep(value, step);

  if (Number.isInteger(roundedValue)) {
    return String(roundedValue);
  }

  return roundedValue.toFixed(2).replace(/0$/, "").replace(/\.$/, "");
}

function buildSuggestionByFoodId(foodId: FoodGroupId, servings: number) {
  switch (foodId) {
    case "grains": {
      const riceBowls = servings * 0.25;
      const noodleBowls = servings * 0.5;
      const mealRice = riceBowls / 3;

      return {
        headline: `約等於白飯 ${formatPortionValue(riceBowls, 0.25)} 碗`,
        alternatives: [
          `也可換成吐司 ${formatPortionValue(servings)} 片`,
          `或麵類、地瓜、南瓜約 ${formatPortionValue(noodleBowls, 0.5)} 碗`,
        ],
        mealSplit: `平均分成三餐，每餐約 ${formatPortionValue(
          servings / 3,
        )} 份，換成白飯約 ${formatPortionValue(mealRice, 0.25)} 碗。`,
      };
    }
    case "protein": {
      const comboMeat = Math.max(servings - 3, 0);

      return {
        headline: `約等於 ${formatPortionValue(servings)} 個掌心大小的豆魚蛋肉`,
        alternatives: [
          `也可想成雞蛋 ${formatPortionValue(servings)} 顆，或豆漿 ${formatPortionValue(
            servings,
          )} 杯`,
          comboMeat > 0
            ? `示範搭配：2 顆蛋 + 1 杯豆漿 + ${formatPortionValue(
                comboMeat,
              )} 掌心肉類`
            : "也可以用雞蛋、豆漿、豆腐與魚肉自由替換。",
        ],
        mealSplit: `可分成三餐，每餐約 ${formatPortionValue(
          servings / 3,
        )} 份蛋白質，正餐抓 1 掌心最直覺。`,
      };
    }
    case "fruits": {
      return {
        headline: `約等於 ${formatPortionValue(servings)} 個拳頭大小水果`,
        alternatives: [
          `可換成蘋果 ${formatPortionValue(servings)} 顆，或香蕉 ${formatPortionValue(
            servings * 0.5,
          )} 根`,
          `也可想成奇異果 ${formatPortionValue(servings * 1.5)} 個左右`,
        ],
        mealSplit: `可以分在早餐、午間或下午點心，每次先抓 1 份水果最容易。`,
      };
    }
    case "vegetables": {
      const cookedBowls = servings * 0.5;

      return {
        headline: `約等於熟菜 ${formatPortionValue(cookedBowls, 0.25)} 碗`,
        alternatives: [
          `也可想成 ${formatPortionValue(servings)} 小碟青菜`,
          `如果是生菜沙拉，視覺上通常會比熟菜更多`,
        ],
        mealSplit: `平均到三餐時，每餐約 ${formatPortionValue(
          cookedBowls / 3,
          0.25,
        )} 碗熟菜；正餐餐盤先留一半給蔬菜會更好。`,
      };
    }
    case "dairy": {
      const remainingYogurt = Math.max(servings - 1, 0);

      return {
        headline: `約等於牛奶 ${formatPortionValue(servings)} 杯`,
        alternatives: [
          `也可換成優格 ${formatPortionValue(servings)} 盒，或起司 ${formatPortionValue(
            servings * 2,
          )} 片`,
          remainingYogurt > 0
            ? `混搭示範：1 杯牛奶 + ${formatPortionValue(remainingYogurt)} 盒優格`
            : "若今天只安排 1 份，1 杯牛奶或 1 盒優格都可以。",
        ],
        mealSplit: `可放在早餐與下午點心，每次約 ${formatPortionValue(
          Math.max(servings / 2, 0.5),
        )} 份，選低脂、無糖更適合。`,
      };
    }
    case "fats": {
      return {
        headline: `約等於 ${formatPortionValue(servings)} 茶匙油脂`,
        alternatives: [
          `也可換成原味堅果約 ${formatPortionValue(servings)} 湯匙`,
          "沙茶醬、芝麻醬、美乃滋這類醬料也要一起算進來",
        ],
        mealSplit: `可分散在三餐烹調，每餐約 ${formatPortionValue(
          servings / 3,
        )} 茶匙；其中 1 到 2 份也能改成原味堅果。`,
      };
    }
  }
}

export function buildDailyServingSuggestions(servingsPlan: ServingsPlan): DailyServingSuggestion[] {
  return FOOD_GUIDE_ITEMS.map((item) => {
    const servings = servingsPlan[item.id];
    const suggestion = buildSuggestionByFoodId(item.id, servings);

    return {
      id: item.id,
      title: item.calculatorTitle,
      badge: item.badge,
      accentColor: item.accentColor,
      softColor: item.softColor,
      servings,
      headline: suggestion.headline,
      alternatives: suggestion.alternatives,
      mealSplit: suggestion.mealSplit,
      reminder: item.reminder,
      tooltipQuestion: item.tooltipQuestion,
      tooltipAnswer: item.tooltipAnswer,
    };
  });
}
