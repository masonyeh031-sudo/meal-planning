// 7-day diet records page — log meals across a week, track totals vs target.

const { DAYS, MEALS, FOOD_GROUPS: FG3, todayDate, GOAL_OPTIONS: GO3, recommendedCalories: rc3 } = window;

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
    for (let i = 0; i < 7; i++) for (const m of MEALS) d[`${i}:${m.id}`] = { name: "", category: "grains", amount: "", cal: "" };
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

  function setDraft(key, patch) { setDrafts((d) => ({ ...d, [key]: { ...d[key], ...patch } })); }
  function addEntry(mealId) {
    const key = `${active}:${mealId}`;
    const dr = drafts[key];
    if (!dr.name.trim()) return;
    const amount = Number(dr.amount) || 1;
    const cal = dr.cal !== "" ? Number(dr.cal) : Math.round((CAT_CAL_PER_SERVING[dr.category] || 50) * amount);
    setWeek((w) => {
      const nw = [...w];
      nw[active] = { ...nw[active], meals: { ...nw[active].meals, [mealId]: [...nw[active].meals[mealId], { id: uid(), name: dr.name.trim(), category: dr.category, amount, cal }] } };
      return nw;
    });
    setDraft(key, { name: "", amount: "", cal: "" });
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

        {/* Meal cards */}
        <div className="meal-grid">
          {MEALS.map((m, i) => {
            const entries = day.meals[m.id];
            const draftKey = `${active}:${m.id}`;
            const draft = drafts[draftKey];
            const mealCal = entries.reduce((a, e) => a + e.cal, 0);
            return (
              <article key={m.id} className="meal-card rise" style={{ "--motion-delay": `${i * 60}ms` }}>
                <div className="meal-head">
                  <h3><span className="icon">{m.icon}</span>{m.label}</h3>
                  <span className="meal-cal">{mealCal} kcal · {entries.length} 項</span>
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
                          <span className="name">{e.name}<span className="amount">{e.amount} 份</span></span>
                          <span className="cal">{e.cal} kcal</span>
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
                    onChange={(e) => setDraft(draftKey, { amount: e.target.value })}/>
                  <input className="input" placeholder="kcal" type="number" value={draft.cal}
                    onChange={(e) => setDraft(draftKey, { cal: e.target.value })}/>
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
