// ===== How to eat three meals page =====
const MEAL_GUIDE_SCENES = [
  { id: "breakfast", label: "早餐", icon: "🌤️" },
  { id: "lunch", label: "午餐", icon: "🍱" },
  { id: "dinner", label: "晚餐", icon: "🌙" },
  { id: "convenience", label: "超商", icon: "🏪" },
  { id: "preworkout", label: "運動前", icon: "👟" },
  { id: "bedtime", label: "睡前", icon: "🌛" },
];

const THREE_ELEMENT_CARDS = [
  {
    title: "蛋白質 Protein",
    icon: "🥚",
    copy: "幫助增加飽足感，也能支持肌肉修復。",
    examples: ["雞蛋", "雞肉", "魚", "豆腐", "無糖豆漿", "優格"],
    tint: "var(--orange-soft)",
  },
  {
    title: "纖維與份量感 Fiber / Volume",
    icon: "🥦",
    copy: "讓餐點更有份量，也比較不容易很快餓。",
    examples: ["青菜", "菇類", "海帶", "花椰菜", "番茄"],
    tint: "var(--green-soft)",
  },
  {
    title: "適量碳水 Sensible Carb",
    icon: "🍚",
    copy: "提供身體能量，但份量要適中。",
    examples: ["飯", "地瓜", "燕麥", "吐司", "飯糰"],
    tint: "var(--cream-soft)",
  },
];

const BREAKFAST_CARDS = [
  {
    title: "茶葉蛋 + 地瓜 + 無糖豆漿",
    icons: ["🥚", "🍠", "🥛"],
    reason: "蛋白質、碳水和溫熱飲都有，飽足感穩定。",
    tags: ["蛋白質＋碳水", "外食方便", "早餐友善"],
  },
  {
    title: "飯糰 + 茶葉蛋 + 無糖豆漿",
    icons: ["🍙", "🥚", "🥛"],
    reason: "這是 PDF 裡很常出現的超商穩定組合，簡單又不容易太空虛。",
    tags: ["超商方便", "蛋白質", "早餐快速"],
  },
  {
    title: "饅頭夾蛋 + 無糖豆漿",
    icons: ["🥯", "🍳", "🥛"],
    reason: "早餐店很容易做到，加蛋與豆漿後飽足感會比單吃主食好很多。",
    tags: ["早餐店友善", "蛋白質", "溫和順口"],
  },
  {
    title: "燕麥 + 香蕉 + 豆漿",
    icons: ["🥣", "🍌", "🥛"],
    reason: "在家最快速，也適合早上想吃清爽一點的時候。",
    tags: ["在家快速", "碳水穩定", "外出前好準備"],
  },
];

const BREAKFAST_WARNINGS = [
  { title: "果汁 + 三明治", note: "糖分高，蛋白質通常不夠。" },
  { title: "優酪乳 + 水果杯", note: "蛋白質與纖維可能都偏少。" },
  { title: "加糖燕麥飲 + 吐司", note: "液體加精緻澱粉，飽足感通常較低。" },
  { title: "饅頭 + 只有咖啡", note: "主食有了，但缺少蛋白質。" },
];

const QUICK_FIX_CARDS = [
  { ask: "想喝果汁？", fix: "改成原型水果，再加一份蛋白質。", icon: "🍊" },
  { ask: "想吃吐司？", fix: "加蛋、雞肉、鮪魚，或旁邊搭一杯豆漿。", icon: "🍞" },
  { ask: "想吃沙拉？", fix: "加雞肉、豆腐、蛋或鮪魚，份量才會更穩。", icon: "🥗" },
  { ask: "想吃飯糰？", fix: "加茶葉蛋或一杯豆漿，比只吃飯糰更撐。", icon: "🍙" },
];

