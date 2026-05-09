// 7-day diet records page — log meals across a week, track totals vs target.

const { DAYS, MEALS, FOOD_GROUPS: FG3, todayDate, GOAL_OPTIONS: GO3, recommendedCalories: rc3,
  nutritionFromServings: nfs3, buildRecommendation: br3 } = window;

const CAT_OPTIONS = FG3.map((g) => ({ id: g.id, label: g.label, short: g.short, hue: g.hue }));

// Per-category rough calorie/serving for auto-calorie when amount = servings.
const CAT_CAL_PER_SERVING = { grains: 70, protein: 75, dairy: 150, vegetables: 25, fruits: 60, fats: 45 };

const SAMPLE_WEEK = (() => {
  const week = [];
  for (let i = 0; i < 7; i++) {
    week.push({
      date: todayDate(i - 3),
      meals: { breakfast: [], lunch: [], dinner: [], snack: [] },
    });
  }
  // Pre-fill day 0 with example entries.
  week[0].meals.breakfast = [
    { id: "1", name: "燕麥粥", category: "grains", amount: 1.5, cal: 105 },
    { id: "2", name: "水煮蛋", category: "protein", amount: 1, cal: 75 },
    { id: "3", name: "無糖豆漿", category: "dairy", amount: 1, cal: 75 },
  ];
  week[0].meals.lunch = [
    { id: "4", name: "糙米飯", category: "grains", amount: 2, cal: 140 },
    { id: "5", name: "雞胸肉", category: "protein", amount: 2, cal: 150 },
    { id: "6", name: "炒青菜", category: "vegetables", amount: 1.5, cal: 38 },
    { id: "7", name: "蘋果", category: "fruits", amount: 1, cal: 60 },
  ];
  return week;
})();

