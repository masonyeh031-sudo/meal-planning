// Eating Out page — 外食怎麼吃 · principles, scenarios, traffic-light foods.

const EAT_PRINCIPLES = [
  {
    id: "protein",
    badge: "蛋",
    tag: "蛋白質",
    hue: "protein",
    title: "蛋白質要先補",
    note: "穩定飽足感、減少一小時後又想吃零食。",
    examples: ["雞胸肉", "雞腿", "魚", "蛋", "豆腐", "豆漿", "希臘優格"],
  },
  {
    id: "fiber",
    badge: "菜",
    tag: "纖維／份量感",
    hue: "veg",
    title: "蔬菜與纖維撐份量",
    note: "有體積就有飽足感，減少胃容量被精緻碳水佔走。",
    examples: ["青菜", "菇類", "海帶", "花椰菜", "地瓜", "燕麥"],
  },
  {
    id: "carb",
    badge: "穀",
    tag: "適量碳水",
    hue: "grain",
    title: "適量碳水提供能量",
    note: "份量適中即可，原型澱粉優先，飯飯糰地瓜都行。",
    examples: ["飯", "飯糰", "地瓜", "燕麥", "吐司", "饅頭"],
  },
];

const PLATE_MODES = [
  {
    id: "general",
    label: "一般吃法",
    sub: "日常維持",
    veg: 50,
    protein: 25,
    carb: 25,
    note: "蔬菜先佔半盤，蛋白質與澱粉各 1/4，最不容易踩雷。",
  },
  {
    id: "fatloss",
    label: "減脂吃法",
    sub: "想瘦一點",
    veg: 50,
    protein: 30,
    carb: 20,
    note: "蛋白質拉到 30%，澱粉降到 20%，飽足又不容易破功。",
  },
  {
    id: "muscle",
    label: "增肌吃法",
    sub: "練後補給",
    veg: 50,
    protein: 20,
    carb: 30,
    note: "澱粉拉到 30% 補充能量，蛋白質仍要記得吃滿一掌心。",
  },
];