const LUNCH_TABS = [
  {
    id: "bento",
    label: "我今天吃便當",
    icon: "🍱",
    title: "便當：先抓主菜，再補菜量",
    intro: "PDF 的建議很一致：便當的飯量常常太多，菜太少，簡單調整就會穩很多。",
    cards: [
      { name: "鯖魚便當 + 飯半碗 + 多夾菜", note: "魚類蛋白質穩定，飯量減一點更剛好。 " },
      { name: "非油炸雞腿便當 + 飯半碗 + 多夾菜", note: "保留主菜滿足感，但避開過多油炸負擔。" },
      { name: "豬里肌 + 豆腐 + 青菜 + 半碗飯", note: "蛋白質來源更多元，不容易吃完又餓。" },
      { name: "魚 + 蛋 + 青菜 + 半碗飯", note: "蛋白質加蔬菜，整體飽足感很穩。" },
    ],
    tips: ["先選一個蛋白質主菜", "蔬菜至少補到 2 種", "主食不用全不吃，但份量抓半碗左右", "少選太油炸、太多醬汁的主菜"],
  },
  {
    id: "buffet",
    label: "我今天吃自助餐",
    icon: "🥢",
    title: "自助餐：蛋白質 + 2 樣菜 + 半碗飯",
    intro: "自助餐的自由度最高，最適合把一餐三元素做得完整。",
    cards: [
      { name: "蛋白質先拿：雞肉、魚、蛋、豆腐", note: "先把蛋白質放進盤子，整餐比較穩。" },
      { name: "蔬菜至少 2 種", note: "深綠色和白色蔬菜一起搭，份量感會更好。" },
      { name: "碳水選飯半碗或地瓜", note: "給身體能量，但不會一下太重。" },
      { name: "少碰勾芡、重醬汁、炸物堆疊", note: "不是完全不能吃，而是不要整盤都靠它們。" },
    ],
    tips: ["蛋白質選一樣主角", "蔬菜兩種起跳", "主食保留適量", "重口味菜色抓 1 樣就好"],
  },
  {
    id: "convenience",
    label: "我今天吃超商",
    icon: "🏪",
    title: "超商：照著組合買就很夠用",
    intro: "PDF 的超商頁很實用，直接照抄幾個組合就能組出不容易餓的一餐。",
    cards: [
      { name: "雞胸肉 + 地瓜 + 無糖茶", note: "蛋白質和碳水先到位，是最穩的基底組合。" },
      { name: "2 顆茶葉蛋 + 地瓜 + 無糖豆漿", note: "如果想吃得更簡單，茶葉蛋和豆漿就很夠用。" },
      { name: "飯糰 + 茶葉蛋 + 無糖豆漿", note: "這組當早餐或午餐都很常見，也很方便執行。" },
      { name: "雞胸肉 + 沙拉 + 茶葉蛋", note: "蛋白質很完整，若活動量較高可再補地瓜或飯糰。" },
    ],
    tips: ["蛋白質先找雞胸、茶葉蛋、魚類", "碳水可選地瓜、飯糰", "如果餐點太乾，搭無糖茶或豆漿", "想更有份量就再補沙拉或小番茄"],
  },
];

const DINNER_CARDS = [
  {
    title: "豆腐 + 飯 + 青菜",
    icons: ["🫘", "🍚", "🥬"],
    note: "簡單、清爽，也很適合想吃得剛剛好的晚上。",
  },
  {
    title: "雞胸肉 + 白飯 + 高麗菜",
    icons: ["🍗", "🍚", "🥬"],
    note: "對活動量有一定的人來說，這樣的晚餐很穩定。",
  },
  {
    title: "鮭魚飯 + 青菜",
    icons: ["🐟", "🍚", "🥦"],
    note: "魚類蛋白質加蔬菜，吃完比較有滿足感。",
  },
  {
    title: "豬里肌 + 青菜 + 半碗飯",
    icons: ["🥩", "🥬", "🍚"],
    note: "保留主食但不過量，適合晚上活動較少時。",
  },
  {
    title: "湯品 + 蛋白質 + 少量主食",
    icons: ["🍲", "🥚", "🍙"],
    note: "晚上想吃溫熱一點時很適合，但湯裡還是要有蛋白質。",
  },
];

const DINNER_EXTRA = [
  "不需要完全不吃飯，重點是份量與搭配。",
  "如果晚上活動少，可以把精緻澱粉減一點，但不要只剩青菜。",
  "家裡簡單做也可以很穩：鮭魚 + 飯 + 青菜、豆腐 + 蛋 + 青菜 + 飯，都是 PDF 裡的好組合。",
];

