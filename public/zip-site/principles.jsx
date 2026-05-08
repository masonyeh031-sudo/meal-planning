// Calculation Principles page — 4 steps + sample calculation that reads from saved profile.

const { PRINCIPLE_STEPS, SERVING_FORMULAS, GOAL_OPTIONS: GOAL_OPT2, ACTIVITY_OPTIONS: ACT2, SEX_OPTIONS: SEX2,
  recommendedCalories: recCal2, FOOD_GROUPS: FG2 } = window;

const FOOD_EXCHANGE = [
  { id: "grains", label: "全穀雜糧類", cho: 15, pro: 2, fat: 0, examples: "飯、麵、地瓜、燕麥" },
  { id: "protein", label: "豆魚蛋肉類", cho: 0, pro: 7, fat: 5, examples: "豆腐、魚、肉、蛋" },
  { id: "dairy", label: "奶類", cho: 12, pro: 8, fat: 8, examples: "鮮奶、優格、起司" },
  { id: "vegetables", label: "蔬菜類", cho: 5, pro: 1, fat: 0, examples: "深綠、紅橘、菇類" },
  { id: "fruits", label: "水果類", cho: 15, pro: 0, fat: 0, examples: "蘋果、柳丁、香蕉" },
  { id: "fats", label: "油脂與堅果種子類", cho: 0, pro: 0, fat: 5, examples: "油脂、原味堅果" },
];

const SAMPLE_PROFILE = { heightCm: 175, weightKg: 75, age: 30, sex: "male", activity: "medium", goal: "maintain" };