const EATING_OUT_GUIDES = [
  {
    id: "convenience-store",
    title: "超商怎麼吃",
    emoji: "🏪",
    short: "超商",
    quickRule: "不要只買飯糰或麵包，記得補蛋白質。",
    recommended: [
      "雞胸肉＋地瓜＋無糖茶",
      "2 顆茶葉蛋＋地瓜＋無糖豆漿",
      "飯糰＋茶葉蛋＋無糖豆漿",
      "雞胸肉＋沙拉＋茶葉蛋",
    ],
    avoid: [
      "只有飯糰",
      "只有麵包",
      "果汁＋三明治",
      "加糖燕麥飲＋吐司",
    ],
  },
  {
    id: "bento",
    title: "便當／自助餐怎麼吃",
    emoji: "🍱",
    short: "便當",
    quickRule: "飯減半、菜加多、蛋白質選非油炸。",
    recommended: [
      "鯖魚便當，飯半碗，多夾菜",
      "非油炸雞腿便當，飯半碗，多夾菜",
      "豬里肌＋豆腐＋青菜",
      "魚＋蛋＋半碗飯",
    ],
    avoid: [
      "炸排骨",
      "炸雞腿",
      "糖醋類",
      "三杯類",
      "勾芡醬汁太多",
    ],
  },
  {
    id: "hotpot",
    title: "火鍋怎麼吃",
    emoji: "🍲",
    short: "火鍋",
    quickRule: "湯底清、火鍋料少、肉片選瘦一點，醬料不要爆量。",
    recommended: [
      "昆布、番茄、蔬菜、海鮮湯底",
      "海鮮、雞腿肉、梅花豬、板腱牛",
      "低鹽醬油＋蘿蔔泥＋蔥蒜薑",
      "附餐澱粉可以換雞蛋",
      "火鍋料換成青菜",
    ],
    avoid: [
      "雪花牛",
      "牛小排",
      "培根豬",
      "五花豬",
      "大量沙茶醬",
      "加工火鍋料",
    ],
  },
  {
    id: "salty-chicken",
    title: "鹹水雞怎麼吃",
    emoji: "🐔",
    short: "鹹水雞",
    quickRule: "一種肉＋三種菜，醬料減半、去香油。",
    recommended: [
      "雞胸、雞胗、雞心",
      "高麗菜、龍鬚菜、花椰菜",
      "筊白筍、木耳、四季豆、蘿蔔",
      "醬料減半、去香油",
    ],
    avoid: [
      "雞屁股",
      "雞翅",
      "雞腳",
      "雞皮",
      "甜不辣",
      "豬血糕",
      "百頁豆腐",
    ],
  },
  {
    id: "oden",
    title: "關東煮怎麼吃",
    emoji: "🍢",
    short: "關東煮",
    quickRule: "多選原型食物，少選加工丸類。",
    green: ["豬血", "香菇", "白蘿蔔", "杏鮑菇"],
    yellow: ["油豆腐", "魚蛋捲", "高麗菜捲"],
    red: ["貢丸", "豬血糕", "天婦羅", "滷肥腸"],
  },
  {
    id: "egg-pancake",
    title: "蛋餅／早餐店怎麼吃",
    emoji: "🍳",
    short: "早餐店",
    quickRule: "蛋餅可以吃，但餡料選原型、少炸物。",
    green: ["原味", "蔬菜", "鮪魚", "里肌肉"],
    yellow: ["火腿", "玉米", "起司", "燻雞"],
    red: ["培根", "薯餅", "肉鬆", "卡拉雞"],
  },
  {
    id: "sushi",
    title: "壽司怎麼吃",
    emoji: "🍣",
    short: "壽司",
    quickRule: "優先選魚、蝦等蛋白質，少選美乃滋和炸物。",
    green: ["鮭魚", "鮪魚", "鮮蝦", "鮭魚卵軍艦"],
    yellow: ["玉子燒", "蒲燒星鰻", "海膽軍艦"],
    red: ["稻荷", "鮪魚沙拉", "炙燒起司鮭魚"],
    note: "1 碗飯約等於 8–10 貫壽司，或約 4–5 盤壽司。",
  },
  {
    id: "pasta",
    title: "義大利麵怎麼吃",
    emoji: "🍝",
    short: "義大利麵",
    quickRule: "醬料選擇順序：清炒 ＞ 紅醬 ＞ 青醬 ＞ 白醬。",
    recommended: [
      "清炒：辛香料提味，相對清爽",
      "紅醬：番茄基底，但仍可能有糖和油",
      "青醬：含堅果與橄欖油，熱量較高",
      "白醬：常含麵粉、奶油、鮮奶油，減脂期較不建議",
    ],
  },
  {
    id: "pre-workout",
    title: "運動前怎麼吃",
    emoji: "🏃",
    short: "運動前",
    quickRule: "越接近運動，越要吃輕量、好消化。",
    recommended: [
      "30–45 分鐘前：香蕉＋水",
      "30–45 分鐘前：吐司＋蜂蜜",
      "30–45 分鐘前：米餅＋香蕉",
      "60–90 分鐘前：飯糰＋茶葉蛋",
      "60–90 分鐘前：地瓜＋無糖豆漿",
      "60–90 分鐘前：鮪魚飯糰＋茶葉蛋",
    ],
    avoid: [
      "運動前 45 分鐘內吃高蛋白",
      "運動前 45 分鐘內吃高脂肪",
      "太油或太飽的一餐",
    ],
  },
  {
    id: "late-night",
    title: "睡前真的餓怎麼吃",
    emoji: "🌙",
    short: "睡前嘴饞",
    quickRule: "真的餓可以吃，選蛋白質＋少量碳水，不要硬撐。",
    recommended: [
      "茶葉蛋＋半條小地瓜",
      "無糖豆漿＋小地瓜",
      "希臘優格＋奇亞籽＋半根香蕉",
      "水煮蛋＋小番茄",
      "嫩豆腐＋海苔＋薄醬油",
    ],
    avoid: [
      "洋芋片",
      "餅乾",
      "奶茶",
      "炸物",
      "大份量宵夜",
    ],
  },
];