const STORE_COMBOS = [
  {
    title: "雞胸肉 + 地瓜 + 無糖茶",
    icon: "🍠",
    protein: "雞胸肉",
    carb: "地瓜",
    fiber: "可再搭配沙拉更完整",
    stars: 4,
    moments: ["breakfast", "lunch", "dinner"],
    tags: ["蛋白質", "適量碳水", "外食方便"],
  },
  {
    title: "2 顆茶葉蛋 + 地瓜 + 無糖豆漿",
    icon: "🥚",
    protein: "茶葉蛋 + 豆漿",
    carb: "地瓜",
    fiber: "若能補小番茄更好",
    stars: 4,
    moments: ["breakfast", "preworkout"],
    tags: ["早餐友善", "蛋白質", "運動前適合"],
  },
  {
    title: "飯糰 + 茶葉蛋 + 無糖豆漿",
    icon: "🍙",
    protein: "茶葉蛋 + 豆漿",
    carb: "飯糰",
    fiber: "可加海帶或小份沙拉",
    stars: 4,
    moments: ["breakfast", "lunch", "preworkout"],
    tags: ["超商方便", "適量碳水", "運動前適合"],
  },
  {
    title: "雞胸肉 + 沙拉 + 茶葉蛋",
    icon: "🥗",
    protein: "雞胸肉 + 茶葉蛋",
    carb: "如果很餓可再補飯糰或地瓜",
    fiber: "沙拉",
    stars: 5,
    moments: ["lunch", "dinner"],
    tags: ["纖維", "蛋白質", "晚餐穩定"],
  },
  {
    title: "鯖魚便當 + 多夾菜或搭配沙拉",
    icon: "🐟",
    protein: "鯖魚",
    carb: "便當飯量抓半份更剛好",
    fiber: "便當配菜 + 沙拉",
    stars: 4,
    moments: ["lunch", "dinner"],
    tags: ["外食方便", "蛋白質", "主食適量"],
  },
  {
    title: "香蕉 + 無糖豆漿",
    icon: "🍌",
    protein: "無糖豆漿",
    carb: "香蕉",
    fiber: "香蕉本身有一點份量感",
    stars: 3,
    moments: ["preworkout"],
    tags: ["運動前適合", "輕量", "快消化"],
  },
  {
    title: "無糖豆漿 + 小地瓜",
    icon: "🌛",
    protein: "無糖豆漿",
    carb: "小地瓜",
    fiber: "地瓜本身有纖維",
    stars: 3,
    moments: ["bedtime"],
    tags: ["睡前友善", "溫和", "不太負擔"],
  },
];

const PREWORKOUT_COMPARE = [
  {
    id: "short",
    title: "運動前 30–45 分鐘",
    icon: "⚡",
    copy: "這個時間點要吃輕量、快消化的食物，重點是補充能量，不是吃正餐。",
    items: ["香蕉 + 水", "香蕉 + 無糖豆漿", "吐司 + 果醬", "吐司 + 蜂蜜", "米餅 + 香蕉"],
    note: "距離運動不到 45 分鐘，避免高蛋白或高脂肪食物，因為消化可能來不及。",
  },
  {
    id: "mid",
    title: "運動前 60–90 分鐘",
    icon: "🥪",
    copy: "這個時間可以加一點蛋白質，能量會更穩定。",
    items: ["飯糰 + 茶葉蛋", "地瓜 + 無糖豆漿", "鮪魚飯糰 + 茶葉蛋", "饅頭夾蛋 + 無糖豆漿", "燕麥 + 香蕉 + 豆漿"],
    note: "如果有更多時間，也能吃清爽版正餐：雞肉便當（避免油炸）或鮭魚飯 + 青菜。",
  },
];

const PREWORKOUT_DIRECTION = [
  { title: "快速能量（好消化）", icon: "🍞", items: ["香蕉、蘋果", "飯糰、白飯、粥", "地瓜、燕麥", "白吐司、饅頭、原味貝果", "米餅、少量果醬 / 蜂蜜"] },
  { title: "輕量蛋白質", icon: "💪", items: ["茶葉蛋、水煮蛋", "無糖豆漿、無糖優格", "鮪魚飯糰", "雞胸肉（小份）"] },
];