function loadWeek() {
  try {
    const raw = localStorage.getItem("nutrition.week");
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return SAMPLE_WEEK;
}

function loadProfile3() {
  try {
    const raw = localStorage.getItem("nutrition.profile");
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

function uid() { return Math.random().toString(36).slice(2, 9); }

function dayTotal(day) {
  return Object.values(day.meals).flat().reduce((a, e) => a + (Number(e.cal) || 0), 0);
}

function RecordsPage() {
  const [week, setWeek] = React.useState(loadWeek);
  const [active, setActive] = React.useState(0);
  const [drafts, setDrafts] = React.useState(() => {
    const d = {};
    for (let i = 0; i < 7; i++) for (const m of MEALS) d[`${i}:${m.id}`] = { name: "", category: "grains", amount: "" };
    return d;
  });

  const profile = loadProfile3();
  const target = profile ? rc3(profile.weightKg, profile.goal) : null;

  React.useEffect(() => {
    try { localStorage.setItem("nutrition.week", JSON.stringify(week)); } catch (e) {}
  }, [week]);

  const day = week[active];
  const dayCal = dayTotal(day);
  const weekCal = week.reduce((a, d) => a + dayTotal(d), 0);
  const filledDays = week.filter((d) => Object.values(d.meals).flat().length > 0).length;

  // Compute today's actual servings (sum amount per category) + nutrition.
  const dayServings = React.useMemo(() => {
    const s = {};
    for (const g of FG3) s[g.id] = 0;
    for (const e of Object.values(day.meals).flat()) {
      const amt = Number(e.amount) || 0;
      if (s[e.category] === undefined) continue;
      s[e.category] += amt;
    }
    return s;
  }, [day]);
  const daySummary = React.useMemo(() => nfs3(dayServings), [dayServings]);
  const dayRec = React.useMemo(() => profile ? br3(profile) : null, [profile]);
  const dayMacros = [
    { id: "cho", label: "CHO 碳水", grams: daySummary.totals.cho, cal: daySummary.macroCal.cho, ratio: daySummary.ratios.cho },
    { id: "pro", label: "PRO 蛋白", grams: daySummary.totals.pro, cal: daySummary.macroCal.pro, ratio: daySummary.ratios.pro },
    { id: "fat", label: "FAT 脂肪", grams: daySummary.totals.fat, cal: daySummary.macroCal.fat, ratio: daySummary.ratios.fat },
  ];
  const dayMacroColors = { cho: "var(--hue-grain)", pro: "var(--hue-protein)", fat: "var(--hue-veg)" };
  const totalEntriesToday = Object.values(day.meals).flat().length;
  const reachedCount = dayRec
    ? FG3.filter((g) => Math.abs(dayServings[g.id] - dayRec.recommendedServings[g.id]) < 0.5).length
    : 0;

  function setDraft(key, patch) { setDrafts((d) => ({ ...d, [key]: { ...d[key], ...patch } })); }
  function addEntry(mealId) {
    const key = `${active}:${mealId}`;
    const dr = drafts[key];
    if (!dr.name.trim()) return;
    const amount = Number(dr.amount) || 1;
    const cal = Math.round((CAT_CAL_PER_SERVING[dr.category] || 50) * amount);
    setWeek((w) => {
      const nw = [...w];
      nw[active] = { ...nw[active], meals: { ...nw[active].meals, [mealId]: [...nw[active].meals[mealId], { id: uid(), name: dr.name.trim(), category: dr.category, amount, cal }] } };
      return nw;
    });
    setDraft(key, { name: "", amount: "" });
  }
  function removeEntry(mealId, id) {
    setWeek((w) => {
      const nw = [...w];
      nw[active] = { ...nw[active], meals: { ...nw[active].meals, [mealId]: nw[active].meals[mealId].filter((e) => e.id !== id) } };
      return nw;
    });
  }

  const delta = target ? dayCal - target : 0;
  const status = !target ? null : Math.abs(delta) <= 150 ? { label: "接近建議值", tone: "ok" }
    : delta > 0 ? { label: `高於建議 ${Math.round(delta)} kcal`, tone: "over" }
    : { label: `低於建議 ${Math.round(-delta)} kcal`, tone: "under" };

  return (
    <>
      <PageHead
        eyebrow="WEEKLY DIET RECORDS · 七天紀錄"
        title='記下這一週<em>吃了什麼</em>'
        sub="按日期切換，分早午晚與點心填入飲食內容；系統會自動加總每日熱量，並對照計算器頁面的建議值。"
      />

      <section className="container" style={{ paddingBottom: 80, display: "grid", gap: 22 }}>
        {/* Day tabs */}
        <div className="day-tabs">
          {week.map((d, i) => {
            const has = Object.values(d.meals).flat().length > 0;
            const cal = dayTotal(d);
            const dt = d.date.split("-");
            return (
              <button key={i} className={"day-tab " + (active === i ? "active" : "")} onClick={() => setActive(i)}>
                <span className="day-name">星期{DAYS[i]}</span>
                <span className="day-date">{dt[1]}/{dt[2]}</span>
                <span className="day-cal">{has ? `${cal} kcal` : "—"}</span>
                <span className={"day-status " + (has ? "filled" : "")}/>
              </button>
            );
          })}
        </div>

        {/* Day stats */}
        <div className="stats">
          <article className="stat rise" style={{ "--motion-delay": "40ms" }}>
            <span className="label">當日總熱量</span>
            <strong className="value"><Counter value={dayCal}/><small>kcal</small></strong>
            <p className="hint">{status ? status.label : "尚未在計算器設定目標"}</p>
            <span className="corner-mark">日</span>
          </article>
          <article className="stat rise" style={{ "--motion-delay": "100ms" }}>
            <span className="label">建議值</span>
            <strong className="value">{target || "—"}<small>kcal</small></strong>
            <p className="hint">{profile ? `${GO3.find((g) => g.value === profile.goal).label} · ${profile.weightKg} kg` : "請先在計算器頁面輸入"}</p>
            <span className="corner-mark">標</span>
          </article>
          <article className="stat rise" style={{ "--motion-delay": "160ms" }}>
            <span className="label">本週總熱量</span>
            <strong className="value"><Counter value={weekCal}/><small>kcal</small></strong>
            <p className="hint">已紀錄 {filledDays} / 7 天</p>
            <span className="corner-mark">週</span>
          </article>
          <article className="stat rise" style={{ "--motion-delay": "220ms" }}>
            <span className="label">建議週累計</span>
            <strong className="value">{target ? target * 7 : "—"}<small>kcal</small></strong>
            <p className="hint">建議值 × 7 天</p>
            <span className="corner-mark">∑</span>
          </article>
        </div>

        {/* Macros + serving progress vs target */}
        <article className="card rise" style={{ "--motion-delay": "260ms" }}>
          <div className="card-head">
            <div>
              <span className="eyebrow">圖表　·　Charts</span>
              <h2>三大營養素 與 各類份數</h2>
            </div>
            {dayRec ? (
              <span className={"records-quest " + (reachedCount === FG3.length ? "is-done" : "")}>
                <span className="records-quest-icon" aria-hidden="true">{reachedCount === FG3.length ? "🎉" : "🎯"}</span>
                <span className="records-quest-body">
                  <strong>達標任務</strong>
                  <span><Counter value={reachedCount}/> / {FG3.length} 類達標</span>
                </span>
              </span>
            ) : (
              <span className="records-quest is-empty">先在計算器頁設定建議值</span>
            )}
          </div>

          <p className="note" style={{ marginTop: -6, marginBottom: 16 }}>
            根據今天輸入的飲食內容，自動加總三大營養素與六大類食物份數，並對照計算器頁面的建議值。
          </p>

          {totalEntriesToday === 0 ? (
            <div className="records-empty-charts">
              <span className="records-empty-emoji" aria-hidden="true">🍽️</span>
              <p>今天還沒記錄任何飲食，先到下方加入一筆吧。</p>
            </div>
          ) : (
            <>
              <div className="donut-wrap" style={{ marginBottom: 24 }}>
                <Donut
                  segments={dayMacros.map((m) => ({ value: m.cal, color: dayMacroColors[m.id] }))}
                  centerValue={<Counter value={Math.round(daySummary.totalCal)}/>}
                  centerLabel="kcal"
                />
                <div className="legend">
                  {dayMacros.map((m) => (
                    <div key={m.id} className="legend-row">
                      <span className="swatch" style={{ background: dayMacroColors[m.id] }}/>
                      <span className="name">{m.label}<small><Counter value={Math.round(m.cal)}/> kcal · <Counter value={Math.round(m.grams)}/> g</small></span>
                      <span className="pct"><Counter value={m.ratio} decimals={1}/>%</span>
                    </div>
                  ))}
                </div>
              </div>
              {dayRec && (
                <div style={{ borderTop: "1px solid var(--line-soft)", paddingTop: 22 }}>
                  <BarList
                    showStatus={true}
                    rows={FG3.map((g) => ({
                      id: g.id, label: g.label, short: g.short, hue: g.hue,
                      value: dayServings[g.id], target: dayRec.recommendedServings[g.id],
                      color: `var(--hue-${g.hue})`,
                    }))}
                  />
                </div>
              )}
            </>
          )}
        </article>

        {/* Meal cards */}
        <div className="meal-grid">
          {MEALS.map((m, i) => {
            const entries = day.meals[m.id];
            const draftKey = `${active}:${m.id}`;
            const draft = drafts[draftKey];
            const mealServings = entries.reduce((a, e) => a + (Number(e.amount) || 0), 0);
            return (
              <article key={m.id} className="meal-card rise" style={{ "--motion-delay": `${i * 60}ms` }}>
                <div className="meal-head">
                  <h3><span className="icon">{m.icon}</span>{m.label}</h3>
                  <span className="meal-cal">{fmt(mealServings)} 份 · {entries.length} 項</span>
                </div>

                {entries.length === 0 ? (
                  <div className="entry-empty">尚未記錄</div>
                ) : (
                  <div className="entry-list">
                    {entries.map((e) => {
                      const cat = FG3.find((g) => g.id === e.category);
                      return (
                        <div key={e.id} className="entry-row">
                          <div className="cat-dot" style={hueVars(cat?.hue || "grain")}>{cat?.short || "·"}</div>
                          <span className="name">{e.name}</span>
                          <span className="cal">{e.amount} 份</span>
                          <button className="delete-btn" onClick={() => removeEntry(m.id, e.id)} aria-label="刪除">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="entry-form">
                  <input className="input name-input" placeholder="食物名稱" value={draft.name}
                    onChange={(e) => setDraft(draftKey, { name: e.target.value })}
                    onKeyDown={(e) => { if (e.key === "Enter") addEntry(m.id); }}/>
                  <select className="select" value={draft.category} onChange={(e) => setDraft(draftKey, { category: e.target.value })}>
                    {CAT_OPTIONS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                  <input className="input" placeholder="份數" type="number" step="0.5" value={draft.amount}
                    onChange={(e) => setDraft(draftKey, { amount: e.target.value })}
                    onKeyDown={(e) => { if (e.key === "Enter") addEntry(m.id); }}/>
                  <button className="btn primary add-btn" onClick={() => addEntry(m.id)}>新增</button>
                </div>
              </article>
            );
          })}
        </div>

        <p className="disclaimer">資料儲存於本機瀏覽器 localStorage；切換裝置後不會同步。</p>
      </section>
    </>
  );
}

window.RecordsPage = RecordsPage;