const WARNING_COMBOS = [
  {
    id: "juice-sandwich",
    title: "果汁＋三明治",
    why: "糖分高，蛋白質通常不夠。",
    fix: "加 1 顆茶葉蛋或 1 杯無糖豆漿",
  },
  {
    id: "yogurt-fruit",
    title: "優酪乳＋水果杯",
    why: "蛋白質與纖維可能不足，飽不久。",
    fix: "改成希臘優格＋一小把堅果",
  },
  {
    id: "oat-toast",
    title: "加糖燕麥飲＋吐司",
    why: "液體＋精緻澱粉，撐不了多久。",
    fix: "加 1 片起司或半盒嫩豆腐",
  },
  {
    id: "salad-juice",
    title: "沙拉杯＋瓶裝果汁",
    why: "看起來健康，但飽足感不足。",
    fix: "加雞胸肉、雞蛋或鮪魚",
  },
  {
    id: "bun-coffee",
    title: "饅頭＋咖啡 / 只有飯糰",
    why: "缺蛋白質，很快又餓。",
    fix: "加無糖豆漿或茶葉蛋",
  },
];

const QUICK_TOOL_OPTIONS = [
  {
    id: "fill",
    label: "想吃飽",
    emoji: "🍱",
    picks: [
      "便當：鯖魚便當＋飯半碗＋多青菜",
      "火鍋：清湯＋海鮮＋雞腿肉＋多青菜",
      "鹹水雞：雞腿＋三種菜＋一份地瓜",
    ],
  },
  {
    id: "fatloss",
    label: "想減脂",
    emoji: "🥗",
    picks: [
      "鯖魚便當＋飯半碗＋多青菜",
      "雞胸肉＋地瓜＋無糖茶",
      "鹹水雞：雞胸＋三種菜＋醬料減半",
    ],
  },
  {
    id: "pre",
    label: "運動前",
    emoji: "🏃",
    picks: [
      "30–45 分鐘前：香蕉＋水",
      "60 分鐘前：飯糰＋茶葉蛋",
      "60–90 分鐘前：地瓜＋無糖豆漿",
    ],
  },
  {
    id: "late",
    label: "睡前嘴饞",
    emoji: "🌙",
    picks: [
      "茶葉蛋＋半條小地瓜",
      "無糖豆漿＋小地瓜",
      "希臘優格＋奇亞籽＋半根香蕉",
    ],
  },
  {
    id: "store",
    label: "超商快速解決",
    emoji: "🏪",
    picks: [
      "雞胸肉＋地瓜＋無糖茶",
      "2 顆茶葉蛋＋地瓜＋無糖豆漿",
      "飯糰＋茶葉蛋＋無糖豆漿",
    ],
  },
  {
    id: "bento",
    label: "便當不知道怎麼挑",
    emoji: "🍳",
    picks: [
      "鯖魚便當：飯半碗＋多夾菜",
      "非油炸雞腿便當＋多青菜",
      "豬里肌＋豆腐＋青菜",
    ],
  },
];

// ── Components ─────────────────────────────────────────────

function PrincipleCard({ item, index }) {
  return (
    <article
      className="card rise eat-principle"
      style={{ "--motion-delay": `${index * 70}ms`, ...hueVars(item.hue) }}
    >
      <div className="eat-principle-head">
        <span className="eat-principle-badge">{item.badge}</span>
        <span className="eat-principle-tag">{item.tag}</span>
      </div>
      <h3 className="eat-principle-title">{item.title}</h3>
      <p className="eat-principle-note">{item.note}</p>
      <div className="eat-principle-chips">
        {item.examples.map((ex) => (
          <span key={ex} className="exchange-chip">{ex}</span>
        ))}
      </div>
    </article>
  );
}