const BEDTIME_CARDS = [
  {
    title: "茶葉蛋 + 半條小地瓜",
    icons: ["🥚", "🍠"],
    note: "蛋白質 + 複合碳水，最有飽足感。",
    tags: ["睡前友善", "蛋白質", "不太空虛"],
  },
  {
    title: "無糖豆漿 + 小地瓜",
    icons: ["🥛", "🍠"],
    note: "暖胃、好消化，也不會太重。",
    tags: ["液體", "睡前友善", "溫和"],
  },
  {
    title: "希臘優格 + 奇亞籽 + 半根香蕉",
    icons: ["🥣", "🌱", "🍌"],
    note: "蛋白質 + 纖維 + 天然甜味，滿足感高。",
    tags: ["蛋白質", "纖維", "清爽"],
  },
  {
    title: "水煮蛋 + 小番茄",
    icons: ["🥚", "🍅"],
    note: "簡單、低負擔，嘴饞時很好用。",
    tags: ["低熱量", "蛋白質", "睡前友善"],
  },
  {
    title: "嫩豆腐 + 海苔 + 薄醬油",
    icons: ["🫘", "🌿", "🥢"],
    note: "清爽又夠味，像一個小小的宵夜替代方案。",
    tags: ["清爽", "蛋白質", "不太負擔"],
  },
];

const BEDTIME_DIRECTION = [
  { title: "液體類", icon: "🥛", items: ["無糖豆漿", "溫牛奶", "低糖高蛋白牛奶"] },
  { title: "蛋白質類", icon: "🥚", items: ["茶葉蛋、水煮蛋", "希臘優格、高蛋白優格", "嫩豆腐、板豆腐、無糖豆花", "少量毛豆、少量堅果"] },
  { title: "低卡水果 / 輕食", icon: "🍓", items: ["奇異果、半根香蕉", "小番茄、小黃瓜", "蘋果切片、小地瓜", "少量燕麥、海帶湯"] },
];

const QUIZ_OPTIONS = [
  {
    id: "a",
    label: "A. 果汁 + 三明治",
    result: "這樣通常比較快餓，因為糖分高、蛋白質常常不夠。",
  },
  {
    id: "b",
    label: "B. 飯糰 + 茶葉蛋 + 無糖豆漿",
    result: "這組更有飽足感，因為有蛋白質與碳水搭配，也比較像完整一餐。",
  },
];