function loadProfile2() {
  try {
    const raw = localStorage.getItem("nutrition.profile");
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

function PrinciplesPage() {
  const stored = loadProfile2();
  const profile = stored || SAMPLE_PROFILE;
  const goal = GOAL_OPT2.find((g) => g.value === profile.goal) || GOAL_OPT2[1];
  const targetCal = recCal2(profile.weightKg, profile.goal);
  const choG = (targetCal * 0.5) / 4;
  const proG = (targetCal * 0.25) / 4;
  const fatG = (targetCal * 0.25) / 9;

  const sexLabel = SEX2.find((s) => s.value === profile.sex)?.label || "—";
  const actLabel = ACT2.find((a) => a.value === profile.activity)?.label || "—";

  return (
    <>
      <PageHead
        eyebrow="CALCULATION GUIDE · 計算原理"
        title='飲食數據<em>怎麼算出來的</em>'
        sub="從身高體重、每日熱量，到飲食份數與營養素，帶你一步一步看懂計算邏輯。"
      />

      <section className="container" style={{ paddingBottom: 80, display: "grid", gap: 28 }}>

        {/* Hero facts */}
        <div className="stats">
          <article className="stat rise" style={{ "--motion-delay": "60ms" }}>
            <span className="label">目前範例</span>
            <strong className="value" style={{ fontSize: 24 }}>
              {profile.heightCm} <small>cm</small> / {profile.weightKg} <small>kg</small>
            </strong>
            <p className="hint">{sexLabel} · {actLabel} · {goal.label}</p>
            <span className="corner-mark">·</span>
          </article>
          <article className="stat rise" style={{ "--motion-delay": "120ms" }}>
            <span className="label">估算每日熱量</span>
            <strong className="value">{targetCal}<small>kcal</small></strong>
            <p className="hint">{profile.weightKg} × {goal.calorieFactor}</p>
            <span className="corner-mark">≈</span>
          </article>
          <article className="stat rise" style={{ "--motion-delay": "180ms" }}>
            <span className="label">資料來源</span>
            <strong className="value" style={{ fontSize: 22 }}>{stored ? "讀取目前輸入" : "教學範例"}</strong>
            <p className="hint">{stored ? "已連動計算器頁面的最新輸入" : "尚未輸入資料，先用 175/75/維持示範"}</p>
            <span className="corner-mark">→</span>
          </article>
          <article className="stat rise" style={{ "--motion-delay": "240ms" }}>
            <span className="label">公式類型</span>
            <strong className="value" style={{ fontSize: 22 }}>簡化版</strong>
            <p className="hint">教學使用，非臨床標準</p>
            <span className="corner-mark">∴</span>
          </article>
        </div>

        {/* 4 steps */}
        <div>
          <div className="section-head">
            <div>
              <span className="eyebrow">流程總覽　·　Process</span>
              <h2>4 個步驟看懂整體邏輯</h2>
            </div>
            <p className="head-meta">熱量 → 比例 → 克數 → 份數，一條線串起來。</p>
          </div>
          <div className="steps-grid">
            {PRINCIPLE_STEPS.map((c, i) => (
              <article key={c.step} className="step-card rise" style={{ "--motion-delay": `${i * 70}ms` }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
                  <span className="step-num">{c.step}</span>
                  <h3>{c.title}</h3>
                </div>
                <p className="detail">{c.detail}</p>
                <div className="formula-block">
                  {c.formula.map((line) => <p key={line}>{line}</p>)}
                </div>
                <p className="step-example">{c.example}</p>
              </article>
            ))}
          </div>

          <article className="card rise" style={{ "--motion-delay": "320ms", marginTop: 18 }}>
            <div className="card-head">
              <div>
                <span className="eyebrow">計算規則　·　Calc Rules</span>
                <h2>估算邏輯一覽</h2>
              </div>
            </div>
            <ul className="calc-rules">
              <li><span className="rule-key">減脂</span><span>體重 × 25 kcal</span></li>
              <li><span className="rule-key">維持</span><span>體重 × 30 kcal</span></li>
              <li><span className="rule-key">增肌</span><span>體重 × 35 kcal</span></li>
              <li className="divide"><span className="rule-key">微調</span><span>活動量、年齡、性別會微調份數分配</span></li>
              <li><span className="rule-key">即時</span><span>手動修改份數，總熱量會即時重算</span></li>
            </ul>
          </article>
        </div>

        {/* Exchange table */}
        <article className="card rise" style={{ "--motion-delay": "60ms" }}>
          <div className="card-head">
            <div>
              <span className="eyebrow">食物代換表　·　Exchange Table</span>
              <h2>每一份大概提供多少營養素</h2>
            </div>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>食物類別</th>
                  <th>每份 CHO</th>
                  <th>每份 PRO</th>
                  <th>每份 FAT</th>
                  <th>常見食物</th>
                </tr>
              </thead>
              <tbody>
                {FOOD_EXCHANGE.map((row) => (
                  <tr key={row.id}>
                    <td><strong>{row.label}</strong></td>
                    <td className="num">{row.cho} g</td>
                    <td className="num">{row.pro} g</td>
                    <td className="num">{row.fat} g</td>
                    <td style={{ color: "var(--ink-soft)" }}>{row.examples}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        {/* Serving formulas */}
        <div>
          <div className="section-head">
            <div>
              <span className="eyebrow">建議份數　·　Serving Formulas</span>
              <h2>份數怎麼由營養素反推</h2>
            </div>
          </div>
          <div className="formula-grid">
            {SERVING_FORMULAS.map((f, i) => (
              <article key={f.label} className="mini-card rise" style={{ "--motion-delay": `${i * 50}ms` }}>
                <span className="label">{f.label}</span>
                <strong>{f.formula}</strong>
              </article>
            ))}
          </div>
          <div style={{ marginTop: 14 }}>
            <p className="tip-box">
              這是一種簡化版的估算方式，目的是讓使用者快速理解份數如何由營養素反推。實際飲食規劃仍可依活動量、疾病、飲食習慣與營養師建議調整。
            </p>
          </div>
        </div>

        {/* Sample calculation */}
        <article className="card rise" style={{ "--motion-delay": "60ms" }}>
          <div className="card-head">
            <div>
              <span className="eyebrow">範例計算　·　Worked Example</span>
              <h2>把目前資料套進公式</h2>
            </div>
            <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-soft)",
              padding: "6px 12px", border: "1px solid var(--line)", borderRadius: 999, background: "var(--bg)" }}>
              {profile.heightCm} cm / {profile.weightKg} kg / {goal.label}
            </span>
          </div>

          <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(3, 1fr)" }} className="example-grid">
            <div className="formula-block" style={{ padding: 16 }}>
              <p style={{ fontFamily: "var(--serif)", fontSize: 14, fontWeight: 600, marginBottom: 10 }}>1. 每日熱量</p>
              <p>{profile.weightKg} × {goal.calorieFactor} = <strong>{targetCal} kcal</strong></p>
            </div>
            <div className="formula-block" style={{ padding: 16 }}>
              <p style={{ fontFamily: "var(--serif)", fontSize: 14, fontWeight: 600, marginBottom: 10 }}>2. 三大營養素克數</p>
              <p>CHO = {targetCal} × 50% ÷ 4 ≈ <strong>{Math.round(choG)} g</strong></p>
              <p>PRO = {targetCal} × 25% ÷ 4 ≈ <strong>{Math.round(proG)} g</strong></p>
              <p>FAT = {targetCal} × 25% ÷ 9 ≈ <strong>{Math.round(fatG)} g</strong></p>
            </div>
            <div className="formula-block" style={{ padding: 16 }}>
              <p style={{ fontFamily: "var(--serif)", fontSize: 14, fontWeight: 600, marginBottom: 10 }}>3. 建議份數示範</p>
              <p>全穀根莖 = {choG.toFixed(0)} × 60% ÷ 15 ≈ <strong>{Math.round((choG * 0.6) / 15)} 份</strong></p>
              <p>水果 = {choG.toFixed(0)} × 20% ÷ 15 ≈ <strong>{Math.round((choG * 0.2) / 15)} 份</strong></p>
              <p>蔬菜 = {choG.toFixed(0)} × 20% ÷ 5 ≈ <strong>{Math.round((choG * 0.2) / 5)} 份</strong></p>
              <p>豆魚蛋肉 = {proG.toFixed(0)} ÷ 7 ≈ <strong>{Math.round(proG / 7)} 份</strong></p>
              <p>油脂堅果 = {fatG.toFixed(0)} ÷ 5 ≈ <strong>{Math.round(fatG / 5)} 份</strong></p>
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <p className="warning-box">
              此為公式反推的理論值。實際網站會依健康飲食原則進一步修正份數，避免某類食物過高或不符合日常飲食習慣。
            </p>
          </div>
        </article>

        <div className="summary-band rise" style={{ "--motion-delay": "60ms" }}>
          先估算熱量 → 分配營養素比例 → 換算成克數 → 用食物代換表反推每日建議份數。
        </div>
      </section>

      <style>{`
        @media (max-width: 880px) { .example-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  );
}

window.PrinciplesPage = PrinciplesPage;