function PlateRatioCard() {
  const [modeId, setModeId] = useState(PLATE_MODES[0].id);
  const mode = PLATE_MODES.find((m) => m.id === modeId);
  const segs = [
    { key: "veg", color: "var(--hue-veg)", value: mode.veg, label: "蔬菜" },
    { key: "protein", color: "var(--hue-protein)", value: mode.protein, label: "蛋白質" },
    { key: "carb", color: "var(--hue-grain)", value: mode.carb, label: "澱粉" },
  ];
  return (
    <article className="card rise eat-plate-card">
      <div className="eat-plate-head">
        <span className="eyebrow">211 餐盤</span>
        <h2>把餐盤分成<em> 3 塊</em>，外食也能對得上</h2>
        <p className="plate-card-sub">不用秤，用餐盤比例就能抓得差不多。</p>
      </div>

      <div className="eat-plate-modes">
        {PLATE_MODES.map((m) => (
          <button
            key={m.id}
            className={"eat-plate-mode" + (m.id === modeId ? " is-active" : "")}
            onClick={() => setModeId(m.id)}
          >
            <strong>{m.label}</strong>
            <span>{m.sub}</span>
          </button>
        ))}
      </div>

      <div className="eat-plate-body">
        <div
          className="eat-plate-211"
          style={{
            "--veg-cols": `${mode.veg}fr ${mode.protein + mode.carb}fr`,
            "--side-rows": `${mode.protein}fr ${mode.carb}fr`,
          }}
          aria-hidden="true"
        >
          <div className="eat-plate-211-cell is-veg" style={{ "--cell-color": "var(--hue-veg)" }}>
            <div className="cell-fill"/>
            <div className="cell-text">
              <span className="cell-emoji">🥦</span>
              <strong>蔬菜</strong>
              <span className="cell-pct">{mode.veg}%</span>
            </div>
          </div>
          <div className="eat-plate-211-side">
            <div className="eat-plate-211-cell is-protein" style={{ "--cell-color": "var(--hue-protein)" }}>
              <div className="cell-fill"/>
              <div className="cell-text">
                <span className="cell-emoji">🍳</span>
                <strong>蛋白質</strong>
                <span className="cell-pct">{mode.protein}%</span>
              </div>
            </div>
            <div className="eat-plate-211-cell is-carb" style={{ "--cell-color": "var(--hue-grain)" }}>
              <div className="cell-fill"/>
              <div className="cell-text">
                <span className="cell-emoji">🍚</span>
                <strong>澱粉</strong>
                <span className="cell-pct">{mode.carb}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="eat-plate-legend">
          {segs.map((s) => (
            <div key={s.key} className="eat-plate-legend-row">
              <span className="eat-plate-legend-dot" style={{ background: s.color }}/>
              <strong>{s.label}</strong>
              <div className="eat-plate-legend-bar">
                <div className="eat-plate-legend-fill" style={{ width: `${s.value}%`, background: s.color }}/>
              </div>
              <span className="eat-plate-legend-pct">{s.value}%</span>
            </div>
          ))}
          <p className="eat-plate-note">{mode.note}</p>
        </div>
      </div>
    </article>
  );
}