function scrollMealGuideSection(sectionId) {
  document.getElementById(`meal-guide-${sectionId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function MealGuideTags({ tags }) {
  return (
    <div className="meal-guide-tags">
      {tags.map((tag) => (
        <span key={tag} className="meal-guide-tag">{tag}</span>
      ))}
    </div>
  );
}

function MealGuidePage() {
  const [activeScene, setActiveScene] = useState("breakfast");
  const [lunchTab, setLunchTab] = useState("bento");
  const [storeMoment, setStoreMoment] = useState("breakfast");
  const [quizAnswer, setQuizAnswer] = useState(null);

  const currentLunch = LUNCH_TABS.find((tab) => tab.id === lunchTab) || LUNCH_TABS[0];
  const storeCards = STORE_COMBOS.filter((item) => item.moments.includes(storeMoment));

  const goTo = (id) => {
    setActiveScene(id);
    scrollMealGuideSection(id);
  };

  return (
    <>
      <section className="shell meal-guide-hero">
        <div className="meal-guide-hero-grid">
          <div className="meal-guide-copy">
            <span className="hero-eyebrow"><span aria-hidden="true">🍽️</span><span>三餐怎麼吃</span></span>
            <h1 className="big-title">三餐怎麼吃才不容易餓？</h1>
            <p className="big-sub">用簡單的三個原則，幫你從早餐、午餐到晚餐，吃得有飽足感又不亂吃。</p>
            <div className="hero-actions">
              <button className="btn is-primary" onClick={() => goTo("breakfast")}>
                <span aria-hidden="true">🥣</span>
                開始看三餐建議
              </button>
              <button className="btn" onClick={() => goTo("lunch")}>
                <span aria-hidden="true">🏪</span>
                查看外食搭配
              </button>
            </div>
          </div>

          <div className="meal-guide-visual" aria-hidden="true">
            <div className="meal-guide-plate">
              <span className="plate-food is-rice">🍙</span>
              <span className="plate-food is-egg">🥚</span>
              <span className="plate-food is-milk">🥛</span>
              <span className="plate-food is-green">🥦</span>
              <span className="plate-food is-meat">🍗</span>
              <span className="plate-food is-fruit">🍎</span>
            </div>
            <div className="meal-guide-mini-cards">
              <article><strong>早餐</strong><span>先補蛋白質</span></article>
              <article><strong>午餐</strong><span>外食也能穩</span></article>
              <article><strong>晚餐</strong><span>吃夠但不太重</span></article>
            </div>
          </div>
        </div>
      </section>

      <section className="shell meal-scene-nav">
        {MEAL_GUIDE_SCENES.map((scene) => (
          <button
            key={scene.id}
            className={`meal-scene-chip${activeScene === scene.id ? " is-active" : ""}`}
            onClick={() => goTo(scene.id)}
          >
            <span aria-hidden="true">{scene.icon}</span>
            {scene.label}
          </button>
        ))}
      </section>

      <section className="shell meal-section" id="meal-guide-principles">
        <SectionTitle
          eyebrow="一餐三元素"
          title="一餐想吃得飽，通常需要這三樣"
          sub="這是 PDF 裡最核心的概念。只要一餐能湊到這三塊，通常就比較不會很快又想找零食。"
        />
        <div className="meal-principles-grid">
          {THREE_ELEMENT_CARDS.map((card) => (
            <article key={card.title} className="meal-principle-card" style={{ "--meal-tint": card.tint }}>
              <div className="meal-principle-icon" aria-hidden="true">{card.icon}</div>
              <h3>{card.title}</h3>
              <p>{card.copy}</p>
              <div className="meal-chip-list">
                {card.examples.map((example) => <span key={example}>{example}</span>)}
              </div>
            </article>
          ))}
        </div>
        <div className="meal-soft-alert">
          <span aria-hidden="true">💡</span>
          <span>如果一餐太液體、蛋白質太少、份量太小，通常很快就會餓，然後開始想找零食或手搖飲。</span>
        </div>
      </section>

      <section className="shell meal-section" id="meal-guide-breakfast">
        <SectionTitle
          eyebrow="早餐怎麼吃"
          title="早餐：先補蛋白質，再搭配適量碳水"
          sub="PDF 裡很明確提到：早餐店選擇很多，但多數組合都缺蛋白質。加豆漿或蛋，飽足感會差很多。"
        />
        <div className="meal-card-grid">
          {BREAKFAST_CARDS.map((card) => (
            <article key={card.title} className="meal-reco-card">
              <div className="meal-icon-row">
                {card.icons.map((icon, index) => <span key={`${card.title}-${index}`} aria-hidden="true">{icon}</span>)}
              </div>
              <h3>{card.title}</h3>
              <p>{card.reason}</p>
              <MealGuideTags tags={card.tags} />
            </article>
          ))}
        </div>

        <article className="meal-warning-card">
          <div className="meal-warning-head">
            <span aria-hidden="true">🫶</span>
            <div>
              <h3>看起來健康但容易餓</h3>
              <p>這些不是不能吃，只是如果把它當成一整餐，通常會比較快餓。</p>
            </div>
          </div>
          <div className="meal-warning-grid">
            {BREAKFAST_WARNINGS.map((item) => (
              <div key={item.title} className="meal-warning-item">
                <strong>{item.title}</strong>
                <span>{item.note}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="shell meal-section">
        <SectionTitle
          eyebrow="修正方式"
          title="買了也沒關係，這樣補會更穩"
          sub="這一段直接整理自 PDF 的「更好的修正方式」：不用整餐重買，只要補一樣東西就能差很多。"
        />
        <div className="quick-fix-grid">
          {QUICK_FIX_CARDS.map((item) => (
            <article key={item.ask} className="quick-fix-card">
              <span className="quick-fix-icon" aria-hidden="true">{item.icon}</span>
              <div>
                <strong>{item.ask}</strong>
                <p>{item.fix}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="shell meal-section" id="meal-guide-lunch">
        <SectionTitle
          eyebrow="午餐怎麼吃"
          title="午餐：外食也能吃得穩"
          sub="核心順序很簡單：先找蛋白質主菜、再補蔬菜、主食留適量，並避開整盒都靠炸物和醬汁撐場面。"
        />

        <div className="meal-tabs">
          {LUNCH_TABS.map((tab) => (
            <button
              key={tab.id}
              className={`meal-tab${lunchTab === tab.id ? " is-active" : ""}`}
              onClick={() => setLunchTab(tab.id)}
            >
              <span aria-hidden="true">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <article className="meal-tab-panel">
          <div className="meal-tab-copy">
            <h3>{currentLunch.title}</h3>
            <p>{currentLunch.intro}</p>
          </div>
          <div className="meal-card-grid is-tight">
            {currentLunch.cards.map((item) => (
              <article key={item.name} className="meal-reco-card is-lunch">
                <h3>{item.name}</h3>
                <p>{item.note}</p>
              </article>
            ))}
          </div>
          <div className="meal-bullet-box">
            {currentLunch.tips.map((tip) => <span key={tip}>{tip}</span>)}
          </div>
        </article>
      </section>

      <section className="shell meal-section" id="meal-guide-dinner">
        <SectionTitle
          eyebrow="晚餐怎麼吃"
          title="晚餐：吃得夠，但不要太負擔"
          sub="重點不是完全不吃飯，而是晚上的主食份量依活動量調整，同時保留蛋白質與蔬菜。"
        />

        <div className="dinner-layout">
          <div className="dinner-plate-card">
            <div className="dinner-plate">
              <div className="dinner-plate-segment is-veg">
                <strong>1/2 盤</strong>
                <span>蔬菜</span>
              </div>
              <div className="dinner-plate-segment is-protein">
                <strong>1/4 盤</strong>
                <span>蛋白質</span>
              </div>
              <div className="dinner-plate-segment is-carb">
                <strong>1/4 盤</strong>
                <span>碳水</span>
              </div>
            </div>
            <p>滑鼠移上去時三格會放大一點，幫你更直覺記住晚餐的分配比例。</p>
          </div>

          <div className="meal-card-grid is-tight">
            {DINNER_CARDS.map((card) => (
              <article key={card.title} className="meal-reco-card">
                <div className="meal-icon-row">
                  {card.icons.map((icon, index) => <span key={`${card.title}-${index}`} aria-hidden="true">{icon}</span>)}
                </div>
                <h3>{card.title}</h3>
                <p>{card.note}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="meal-note-list">
          {DINNER_EXTRA.map((item) => <div key={item}>{item}</div>)}
        </div>
      </section>

      <section className="shell meal-section" id="meal-guide-convenience">
        <SectionTitle
          eyebrow="超商怎麼吃"
          title="超商怎麼組合"
          sub="這些組合直接整理自 PDF 的超商頁，再補上蛋白質 / 碳水 / 纖維拆解，讓你更容易臨場選。"
        />

        <div className="store-filter-row">
          {[
            { id: "breakfast", label: "我想吃早餐" },
            { id: "lunch", label: "我想吃午餐" },
            { id: "dinner", label: "我想吃晚餐" },
            { id: "preworkout", label: "我想運動前吃" },
            { id: "bedtime", label: "我想睡前吃" },
          ].map((item) => (
            <button
              key={item.id}
              className={`store-filter-btn${storeMoment === item.id ? " is-active" : ""}`}
              onClick={() => setStoreMoment(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="store-card-grid">
          {storeCards.map((card) => (
            <article key={`${storeMoment}-${card.title}`} className="store-combo-card">
              <div className="store-combo-head">
                <span className="store-combo-icon" aria-hidden="true">{card.icon}</span>
                <div>
                  <h3>{card.title}</h3>
                  <span className="meal-rating">飽足感 {Array.from({ length: 5 }, (_, index) => index < card.stars ? "★" : "☆").join("")}</span>
                </div>
              </div>
              <div className="store-combo-breakdown">
                <div><b>蛋白質</b><span>{card.protein}</span></div>
                <div><b>碳水來源</b><span>{card.carb}</span></div>
                <div><b>纖維來源</b><span>{card.fiber}</span></div>
              </div>
              <MealGuideTags tags={card.tags} />
            </article>
          ))}
        </div>
      </section>

      <section className="shell meal-section" id="meal-guide-preworkout">
        <SectionTitle
          eyebrow="運動前"
          title="運動前怎麼吃"
          sub="PDF 把運動前分得很清楚：越接近運動，食物越要簡單、越好消化。"
        />
        <div className="compare-grid">
          {PREWORKOUT_COMPARE.map((card) => (
            <article key={card.id} className="compare-card">
              <div className="compare-card-head">
                <span aria-hidden="true">{card.icon}</span>
                <h3>{card.title}</h3>
              </div>
              <p>{card.copy}</p>
              <ul>
                {card.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <div className="compare-note">{card.note}</div>
            </article>
          ))}
        </div>

        <div className="quick-energy-grid">
          {PREWORKOUT_DIRECTION.map((group) => (
            <article key={group.title} className="quick-energy-card">
              <h3><span aria-hidden="true">{group.icon}</span>{group.title}</h3>
              <ul>
                {group.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="shell meal-section meal-section-night" id="meal-guide-bedtime">
        <SectionTitle
          eyebrow="睡前怎麼吃"
          title="睡前真的餓怎麼辦"
          sub="PDF 的重點很清楚：睡前食物不是燃脂宵夜，而是解決真的餓，但不要把睡前變成第二頓晚餐。"
        />

        <div className="night-direction-grid">
          {BEDTIME_DIRECTION.map((group) => (
            <article key={group.title} className="night-direction-card">
              <h3><span aria-hidden="true">{group.icon}</span>{group.title}</h3>
              <ul>
                {group.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
          ))}
        </div>

        <div className="night-card-grid">
          {BEDTIME_CARDS.map((card) => (
            <article key={card.title} className="night-meal-card">
              <div className="meal-icon-row">
                {card.icons.map((icon, index) => <span key={`${card.title}-${index}`} aria-hidden="true">{icon}</span>)}
              </div>
              <h3>{card.title}</h3>
              <p>{card.note}</p>
              <MealGuideTags tags={card.tags} />
            </article>
          ))}
        </div>
      </section>

      <section className="shell meal-section">
        <SectionTitle
          eyebrow="小測驗"
          title="這餐比較容易餓嗎？"
          sub="用 PDF 的概念快速測一下：一餐有沒有蛋白質、份量感和適量碳水，差很多。"
        />
        <article className="quiz-card">
          <div className="quiz-options">
            {QUIZ_OPTIONS.map((option) => (
              <button
                key={option.id}
                className={`quiz-option${quizAnswer === option.id ? " is-active" : ""}`}
                onClick={() => setQuizAnswer(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
          {quizAnswer ? (
            <div className="quiz-answer">
              <strong>{quizAnswer === "b" ? "答對了。" : "再看一下。"} </strong>
              <span>{QUIZ_OPTIONS.find((option) => option.id === quizAnswer)?.result}</span>
            </div>
          ) : (
            <div className="quiz-answer is-muted">先選一個選項，看看哪一餐更有飽足感。</div>
          )}
        </article>
      </section>

      <section className="shell meal-section">
        <article className="summary-card">
          <span className="hero-eyebrow"><span aria-hidden="true">🫶</span><span>最後總結</span></span>
          <h2>最後記得：沒有完美食物，只有適合的時機</h2>
          <p>不要只問「這個食物健康嗎？」更重要的是問：「這個食物符合我現在的需求嗎？」</p>
          <div className="summary-list">
            <div>1. 運動前，吐司可以有用。</div>
            <div>2. 睡前一顆茶葉蛋很聰明。</div>
            <div>3. 中午只吃沒有蛋白質的沙拉，通常不夠。</div>
          </div>
          <div className="meal-soft-alert is-summary">
            <span aria-hidden="true">🍽️</span>
            <span>根據你的目標和時間點，選最適合的那一餐。</span>
          </div>
        </article>
      </section>
    </>
  );
}

window.MealGuidePage = MealGuidePage;
