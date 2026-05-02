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
  const { ratios, totals, total } = summary;
  const data = [
    { label: "CHO 碳水",   key: "cho", color: "var(--cho)",  deep: "var(--cho-deep)",  soft: "var(--cho-soft)", g: totals.cho, ratio: ratios.cho, ico: "🍚", food: "米飯", role: "提供主要能量" },
    { label: "PRO 蛋白質", key: "pro", color: "var(--pro)",  deep: "var(--pro-deep)",  soft: "var(--pro-soft)", g: totals.pro, ratio: ratios.pro, ico: "🍗", food: "主菜", role: "建造肌肉組織" },
    { label: "FAT 脂肪",   key: "fat", color: "var(--fat)",  deep: "var(--fat-deep)",  soft: "var(--fat-soft)", g: totals.fat, ratio: ratios.fat, ico: "🥑", food: "油脂", role: "幫助吸收養分" },
  ];

  // Macro circle sizes — radius in px, scales with ratio (clamped to 70–140)
  const sizeFor = (r) => Math.max(78, Math.min(150, 70 + r * 1.6));

  return (
    <article className="card">
      <div className="card-eyebrow"><span aria-hidden="true">🍱</span>Step 04 · 營養素分布</div>
      <h2 className="card-title">三大營養素比例</h2>
      <p className="card-sub">把今天的營養素裝進圓盤裡看看 — 哪一格放最多？</p>

      <div className="plate-wrap">
        {/* 圓盤 */}
        <div className="plate" role="img" aria-label="今日營養圓盤">
          <div className="plate-tape"><span>{Math.round(total)} kcal · 今日營養盤</span></div>
          <div className="plate-ring" />
          <div className="plate-bowls">
            {data.map((d, i) => {
              const s = sizeFor(d.ratio);
              return (
                <div
                  key={d.key}
                  className={`bowl bowl-${d.key}`}
                  style={{
                    width: s,
                    height: s,
                    background: `radial-gradient(circle at 35% 30%, ${d.soft} 0%, ${d.color} 70%, ${d.deep} 100%)`,
                    animationDelay: `${i * 120}ms`,
                  }}
                >
                  <span className="bowl-ico">{d.ico}</span>
                  <div className="bowl-info">
                    <span className="bowl-pct" style={{ color: d.deep }}>{d.ratio.toFixed(0)}<i>%</i></span>
                    <span className="bowl-key" style={{ color: d.deep }}>{d.key.toUpperCase()}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="plate-chops" aria-hidden="true">🥢</div>
        </div>

        {/* 詳情卡片 */}
        <div className="macro-list">
          {data.map((d, i) => (
            <div
              key={d.key}
              className="macro-row"
              style={{
                "--mc": d.color,
                "--mc-deep": d.deep,
                "--mc-soft": d.soft,
                animationDelay: `${i * 100}ms`,
              }}
            >
              <div className="macro-row-head">
                <span className="macro-chip">
                  <span className="macro-ico">{d.ico}</span>
                  <b>{d.label}</b>
                </span>
                <span className="macro-pct">{d.ratio.toFixed(1)}%</span>
              </div>
              <div className="macro-bar">
                <div className="macro-bar-fill" style={{ width: `${d.ratio}%` }} />
              </div>
              <div className="macro-row-meta">
                <span><b>{Math.round(d.g)}</b> g</span>
                <span className="dot">·</span>
                <span>{Math.round(d.g * (d.key === "fat" ? 9 : 4))} kcal</span>
                <span className="dot">·</span>
                <span className="muted">{d.role}</span>
              </div>
            </div>
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

function ServingBars({ servings, rec }) {
  const max = Math.max(
    ..._N.FOOD_GROUPS.map(g => servings[g.id]),
    ..._N.FOOD_GROUPS.map(g => rec.recommended[g.id]),
    1
  );
  const totalNow = _N.FOOD_GROUPS.reduce((a, g) => a + servings[g.id], 0);
  const totalRec = _N.FOOD_GROUPS.reduce((a, g) => a + rec.recommended[g.id], 0);
  return (
    <article className="card">
      <div className="card-eyebrow"><span aria-hidden="true">📈</span>份數對照</div>
      <h2 className="card-title">各類食物份數</h2>
      <div className="bullet-legend">
        <span className="bl-item"><span className="bl-dot bl-target" />建議份數</span>
        <span className="bl-item"><span className="bl-dot bl-now" />目前份數</span>
        <span className="bl-spacer" />
        <span className="bl-summary">合計 {_N.fmt(totalNow)} / 建議 {_N.fmt(totalRec)} 份</span>
      </div>
      <div className="bullets">
        {_N.FOOD_GROUPS.map((g, i) => {
          const now = servings[g.id];
          const target = rec.recommended[g.id];
          const diff = +(now - target).toFixed(1);
          const pct = (now / Math.max(target, 0.5)) * 100;
          const status = Math.abs(diff) < 0.3 ? "ok" : diff > 0 ? "over" : "under";
          return (
            <div
              key={g.id}
              className="bullet-row"
              style={{ "--gc": g.accent, "--gc-soft": g.tint, animationDelay: `${i * 60}ms` }}
            >
              <div className="bullet-label">
                <span className="bullet-ico">{g.icon}</span>
                <span className="bullet-name">{g.label}</span>
              </div>
              <div className="bullet-track">
                {/* 建議底框 */}
                <div
                  className="bullet-target"
                  style={{ width: `${(target / max) * 100}%` }}
                  title={`建議 ${_N.fmt(target)} 份`}
                />
                {/* 目前填色 */}
                <div
                  className="bullet-now"
                  style={{ width: `${(now / max) * 100}%` }}
                />
                {/* 建議刻度線 */}
                <div
                  className="bullet-tick"
                  style={{ left: `${(target / max) * 100}%` }}
                  aria-hidden="true"
                />
              </div>
              <div className="bullet-num">
                <span className={`bullet-now-num`}>{_N.fmt(now)}</span>
                <span className="bullet-of">/ {_N.fmt(target)}</span>
                <span className={`bullet-diff is-${status}`}>
                  {status === "ok" ? "✓ 達標" : status === "over" ? `+${_N.fmt(Math.abs(diff))}` : `−${_N.fmt(Math.abs(diff))}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </article>
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
          <FormulaShowcase profile={profile} rec={rec} />
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
