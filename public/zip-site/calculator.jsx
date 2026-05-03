// ===== Calculator page =====
const _N = window.NUTRITION;

function Hero() {
  return (
    <section className="hero shell">
      <span className="hero-eyebrow">
        <span aria-hidden="true">🌱</span>
        <span>Daily Nutrition Planner</span>
      </span>
      <h1 className="big-title">
        每日飲食份數與<em>營養素計算器</em><span className="wave">🌱</span>
      </h1>
      <p className="big-sub">
        輸入基本資料，快速估算每日熱量、六大類食物份數與三大營養素。
        清楚、可愛、好上手 — 適合學生作業、營養課程與日常自我管理。
      </p>

      <div className="stepper">
        {[
          { n: "01", t: "輸入資料", d: "身高、體重、年齡與目標", ico: "📝" },
          { n: "02", t: "查看建議", d: "系統自動推薦熱量與份數", ico: "✨" },
          { n: "03", t: "微調份數", d: "依喜好微調食物份數", ico: "🎚️" },
          { n: "04", t: "查看圖表", d: "即時看見營養素分配", ico: "📊" },
        ].map((s, i) => (
          <article key={s.n} className="step-card" style={{ animationDelay: `${i * 80}ms` }}>
            <span className="step-num">{s.n}</span>
            <span className="step-ico" aria-hidden="true">{s.ico}</span>
            <h3 className="step-title">{s.t}</h3>
            <p className="step-desc">{s.d}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProfileForm({ profile, setProfile }) {
  const set = (k, v) => setProfile(p => ({ ...p, [k]: v }));
  const setNum = (k, v) => {
    const n = Number(v);
    if (Number.isFinite(n)) set(k, n);
  };
  return (
    <article className="card is-tinted-green">
      <div className="card-eyebrow">
        <span aria-hidden="true">📝</span>
        <span>Step 01 · 輸入區</span>
      </div>
      <h2 className="card-title">填寫基本資料</h2>
      <p className="card-sub">先填寫基本資料，系統會自動幫你估算適合的飲食份數。</p>

      <div className="form-grid">
        <label className="field">
          <span className="field-label"><span className="ico">📏</span>身高 (cm)</span>
          <input className="input" type="number" min="100" max="230" step="1"
            value={profile.heightCm} onChange={e => setNum("heightCm", e.target.value)} />
        </label>
        <label className="field">
          <span className="field-label"><span className="ico">⚖️</span>體重 (kg)</span>
          <input className="input" type="number" min="30" max="200" step="0.1"
            value={profile.weightKg} onChange={e => setNum("weightKg", e.target.value)} />
        </label>
        <label className="field">
          <span className="field-label"><span className="ico">🎂</span>年齡</span>
          <input className="input" type="number" min="10" max="100" step="1"
            value={profile.age} onChange={e => setNum("age", e.target.value)} />
        </label>
        <label className="field">
          <span className="field-label"><span className="ico">👤</span>性別</span>
          <select className="select" value={profile.sex} onChange={e => set("sex", e.target.value)}>
            {_N.SEX_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <label className="field">
          <span className="field-label"><span className="ico">🏃</span>活動量</span>
          <select className="select" value={profile.activity} onChange={e => set("activity", e.target.value)}>
            {_N.ACTIVITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <label className="field">
          <span className="field-label"><span className="ico">🎯</span>飲食目標</span>
          <select className="select" value={profile.goal} onChange={e => set("goal", e.target.value)}>
            {_N.GOAL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.icon} {o.label}</option>)}
          </select>
        </label>
      </div>

      <div className="help-tip">
        <span className="ico" aria-hidden="true">💡</span>
        <span>調整任一欄位後，右側建議與圖表會即時更新。資料會自動儲存在你的瀏覽器中。</span>
      </div>
    </article>
  );
}

function StatCard({ kind, ico, label, value, unit, hint, fillPct, fillColor }) {
  return (
    <article className={"stat is-" + kind}>
      <div className="stat-head">
        <span className="stat-label">{label}</span>
        <span className="stat-ico" aria-hidden="true">{ico}</span>
      </div>
      <strong className="stat-value">
        {value}{unit ? <small>{unit}</small> : null}
      </strong>
      {hint ? <p className="stat-hint">{hint}</p> : null}
      {typeof fillPct === "number" ? (
        <div className="stat-bar"><i style={{ width: `${Math.min(100, Math.max(2, fillPct))}%`, background: fillColor }} /></div>
      ) : null}
    </article>
  );
}

function Dashboard({ rec, summary, profile, calorieDelta }) {
  const { fmt } = _N;
  const targetK = rec.target || 1;
  const curK = summary.total;
  const ratioPct = (curK / targetK) * 100;
  const choPct = summary.ratios.cho;
  const proPct = summary.ratios.pro;
  const fatPct = summary.ratios.fat;

  const goal = _N.GOAL_OPTIONS.find(g => g.value === profile.goal);

  return (
    <div className="dashboard">
      <StatCard
        kind="kcal" ico="🔥" label="每日建議熱量"
        value={rec.target} unit="kcal"
        hint={`${goal.icon} ${goal.label}模式 · 體重 × ${goal.factor} kcal`}
        fillPct={100} fillColor="var(--kcal)"
      />
      <StatCard
        kind="cur" ico="🍽️" label="目前份數總熱量"
        value={Math.round(curK)} unit="kcal"
        hint={Math.abs(calorieDelta) < 1 ? "與建議值接近 ✓" :
              calorieDelta > 0 ? `高於建議 ${Math.round(calorieDelta)} kcal` :
              `低於建議 ${Math.round(Math.abs(calorieDelta))} kcal`}
        fillPct={ratioPct} fillColor="var(--orange)"
      />
      <StatCard
        kind="bmi" ico="🎯" label="BMI 指數"
        value={rec.bmi.toFixed(1)} unit={rec.bmiStatus}
        hint="由身高與體重估算"
        fillPct={Math.min(100, (rec.bmi / 30) * 100)} fillColor="var(--bmi)"
      />
      <StatCard
        kind="cho" ico="🌾" label="CHO 碳水"
        value={Math.round(summary.totals.cho)} unit="g"
        hint={`主要能量來源 · ${choPct.toFixed(0)}%`}
        fillPct={choPct} fillColor="var(--cho)"
      />
      <StatCard
        kind="pro" ico="🍗" label="PRO 蛋白質"
        value={Math.round(summary.totals.pro)} unit="g"
        hint={`修復與肌肉生長 · ${proPct.toFixed(0)}%`}
        fillPct={proPct} fillColor="var(--pro)"
      />
      <StatCard
        kind="fat" ico="🥑" label="FAT 脂肪"
        value={Math.round(summary.totals.fat)} unit="g"
        hint={`必需脂肪酸 · ${fatPct.toFixed(0)}%`}
        fillPct={fatPct} fillColor="var(--fat)"
      />
    </div>
  );
}

function FormulaShowcase({ profile, rec, embedded = false }) {
  const goal = _N.GOAL_OPTIONS.find(g => g.value === profile.goal) || _N.GOAL_OPTIONS[1];
  const sex = _N.SEX_OPTIONS.find(s => s.value === profile.sex) || _N.SEX_OPTIONS[0];
  const activity = _N.ACTIVITY_OPTIONS.find(a => a.value === profile.activity) || _N.ACTIVITY_OPTIONS[1];

  const choG = Math.round(rec.target * 0.5 / 4);
  const proG = Math.round(rec.target * 0.25 / 4);
  const fatG = Math.round(rec.target * 0.25 / 9);

  const theoryServings = {
    grains: _N.roundHalf(choG * 0.6 / 15),
    fruits: _N.roundHalf(choG * 0.2 / 15),
    vegetables: _N.roundHalf(choG * 0.2 / 5),
    protein: _N.roundHalf(proG / 7),
    dairy: rec.recommended.dairy,
    fats: _N.roundHalf(fatG / 5),
  };

  const servingCards = [
    {
      id: "grains",
      icon: "🍚",
      label: "全穀雜糧類",
      formula: `${choG} × 60% ÷ 15`,
      theory: theoryServings.grains,
      current: rec.recommended.grains,
    },
    {
      id: "fruits",
      icon: "🍎",
      label: "水果類",
      formula: `${choG} × 20% ÷ 15`,
      theory: theoryServings.fruits,
      current: rec.recommended.fruits,
    },
    {
      id: "vegetables",
      icon: "🥦",
      label: "蔬菜類",
      formula: `${choG} × 20% ÷ 5`,
      theory: theoryServings.vegetables,
      current: rec.recommended.vegetables,
    },
    {
      id: "protein",
      icon: "🥚",
      label: "豆魚蛋肉類",
      formula: `${proG} ÷ 7`,
      theory: theoryServings.protein,
      current: rec.recommended.protein,
    },
    {
      id: "dairy",
      icon: "🥛",
      label: "乳品類",
      formula: "固定 1～2 份",
      theory: theoryServings.dairy,
      current: rec.recommended.dairy,
    },
    {
      id: "fats",
      icon: "🥜",
      label: "油脂與堅果種子類",
      formula: `${fatG} ÷ 5`,
      theory: theoryServings.fats,
      current: rec.recommended.fats,
    },
  ].map((item) => {
    const guide = _N.FOOD_GUIDE.find(g => g.id === item.id);
    return {
      ...item,
      portion: guide?.portion || "",
      tip: guide?.tip || "",
    };
  });

  const summaryCards = [
    { label: "身高", value: `${profile.heightCm}`, meta: "cm" },
    { label: "體重", value: `${profile.weightKg}`, meta: "kg" },
    { label: "目標", value: goal.label, meta: `× ${goal.factor} kcal` },
    { label: "活動量", value: activity.label.replace(/（.*?）/g, ""), meta: sex.label.replace(/[♂♀]/g, "").trim() },
    { label: "BMI", value: rec.bmi.toFixed(1), meta: rec.bmiStatus },
    { label: "建議熱量", value: `${rec.target}`, meta: "kcal / day" },
  ];

  return (
    <article className={"card formula-showcase" + (embedded ? " is-embedded" : " is-tinted-cream")}>
      {!embedded ? (
        <>
          <div className="card-eyebrow"><span aria-hidden="true">🧠</span>Step 02.5 · 套進公式</div>
          <h2 className="card-title">把目前資料套進公式</h2>
          <p className="card-sub">直接把你現在輸入的身高、體重、活動量與目標帶進公式，先看理論值，再看目前計算器的建議份數。</p>
        </>
      ) : null}

      <div className="formula-overview">
        {summaryCards.map((item) => (
          <article key={item.label} className="formula-pill">
            <span className="formula-pill-label">{item.label}</span>
            <strong className="formula-pill-value">{item.value}</strong>
            <span className="formula-pill-meta">{item.meta}</span>
          </article>
        ))}
      </div>

      <div className="formula-board">
        <article className="formula-stage is-current">
          <span className="formula-stage-kicker">目前資料</span>
          <h3 className="formula-stage-title">先把現在的輸入整理好</h3>
          <div className="formula-identity">
            <span>{profile.heightCm} cm</span>
            <span>{profile.weightKg} kg</span>
            <span>{goal.label}</span>
          </div>
          <p className="formula-stage-copy">
            目前會讀取你在飲食計算器填寫的資料，包含 {sex.label.replace(/[♂♀]/g, "").trim()}、{activity.label} 與飲食目標。
          </p>
        </article>

        <article className="formula-stage is-energy">
          <span className="formula-stage-kicker">1. 每日熱量</span>
          <h3 className="formula-stage-title">先算今天的熱量目標</h3>
          <div className="formula-equation">
            <span className="formula-eq-label">每日熱量</span>
            <strong>{profile.weightKg} × {goal.factor}</strong>
            <span className="formula-eq-mark">=</span>
            <b>{rec.target} kcal</b>
          </div>
          <p className="formula-stage-copy">依照你目前的 {goal.label} 目標，先用每公斤體重 {goal.factor} kcal 做簡化估算。</p>
        </article>

        <article className="formula-stage is-macro">
          <span className="formula-stage-kicker">2. 三大營養素</span>
          <h3 className="formula-stage-title">把熱量換算成克數</h3>
          <div className="formula-macro-lines">
            <div className="formula-macro-line"><span>CHO</span><code>{rec.target} × 50% ÷ 4</code><b>約 {choG} g</b></div>
            <div className="formula-macro-line"><span>PRO</span><code>{rec.target} × 25% ÷ 4</code><b>約 {proG} g</b></div>
            <div className="formula-macro-line"><span>FAT</span><code>{rec.target} × 25% ÷ 9</code><b>約 {fatG} g</b></div>
          </div>
          <p className="formula-stage-copy">碳水與蛋白質每克約 4 kcal，脂肪每克約 9 kcal，所以需要先把熱量拆成克數。</p>
        </article>

        <article className="formula-stage is-serving">
          <div className="formula-stage-head">
            <div>
              <span className="formula-stage-kicker">3. 建議份數</span>
              <h3 className="formula-stage-title">把克數反推成每天該吃幾份</h3>
            </div>
            <div className="formula-note-badge">目前建議值已套用活動量、年齡與 BMI 微調</div>
          </div>

          <div className="formula-serving-grid">
            {servingCards.map((item) => (
              <article key={item.id} className="formula-serving-card">
                <div className="formula-serving-head">
                  <span className="formula-serving-icon" aria-hidden="true">{item.icon}</span>
                  <div>
                    <strong>{item.label}</strong>
                    <span>{item.portion}</span>
                  </div>
                </div>
                <div className="formula-serving-line">公式：<code>{item.formula}</code></div>
                <div className="formula-serving-results">
                  <span className="formula-result-chip">理論值 約 {_N.fmt(item.theory)} 份</span>
                  <span className="formula-result-chip is-current">目前建議 {_N.fmt(item.current)} 份</span>
                </div>
                <p className="formula-serving-tip">{item.tip}</p>
              </article>
            ))}
          </div>
        </article>
      </div>

      <div className="formula-flow-ribbon">
        <span className="flow-step">先估算熱量</span>
        <span className="flow-arrow">→</span>
        <span className="flow-step">分配營養素比例</span>
        <span className="flow-arrow">→</span>
        <span className="flow-step">換算成克數</span>
        <span className="flow-arrow">→</span>
        <span className="flow-step">反推每日建議份數</span>
      </div>
    </article>
  );
}

function ServingsEditor({ servings, setServings, rec }) {
  const set = (id, v) => setServings(s => ({ ...s, [id]: _N.clampServing(id, v) }));
  const isCustom = _N.FOOD_GROUPS.some(g => servings[g.id] !== rec.recommended[g.id]);

  return (
    <article className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div className="card-eyebrow"><span aria-hidden="true">🎚️</span>Step 03 · 微調份數</div>
          <h2 className="card-title">每日飲食份數建議</h2>
          <p className="card-sub">直接用 + / − 微調每一類食物，營養素與圖表會立即重新計算。</p>
        </div>
        <button className="btn"
          onClick={() => setServings(rec.recommended)}
          disabled={!isCustom}>
          <span aria-hidden="true">↻</span>
          恢復系統建議
        </button>
      </div>

      <div className="editor-grid">
        {_N.FOOD_GROUPS.map(g => {
          const cur = servings[g.id];
          const rcm = rec.recommended[g.id];
          return (
            <article key={g.id} className="editor-card" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
              <div className="editor-head">
                <div className="editor-ico" style={{ background: g.tint, color: g.color }}>{g.icon}</div>
                <div style={{ minWidth: 0 }}>
                  <div className="editor-name">{g.label}</div>
                  <div className="editor-desc">{g.desc}</div>
                </div>
              </div>
              <div className="editor-controls">
                <button className="step-btn" onClick={() => set(g.id, cur - 0.5)} aria-label={`減少${g.label}`}>−</button>
                <input className="serving-input" type="number" min="0" max="20" step="0.5"
                  value={cur} onChange={e => set(g.id, Number(e.target.value))} />
                <button className="step-btn" onClick={() => set(g.id, cur + 0.5)} aria-label={`增加${g.label}`}>+</button>
              </div>
              <div className="editor-meta">
                <span>建議 <b>{_N.fmt(rcm)}</b> 份</span>
                <span>目前 <b style={{ color: cur === rcm ? "var(--ink-soft)" : "var(--green-deep)" }}>{_N.fmt(cur)}</b> 份</span>
              </div>
            </article>
          );
        })}
      </div>
    </article>
  );
}

function MacroDonut({ summary }) {
  const { ratios, totals, total, macroKcal } = summary;
  const data = [
    { label: "CHO 碳水",   key: "cho", color: "var(--cho)",  deep: "var(--cho-deep)",  soft: "var(--cho-soft)", g: totals.cho, kcal: macroKcal.cho, ratio: ratios.cho, ico: "🍚", role: "飯、麵與主食能量" },
    { label: "PRO 蛋白質", key: "pro", color: "var(--pro)",  deep: "var(--pro-deep)",  soft: "var(--pro-soft)", g: totals.pro, kcal: macroKcal.pro, ratio: ratios.pro, ico: "🍗", role: "肉、魚、蛋幫助修復" },
    { label: "FAT 脂肪",   key: "fat", color: "var(--fat)",  deep: "var(--fat-deep)",  soft: "var(--fat-soft)", g: totals.fat, kcal: macroKcal.fat, ratio: ratios.fat, ico: "🥑", role: "油脂幫助吸收與飽足" },
  ];
  const sorted = [...data].sort((a, b) => b.ratio - a.ratio);
  const [mainMacro, secondMacro, thirdMacro] = sorted;
  const compactMacros = [secondMacro, thirdMacro].filter(Boolean);

  return (
    <article className="card macro-card">
      <div className="card-eyebrow"><span aria-hidden="true">🍱</span>Step 04 · 營養素分布</div>
      <h2 className="card-title">三大營養素比例</h2>
      <p className="card-sub">用像便當盤一樣的方式看看今天的營養比例，最常出現的營養素會放在最大格。</p>

      <div className="plate-wrap">
        <div className="mealboard" role="img" aria-label="今日餐盤三大營養素比例">
          <div className="mealboard-note">{Math.round(total)} kcal · 今日餐盤</div>
          <div className="mealboard-rim" />
          <div className="mealboard-grid">
            <section
              className={`meal-slot meal-slot-main is-${mainMacro.key}`}
              style={{ "--slot-color": mainMacro.color, "--slot-deep": mainMacro.deep, "--slot-soft": mainMacro.soft }}
            >
              <div className="meal-chip">
                <span className="meal-chip-ico" aria-hidden="true">{mainMacro.ico}</span>
                <span>{mainMacro.label}</span>
              </div>
              <div className="meal-slot-percent">{mainMacro.ratio.toFixed(1)}%</div>
              <div className="meal-slot-copy">{mainMacro.role}</div>
              <div className="meal-slot-meta">
                <span>{Math.round(mainMacro.g)} g</span>
                <span>{Math.round(mainMacro.kcal)} kcal</span>
              </div>
            </section>

            <div className="meal-slot-stack">
              {compactMacros.map((d) => (
                <section
                  key={d.key}
                  className={`meal-slot meal-slot-small is-${d.key}`}
                  style={{ "--slot-color": d.color, "--slot-deep": d.deep, "--slot-soft": d.soft }}
                >
                  <div className="meal-chip">
                    <span className="meal-chip-ico" aria-hidden="true">{d.ico}</span>
                    <span>{d.label}</span>
                  </div>
                  <div className="meal-slot-percent">{d.ratio.toFixed(1)}%</div>
                  <div className="meal-slot-meta">
                    <span>{Math.round(d.g)} g</span>
                    <span>{Math.round(d.kcal)} kcal</span>
                  </div>
                </section>
              ))}
            </div>
          </div>

          <div className="mealboard-caption">
            <span className="mealboard-caption-pill">
              <span className="mealboard-caption-badge" aria-hidden="true">★</span>
              <b>今天最多</b>
              <span>{mainMacro.label}</span>
            </span>
            <span className="mealboard-caption-note">像日常便當盤一樣，最大格代表今天最主要的能量來源。</span>
          </div>

          <div className="mealboard-chopsticks" aria-hidden="true">
            <span />
            <span />
          </div>
        </div>

        <div className="macro-list">
          {data.map((d, i) => (
            <article
              key={d.key}
              className={"macro-story" + (d.key === mainMacro.key ? " is-highlight" : "")}
              style={{
                "--mc": d.color,
                "--mc-deep": d.deep,
                "--mc-soft": d.soft,
                animationDelay: `${i * 100}ms`,
              }}
            >
              <div className="macro-story-head">
                <span className="macro-story-chip">
                  <span className="macro-story-ico">{d.ico}</span>
                  <b>{d.label}</b>
                </span>
                <span className="macro-story-pct">{d.ratio.toFixed(1)}%</span>
              </div>

              <div className="macro-story-stat">
                <div className="macro-story-kcal">
                  <strong>{Math.round(d.kcal)}</strong>
                  <span>kcal</span>
                </div>
                <div className="macro-story-grams">
                  <strong>{Math.round(d.g)}</strong>
                  <span>g</span>
                </div>
              </div>

              <div className="macro-story-bar">
                <div className="macro-story-bar-fill" style={{ width: `${d.ratio}%` }} />
              </div>

              <div className="macro-story-foot">
                <span>{d.role}</span>
                <span className="macro-story-tag">{d.key === mainMacro.key ? "今日主角" : "一起搭配"}</span>
              </div>
            </article>
          ))}
          <div className="macro-total">
            <span className="muted">合計</span>
            <b>{Math.round(total)} kcal</b>
          </div>
        </div>
      </div>
    </article>
  );
}

function ServingGuideBoard({
  targetServings,
  currentServings = null,
  title = "各類食物份數",
  subtitle = "",
  showProgress = false,
}) {
  const totalTarget = _N.FOOD_GROUPS.reduce((acc, g) => acc + (targetServings?.[g.id] || 0), 0);
  const totalCurrent = currentServings
    ? _N.FOOD_GROUPS.reduce((acc, g) => acc + (currentServings?.[g.id] || 0), 0)
    : null;

  function buildStickerStates(target, current) {
    const slotCount = Math.max(1, Math.ceil(target));
    const capped = Math.min(showProgress ? current : target, target);
    const fullCount = Math.floor(Math.max(0, capped));
    const hasHalf = capped - fullCount >= 0.5 && fullCount < slotCount;

    return Array.from({ length: slotCount }, (_, index) => {
      if (index < fullCount) return "full";
      if (hasHalf && index === fullCount) return "half";
      return showProgress ? "empty" : "ghost";
    });
  }

  return (
    <article className={"card serving-guide-board" + (showProgress ? " is-progress" : " is-target-only")}>
      <div className="card-eyebrow"><span aria-hidden="true">📊</span>{showProgress ? "今日份數進度" : "每日份數建議"}</div>
      <h2 className="card-title">{title}</h2>
      <p className="card-sub">
        {subtitle || (showProgress
          ? "依照今天已記錄的食物，自動累計六大類份數進度。"
          : "這裡先看系統建議的每日份量，不顯示目前調整進度。")}
      </p>

      <div className="serving-guide-summary">
        <div className="serving-guide-total">
          <span className="serving-guide-total-label">{showProgress ? "建議總份數" : "今日建議總份數"}</span>
          <strong>{_N.fmt(totalTarget)}</strong>
          <span>份</span>
        </div>

        {showProgress ? (
          <div className="serving-guide-total is-current">
            <span className="serving-guide-total-label">目前進度</span>
            <strong>{_N.fmt(totalCurrent || 0)}</strong>
            <span>/ {_N.fmt(totalTarget)} 份</span>
          </div>
        ) : (
          <div className="serving-guide-note">下面每一列直接顯示建議份量，方便你看今天大概要吃到多少。</div>
        )}
      </div>

      <div className="serving-guide-list">
        {_N.FOOD_GROUPS.map((g, i) => {
          const target = targetServings?.[g.id] || 0;
          const current = currentServings?.[g.id] || 0;
          const states = buildStickerStates(target, current);
          const diff = +(current - target).toFixed(1);
          const status = Math.abs(diff) < 0.3 ? "ok" : diff > 0 ? "over" : "under";

          return (
            <article
              key={g.id}
              className="serving-guide-row"
              style={{ "--sg": g.accent, "--sg-soft": g.tint, animationDelay: `${i * 60}ms` }}
            >
              <div className="serving-guide-row-head">
                <div className="serving-guide-label">
                  <span className="serving-guide-ico">{g.icon}</span>
                  <div>
                    <span className="serving-guide-name">{g.label}</span>
                    <span className="serving-guide-desc">{g.desc}</span>
                  </div>
                </div>

                <div className="serving-guide-values">
                  {showProgress ? (
                    <>
                      <strong>{_N.fmt(current)}</strong>
                      <span>/ {_N.fmt(target)} 份</span>
                    </>
                  ) : (
                    <>
                      <strong>{_N.fmt(target)}</strong>
                      <span>份</span>
                    </>
                  )}
                </div>
              </div>

              <div className="serving-guide-stickers" aria-label={`${g.label}份數圖示`}>
                {states.map((state, index) => (
                  <span
                    key={`${g.id}-${index}`}
                    className={`serving-guide-sticker is-${state}`}
                    title={`${g.label} ${index + 1}`}
                  >
                    {g.icon}
                  </span>
                ))}
              </div>

              <div className="serving-guide-foot">
                <span>建議 {_N.fmt(target)} 份</span>
                {showProgress ? (
                  <>
                    <span>目前 {_N.fmt(current)} 份</span>
                    <span className={`serving-guide-status is-${status}`}>
                      {status === "ok" ? "✓ 已達標" : status === "over" ? `多 ${_N.fmt(Math.abs(diff))} 份` : `少 ${_N.fmt(Math.abs(diff))} 份`}
                    </span>
                  </>
                ) : (
                  <span className="serving-guide-status is-plain">依建議份量排列圖示</span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </article>
  );
}

function ServingBars({ servings, rec }) {
  return (
    <ServingGuideBoard
      targetServings={rec.recommended}
      title="各類食物份數"
      subtitle="這裡只顯示每日建議份量，讓你先看懂今天大概要吃到多少。"
      showProgress={false}
    />
  );
}

function DetailsTable({ summary }) {
  const { fmt } = _N;
  const totalSrv = summary.rows.reduce((a, r) => a + r.servings, 0);
  return (
    <article className="card">
      <div className="card-eyebrow"><span aria-hidden="true">📋</span>明細表</div>
      <h2 className="card-title">每類食物計算明細</h2>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>類別</th><th>份數</th>
              <th>每份 CHO</th><th>每份 PRO</th><th>每份 FAT</th>
              <th>CHO (g)</th><th>PRO (g)</th><th>FAT (g)</th>
              <th>小計</th>
            </tr>
          </thead>
          <tbody>
            {summary.rows.map(r => (
              <tr key={r.id}>
                <td><span className="cell-name"><span className="ico">{r.icon}</span>{r.label}</span></td>
                <td>{fmt(r.servings)} 份</td>
                <td>{r.perServing.cho}</td>
                <td>{r.perServing.pro}</td>
                <td>{r.perServing.fat}</td>
                <td>{fmt(r.choTotal)}</td>
                <td>{fmt(r.proTotal)}</td>
                <td>{fmt(r.fatTotal)}</td>
                <td>{Math.round(r.kcal)} kcal</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>總計</td><td>{fmt(totalSrv)} 份</td>
              <td colSpan="3">—</td>
              <td>{Math.round(summary.totals.cho)}</td>
              <td>{Math.round(summary.totals.pro)}</td>
              <td>{Math.round(summary.totals.fat)}</td>
              <td>{Math.round(summary.total)} kcal</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </article>
  );
}

function CalculatorPage({ profile, setProfile, servings, setServings }) {
  const rec = useMemo(() => _N.buildRecommended(profile), [profile]);
  const summary = useMemo(() => _N.nutritionFromServings(servings), [servings]);
  const delta = summary.total - rec.target;

  return (
    <>
      <Hero />
      <section className="shell workspace">
        <ProfileForm profile={profile} setProfile={setProfile} />
        <div style={{ display: "grid", gap: 18, minWidth: 0 }}>
          <Dashboard rec={rec} summary={summary} profile={profile} calorieDelta={delta} />
          <ServingsEditor servings={servings} setServings={setServings} rec={rec} />
          <div className="chart-grid">
            <MacroDonut summary={summary} />
            <ServingBars servings={servings} rec={rec} />
          </div>
          <DetailsTable summary={summary} />
          <div className="disclaimer">
            <span aria-hidden="true">ℹ️</span>
            <span>此結果為估算值，實際飲食仍需依個人健康狀況、運動安排與營養師建議調整。</span>
          </div>
        </div>
      </section>
    </>
  );
}

window.CalculatorPage = CalculatorPage;
window.FormulaShowcase = FormulaShowcase;
window.ServingGuideBoard = ServingGuideBoard;