function FoodTrafficLight({ green = [], yellow = [], red = [] }) {
  const lanes = [
    { id: "green", title: "綠燈 · 推薦", chips: green },
    { id: "yellow", title: "黃燈 · 偶爾", chips: yellow },
    { id: "red", title: "紅燈 · 少選", chips: red },
  ].filter((l) => l.chips.length > 0);
  return (
    <div className="eat-traffic">
      {lanes.map((l) => (
        <div key={l.id} className={`eat-traffic-lane is-${l.id}`}>
          <div className="eat-traffic-head">
            <span className="eat-traffic-dot" />
            <strong>{l.title}</strong>
          </div>
          <div className="eat-traffic-chips">
            {l.chips.map((c) => (
              <span key={c} className="eat-traffic-chip">{c}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ScenarioDetail({ scenario }) {
  const hasTraffic = scenario.green || scenario.yellow || scenario.red;
  return (
    <div className="eat-scenario-detail rise">
      <div className="eat-scenario-head">
        <span className="eat-scenario-emoji" aria-hidden="true">{scenario.emoji}</span>
        <div>
          <h3>{scenario.title}</h3>
          <p className="eat-scenario-rule">
            <span className="eat-scenario-rule-pill">快速結論</span>
            {scenario.quickRule}
          </p>
        </div>
      </div>

      {hasTraffic ? (
        <FoodTrafficLight
          green={scenario.green}
          yellow={scenario.yellow}
          red={scenario.red}
        />
      ) : (
        <div className="eat-scenario-cols">
          {scenario.recommended && (
            <div className="eat-scenario-col is-good">
              <h4>可以選</h4>
              <ul>
                {scenario.recommended.map((line) => <li key={line}>{line}</li>)}
              </ul>
            </div>
          )}
          {scenario.avoid && scenario.avoid.length > 0 && (
            <div className="eat-scenario-col is-bad">
              <h4>少選或避免</h4>
              <ul>
                {scenario.avoid.map((line) => <li key={line}>{line}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {scenario.note && <p className="eat-scenario-note">📒 {scenario.note}</p>}
    </div>
  );
}

function ScenarioTabs() {
  const [activeId, setActiveId] = useState(EATING_OUT_GUIDES[0].id);
  const active = EATING_OUT_GUIDES.find((s) => s.id === activeId);
  return (
    <div className="eat-scenarios">
      <div className="eat-scenario-tabs" role="tablist">
        {EATING_OUT_GUIDES.map((s) => (
          <button
            key={s.id}
            className={"eat-scenario-tab" + (s.id === activeId ? " is-active" : "")}
            role="tab"
            aria-selected={s.id === activeId}
            onClick={() => setActiveId(s.id)}
          >
            <span className="eat-scenario-tab-emoji" aria-hidden="true">{s.emoji}</span>
            <span>{s.short}</span>
          </button>
        ))}
      </div>
      <ScenarioDetail key={active.id} scenario={active} />
    </div>
  );
}

function WarningComboCard({ item, index }) {
  return (
    <article
      className="card rise eat-warning-card"
      style={{ "--motion-delay": `${index * 60}ms` }}
    >
      <div className="eat-warning-head">
        <span className="eat-warning-pill">⚠ 常見地雷</span>
        <h4>{item.title}</h4>
      </div>
      <p className="eat-warning-why">{item.why}</p>
      <div className="eat-warning-fix">
        <span className="eat-warning-fix-tag">怎麼補救</span>
        <strong>{item.fix}</strong>
      </div>
    </article>
  );
}

function QuickRecommendationTool() {
  const [chosen, setChosen] = useState(QUICK_TOOL_OPTIONS[0].id);
  const opt = QUICK_TOOL_OPTIONS.find((o) => o.id === chosen);
  return (
    <article className="card rise eat-quick-tool">
      <div className="eat-quick-head">
        <span className="eyebrow">QUICK PICK · 快速選擇</span>
        <h2>你現在想<em>吃哪一種</em>？</h2>
        <p className="plate-card-sub">挑一個情境，下面立刻給你 3 組搭配。</p>
      </div>

      <div className="eat-quick-options">
        {QUICK_TOOL_OPTIONS.map((o) => (
          <button
            key={o.id}
            className={"eat-quick-option" + (o.id === chosen ? " is-active" : "")}
            onClick={() => setChosen(o.id)}
          >
            <span className="eat-quick-option-emoji" aria-hidden="true">{o.emoji}</span>
            <span>{o.label}</span>
          </button>
        ))}
      </div>

      <div className="eat-quick-picks">
        {opt.picks.map((p, i) => (
          <div key={p} className="eat-quick-pick rise" style={{ "--motion-delay": `${i * 60}ms` }}>
            <span className="eat-quick-pick-num">{i + 1}</span>
            <span>{p}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

// ── Page ───────────────────────────────────────────────────

function EatingOutPage() {
  return (
    <>
      <PageHead
        eyebrow="EATING OUT · 外食怎麼吃"
        title='外食怎麼吃<em>，吃得飽吃得穩</em>'
        sub="不用精算熱量，也能用「蛋白質＋纖維＋適量碳水」吃得飽、吃得穩、比較不亂餓。"
      >
        <div className="eat-hero-tags">
          <span className="eat-hero-tag is-protein">🍳 蛋白質</span>
          <span className="eat-hero-tag is-fiber">🥦 纖維／份量感</span>
          <span className="eat-hero-tag is-carb">🍚 適量碳水</span>
        </div>
      </PageHead>

      <section className="container" style={{ paddingBottom: 80, display: "grid", gap: 36 }}>

        {/* Section 2 — 外食三大原則 */}
        <div>
          <div className="section-head">
            <div>
              <span className="eyebrow">EATING RULES · 三大原則</span>
              <h2>外食先記這 3 件事</h2>
            </div>
            <p className="head-meta">先補蛋白質、再補纖維、最後抓碳水份量。</p>
          </div>
          <div className="eat-principles">
            {EAT_PRINCIPLES.map((p, i) => <PrincipleCard key={p.id} item={p} index={i}/>)}
          </div>
          <p className="eat-principle-warn">
            一餐如果太液體、蛋白質太少、份量太小，很容易一小時後又想吃麵包、餅乾、奶茶或零食。
          </p>
        </div>

        {/* Section 3 — 211 餐盤 */}
        <PlateRatioCard/>

        {/* Section 4 — 今天你在哪裡吃？ */}
        <div>
          <div className="section-head">
            <div>
              <span className="eyebrow">SCENARIOS · 情境選擇</span>
              <h2>今天你<em>在哪裡吃</em>？</h2>
            </div>
            <p className="head-meta">點選情境，看可以怎麼選、少選什麼。</p>
          </div>
          <ScenarioTabs/>
        </div>

        {/* Section 5 — 地雷組合 */}
        <div>
          <div className="section-head">
            <div>
              <span className="eyebrow">COMBO TRAPS · 常見地雷</span>
              <h2>看起來健康，<em>但其實很容易餓</em></h2>
            </div>
            <p className="head-meta">每張卡片都有「怎麼補救」，加一樣東西就能撐久一點。</p>
          </div>
          <div className="eat-warnings">
            {WARNING_COMBOS.map((w, i) => <WarningComboCard key={w.id} item={w} index={i}/>)}
          </div>
        </div>

        {/* Section 6 — 快速選擇小工具 */}
        <QuickRecommendationTool/>

        {/* Section 7 — 溫柔提醒 */}
        <article className="card eat-gentle-note rise">
          <span className="eyebrow">GENTLE REMINDER · 溫柔提醒</span>
          <p>
            外食不是不能吃，而是學會組合。
            先補蛋白質，再補蔬菜和纖維，最後控制澱粉份量。
            偶爾吃比較放鬆也沒關係，健康不是限制，而是一種選擇。
          </p>
        </article>

        <p className="disclaimer">本頁為一般飲食教育參考，若有特殊疾病、醫囑或營養需求，請諮詢專業醫師或營養師。</p>
      </section>
    </>
  );
}

window.EatingOutPage = EatingOutPage;
