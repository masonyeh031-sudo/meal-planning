// Calculator page — focus screen with live calculation, drag servings, donut/bar animations.

const {
  GOAL_OPTIONS, ACTIVITY_OPTIONS, SEX_OPTIONS, FOOD_GROUPS, SERVING_LIMITS,
  buildRecommendation, nutritionFromServings, clampServing, recommendedCalories,
  bmiOf, bmiStatus,
} = window;

const DEFAULT_PROFILE = { heightCm: 170, weightKg: 65, age: 28, sex: "female", activity: "medium", goal: "maintain" };

const EXPORT_ACTIONS = [
  { id: "pdf", label: "匯出 PDF", icon: "PDF" },
  { id: "jpg", label: "匯出 JPG", icon: "JPG" },
  { id: "csv", label: "Google CSV", icon: "CSV" },
  { id: "xls", label: "匯出 Excel", icon: "XLS" },
];

function loadProfile() {
  try {
    const raw = localStorage.getItem("nutrition.profile");
    if (raw) return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch (e) {}
  return DEFAULT_PROFILE;
}

function CalculatorPage() {
  const [profile, setProfile] = React.useState(loadProfile);
  const [servings, setServings] = React.useState(() => buildRecommendation(loadProfile()).recommendedServings);
  const [exporting, setExporting] = React.useState(null);
  const [exportProgress, setExportProgress] = React.useState(0);
  const [exportMsg, setExportMsg] = React.useState(null);

  const recommendation = React.useMemo(() => buildRecommendation(profile), [profile]);

  // Reset servings to recommendation when profile changes.
  const profileKey = `${profile.heightCm}-${profile.weightKg}-${profile.age}-${profile.sex}-${profile.activity}-${profile.goal}`;
  React.useEffect(() => {
    setServings(recommendation.recommendedServings);
  }, [profileKey]);

  React.useEffect(() => {
    try { localStorage.setItem("nutrition.profile", JSON.stringify(profile)); } catch (e) {}
  }, [profile]);

  const summary = React.useMemo(() => nutritionFromServings(servings), [servings]);
  const calorieDelta = summary.totalCal - recommendation.targetCalories;
  const isCustom = FOOD_GROUPS.some((g) => servings[g.id] !== recommendation.recommendedServings[g.id]);

  const goalLabel = GOAL_OPTIONS.find((g) => g.value === profile.goal).label;
  const activityLabel = ACTIVITY_OPTIONS.find((a) => a.value === profile.activity).label;

  const macros = [
    { id: "cho", label: "CHO 碳水", grams: summary.totals.cho, cal: summary.macroCal.cho, ratio: summary.ratios.cho, hue: "grain" },
    { id: "pro", label: "PRO 蛋白", grams: summary.totals.pro, cal: summary.macroCal.pro, ratio: summary.ratios.pro, hue: "protein" },
    { id: "fat", label: "FAT 脂肪", grams: summary.totals.fat, cal: summary.macroCal.fat, ratio: summary.ratios.fat, hue: "veg" },
  ];

  const macroColors = { cho: "var(--hue-grain)", pro: "var(--hue-protein)", fat: "var(--hue-veg)" };

  function setServing(id, val) {
    setServings((s) => ({ ...s, [id]: clampServing(id, val) }));
  }

  function handleExport(id) {
    if (exporting) return;
    setExporting(id); setExportProgress(0); setExportMsg(null);
    const start = performance.now();
    const total = 1500 + Math.random() * 600;
    const step = () => {
      const p = Math.min(1, (performance.now() - start) / total);
      setExportProgress(p);
      if (p < 1) requestAnimationFrame(step);
      else {
        setExporting(null);
        setExportMsg(`已下載 飲食計劃-${new Date().toISOString().slice(0, 10)}.${id === "csv" ? "csv" : id === "xls" ? "xls" : id}`);
      }
    };
    requestAnimationFrame(step);
  }

  return (
    <>
      <PageHead
        eyebrow="DAILY NUTRITION CALCULATOR"
        title='每日<em>飲食份數</em>與營養素'
        sub="輸入身高、體重、年齡與目標，系統會即時估算每日建議熱量、六大類食物份數與三大營養素。所有調整即時更新。"
      />

      <section className="container workspace">
        {/* ── Sidebar ───────────────────────────────────── */}
        <aside className="sidebar">
          <article className="card rise" style={{ "--motion-delay": "60ms" }}>
            <div className="card-head">
              <div>
                <span className="eyebrow">輸入區</span>
                <h2>個人資料</h2>
              </div>
            </div>

            <div className="form-grid">
              <NumField label="身高" unit="cm" value={profile.heightCm} min={100} max={230} step={1}
                onChange={(v) => setProfile((p) => ({ ...p, heightCm: v }))}/>
              <NumField label="體重" unit="kg" value={profile.weightKg} min={30} max={200} step={0.5}
                onChange={(v) => setProfile((p) => ({ ...p, weightKg: v }))}/>
              <NumField label="年齡" unit="years" value={profile.age} min={10} max={100} step={1}
                onChange={(v) => setProfile((p) => ({ ...p, age: v }))}/>
              <div className="field">
                <div className="field-label">性別</div>
                <div className="seg">
                  {SEX_OPTIONS.map((o) => (
                    <button key={o.value} aria-pressed={profile.sex === o.value}
                      onClick={() => setProfile((p) => ({ ...p, sex: o.value }))}>{o.label}</button>
                  ))}
                </div>
              </div>
              <div className="field field-full">
                <div className="field-label">活動量</div>
                <div className="seg">
                  {ACTIVITY_OPTIONS.map((o) => (
                    <button key={o.value} aria-pressed={profile.activity === o.value}
                      onClick={() => setProfile((p) => ({ ...p, activity: o.value }))}>{o.label}</button>
                  ))}
                </div>
              </div>
              <div className="field field-full">
                <div className="field-label">飲食目標</div>
                <div className="goal-pills">
                  {GOAL_OPTIONS.map((g) => (
                    <button key={g.value} className="goal-pill" aria-pressed={profile.goal === g.value}
                      onClick={() => setProfile((p) => ({ ...p, goal: g.value }))}>
                      <strong>{g.label}</strong>
                      <span>{g.hint}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </article>

        </aside>

        {/* ── Main column ───────────────────────────────── */}
        <div className="main-col">
          {/* Stats */}
          <div className="stats">
            <StatCard label="每日建議熱量" value={recommendation.targetCalories} unit="kcal"
              hint={`${goalLabel}模式 · ${profile.weightKg} kg × ${GOAL_OPTIONS.find((g) => g.value === profile.goal).calorieFactor}`}
              corner="01" delay={80}/>
            <StatCard label="目前份數熱量" value={Math.round(summary.totalCal)} unit="kcal"
              hint={Math.abs(calorieDelta) < 30
                ? "與建議值接近"
                : (calorieDelta > 0 ? `高於建議 ${Math.round(calorieDelta)} kcal` : `低於建議 ${Math.round(Math.abs(calorieDelta))} kcal`)}
              corner="02" delay={140}/>
            <StatCard label="BMI" value={recommendation.bmi} decimals={1} unit={recommendation.bmiStatus}
              hint="由身高、體重估算" corner="03" delay={200}/>
            <StatCard label="份數分配基準" value={activityLabel} unit={`${profile.age} 歲`}
              hint="活動量、年齡會微調分配" corner="04" delay={260}/>
          </div>

          {/* Servings editor */}
          <article className="card rise" style={{ "--motion-delay": "180ms" }}>
            <div className="card-head">
              <div>
                <span className="eyebrow">結果區　·　Servings Editor</span>
                <h2>每日六大類食物份數</h2>
              </div>
              <button className="btn ghost" onClick={() => setServings(recommendation.recommendedServings)} disabled={!isCustom}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M11 6.5a4.5 4.5 0 11-1.32-3.18M11 1v3h-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                恢復系統建議
              </button>
            </div>
            <p className="note" style={{ marginTop: -6, marginBottom: 16 }}>
              拖曳滑桿、按 +/-，或直接輸入數字。系統會即時更新熱量與三大營養素比例。
            </p>

            <div className="editor-grid">
              {FOOD_GROUPS.map((g, i) => {
                const cur = servings[g.id];
                const tgt = recommendation.recommendedServings[g.id];
                const lim = SERVING_LIMITS[g.id];
                const isCustom = cur !== tgt;
                return (
                  <div key={g.id} className={"serving-card rise " + (isCustom ? "customized" : "")}
                    style={{ "--motion-delay": `${200 + i * 50}ms`, ...hueVars(g.hue) }}>
                    <div className="serving-head">
                      <div>
                        <h3>{g.label}</h3>
                        <p>{g.description}</p>
                      </div>
                      <div className="badge" style={hueVars(g.hue)}>{g.short}</div>
                    </div>
                    <div className="serving-slider">
                      <div className="track">
                        <div className="fill" style={{ width: `${(cur / lim.max) * 100}%`, "--hue": `var(--hue-${g.hue})` }}/>
                      </div>
                      <div className="target-marker" style={{ left: `${(tgt / lim.max) * 100}%`, "--hue": `var(--hue-${g.hue})` }}/>
                      <input type="range" min={0} max={lim.max} step={0.5} value={cur}
                        style={{ "--hue": `var(--hue-${g.hue})` }}
                        onChange={(e) => setServing(g.id, Number(e.target.value))}/>
                    </div>
                    <div className="serving-controls">
                      <button className="stepper" onClick={() => setServing(g.id, cur - 0.5)}>−</button>
                      <div className="serving-value">
                        <Counter value={cur} decimals={cur % 1 === 0 ? 0 : 1}/><small>份</small>
                      </div>
                      <button className="stepper" onClick={() => setServing(g.id, cur + 0.5)}>＋</button>
                    </div>
                    <div className="serving-meta">
                      <span>建議 {fmt(tgt)} 份</span>
                      {isCustom ? <span className="delta">{cur > tgt ? "+" : ""}{fmt(cur - tgt)}</span> : <span>已套用建議</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          {/* Macro mini cards */}
          <div className="macro-grid">
            {macros.map((m, i) => (
              <article key={m.id} className="macro-card rise" style={{ "--motion-delay": `${260 + i * 60}ms`, ...hueVars(m.hue) }}>
                <div className="stripe"/>
                <span className="label">{m.label}</span>
                <strong className="grams"><Counter value={m.grams} decimals={0}/> g</strong>
                <span className="meta"><Counter value={m.cal} decimals={0}/> kcal · <Counter value={m.ratio} decimals={1}/>%</span>
              </article>
            ))}
          </div>

          {/* Charts */}
          <article className="card rise" style={{ "--motion-delay": "320ms" }}>
            <div className="card-head">
              <div>
                <span className="eyebrow">圖表　·　Charts</span>
                <h2>三大營養素 與 各類份數</h2>
              </div>
            </div>
            <div className="donut-wrap" style={{ marginBottom: 28 }}>
              <Donut
                segments={macros.map((m) => ({ value: m.cal, color: macroColors[m.id] }))}
                centerValue={<Counter value={Math.round(summary.totalCal)}/>}
                centerLabel="kcal"
              />
              <div className="legend">
                {macros.map((m) => (
                  <div key={m.id} className="legend-row">
                    <span className="swatch" style={{ background: macroColors[m.id] }}/>
                    <span className="name">{m.label}<small><Counter value={Math.round(m.cal)}/> kcal · <Counter value={Math.round(m.grams)}/> g</small></span>
                    <span className="pct"><Counter value={m.ratio} decimals={1}/>%</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ borderTop: "1px solid var(--line-soft)", paddingTop: 22 }}>
              <BarList
                rows={FOOD_GROUPS.map((g) => ({
                  id: g.id, label: g.label, short: g.short, hue: g.hue,
                  value: servings[g.id], target: recommendation.recommendedServings[g.id],
                  color: `var(--hue-${g.hue})`,
                }))}
              />
            </div>
          </article>

          {/* Export */}
          <article className="card rise" style={{ "--motion-delay": "380ms" }}>
            <div className="card-head">
              <div>
                <span className="eyebrow">匯出　·　Export</span>
                <h2>下載報表與試算表</h2>
              </div>
            </div>
            <p className="note" style={{ marginTop: -6, marginBottom: 16 }}>
              PDF / JPG 為視覺報表；CSV 可直接匯入 Google 試算表；XLS 可在 Excel 開啟。
            </p>
            <div className="export-bar">
              {EXPORT_ACTIONS.map((a) => {
                const isMe = exporting === a.id;
                return (
                  <button key={a.id} className="export-btn" disabled={!!exporting} onClick={() => handleExport(a.id)}>
                    {isMe ? <span className="spinner"/> : <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-mute)" }}>{a.icon}</span>}
                    {isMe ? "匯出中…" : a.label}
                    {isMe && <span className="progress" style={{ width: `${exportProgress * 100}%` }}/>}
                  </button>
                );
              })}
            </div>
            {exportMsg && <p className="export-status">{exportMsg}</p>}
          </article>

          {/* Detail table */}
          <article className="card rise" style={{ "--motion-delay": "420ms" }}>
            <div className="card-head">
              <div>
                <span className="eyebrow">明細　·　Breakdown</span>
                <h2>每類食物計算明細</h2>
              </div>
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>食物類別</th>
                    <th>份數</th>
                    <th>每份 CHO</th>
                    <th>每份 PRO</th>
                    <th>每份 FAT</th>
                    <th>CHO 計算</th>
                    <th>PRO 計算</th>
                    <th>FAT 計算</th>
                    <th>小計熱量</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.rows.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <div className="row-title">
                          <div className="badge" style={{ width: 26, height: 26, fontSize: 12, ...hueVars(r.hue) }}>{r.short}</div>
                          <div>
                            <strong style={{ display: "block" }}>{r.label}</strong>
                            <span style={{ fontSize: 11.5, color: "var(--ink-mute)" }}>{r.description}</span>
                          </div>
                        </div>
                      </td>
                      <td className="num">{fmt(r.servings)}</td>
                      <td className="num">{r.cho} g</td>
                      <td className="num">{r.pro} g</td>
                      <td className="num">{r.fat} g</td>
                      <td className="num">{fmt(r.servings)} × {r.cho} = {fmt(r.choTotal)}</td>
                      <td className="num">{fmt(r.servings)} × {r.pro} = {fmt(r.proTotal)}</td>
                      <td className="num">{fmt(r.servings)} × {r.fat} = {fmt(r.fatTotal)}</td>
                      <td className="num">{Math.round(r.subtotalCalories)} kcal</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>總計</td>
                    <td className="num"><Counter value={FOOD_GROUPS.reduce((a, g) => a + servings[g.id], 0)} decimals={1}/></td>
                    <td/><td/><td/>
                    <td className="num"><Counter value={Math.round(summary.totals.cho)}/> g</td>
                    <td className="num"><Counter value={Math.round(summary.totals.pro)}/> g</td>
                    <td className="num"><Counter value={Math.round(summary.totals.fat)}/> g</td>
                    <td className="num"><Counter value={Math.round(summary.totalCal)}/> kcal</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </article>

          <p className="disclaimer">此結果為估算值，實際飲食仍需依個人健康狀況、運動安排與營養師建議調整。</p>
        </div>
      </section>
    </>
  );
}

function StatCard({ label, value, unit, hint, corner, delay, decimals = 0 }) {
  const isNumeric = typeof value === "number";
  return (
    <article className="stat rise" style={{ "--motion-delay": `${delay}ms` }}>
      <span className="label">{label}</span>
      <strong className="value">
        <span key={String(value)} className="value-flip">
          {isNumeric ? <Counter value={value} decimals={decimals}/> : value}
        </span>
        <small>{unit}</small>
      </strong>
      <p className="hint">{hint}</p>
      <span className="corner-mark">{corner}</span>
    </article>
  );
}

function NumField({ label, unit, value, min, max, step, onChange }) {
  return (
    <div className="field">
      <div className="field-label">{label} <span className="unit">{unit}</span></div>
      <div className="numeric">
        <button className="step" onClick={() => onChange(Math.max(min, Math.round((value - step) / step) * step))}>−</button>
        <input type="number" value={value} min={min} max={max} step={step}
          onChange={(e) => { const v = Number(e.target.value); if (Number.isFinite(v)) onChange(Math.min(max, Math.max(min, v))); }}/>
        <button className="step" onClick={() => onChange(Math.min(max, Math.round((value + step) / step) * step))}>＋</button>
      </div>
    </div>
  );
}

window.CalculatorPage = CalculatorPage;
