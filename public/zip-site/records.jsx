// ===== 7-day Records page =====
const QUICK_FOODS = [
  { name: "白飯", icon: "🍚", amt: "1 碗", kcal: 280 },
  { name: "雞蛋", icon: "🥚", amt: "1 顆", kcal: 75 },
  { name: "雞胸肉", icon: "🍗", amt: "1 掌心", kcal: 165 },
  { name: "牛奶", icon: "🥛", amt: "240ml", kcal: 150 },
  { name: "青菜", icon: "🥬", amt: "1 碟", kcal: 25 },
  { name: "蘋果", icon: "🍎", amt: "1 顆", kcal: 95 },
  { name: "堅果", icon: "🥜", amt: "1 湯匙", kcal: 90 },
  { name: "豆漿", icon: "🥣", amt: "1 杯", kcal: 80 },
];

const MEALS = [
  { id: "breakfast", label: "早餐", icon: "🌅", tint: "var(--cream-soft)" },
  { id: "lunch",     label: "午餐", icon: "☀️", tint: "var(--orange-soft)" },
  { id: "dinner",    label: "晚餐", icon: "🌙", tint: "var(--blue-soft)" },
  { id: "snack",     label: "點心", icon: "🍪", tint: "var(--green-soft)" },
  { id: "midnight",  label: "宵夜", icon: "🌃", tint: "var(--lilac-soft)" },
];

const DAY_LABELS = ["週一", "週二", "週三", "週四", "週五", "週六", "週日"];

function emptyDay() {
  return { breakfast: [], lunch: [], dinner: [], snack: [], midnight: [] };
}
function emptyWeek() {
  return DAY_LABELS.map(() => emptyDay());
}

function loadRecords() {
  try {
    const raw = localStorage.getItem("meal-records-v1");
    if (!raw) return emptyWeek();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== 7) return emptyWeek();
    return parsed;
  } catch { return emptyWeek(); }
}
function saveRecords(w) {
  try { localStorage.setItem("meal-records-v1", JSON.stringify(w)); } catch {}
}

function RecordsPage({ targetKcal, onToast }) {
  const [week, setWeek] = useState(() => loadRecords());
  const [activeDay, setActiveDay] = useState(0);
  const [activeMeal, setActiveMeal] = useState("breakfast");

  useEffect(() => { saveRecords(week); }, [week]);

  const day = week[activeDay] || emptyDay();
  const dayKcal = MEALS.reduce((acc, m) => acc + (day[m.id]?.reduce((a, f) => a + (f.kcal || 0), 0) || 0), 0);
  const itemCount = MEALS.reduce((acc, m) => acc + (day[m.id]?.length || 0), 0);
  const completion = Math.min(100, (dayKcal / Math.max(1, targetKcal)) * 100);

  function add(food) {
    setWeek(w => {
      const next = w.map((d, i) => i === activeDay ? { ...d } : d);
      const cur = next[activeDay];
      cur[activeMeal] = [...(cur[activeMeal] || []), { ...food, id: Date.now() + Math.random() }];
      return next;
    });
    onToast({ icon: "✨", text: `已加入 ${food.icon} ${food.name}` });
  }
  function remove(mealId, foodId) {
    setWeek(w => {
      const next = w.map((d, i) => i === activeDay ? { ...d } : d);
      const cur = next[activeDay];
      cur[mealId] = (cur[mealId] || []).filter(f => f.id !== foodId);
      return next;
    });
  }
  function clearDay() {
    if (!confirm("確定要清空今天的紀錄嗎？")) return;
    setWeek(w => w.map((d, i) => i === activeDay ? emptyDay() : d));
    onToast({ icon: "🧹", text: "已清空今天的紀錄" });
  }

  function dayTotalK(d) {
    return MEALS.reduce((a, m) => a + (d[m.id]?.reduce((x, f) => x + (f.kcal || 0), 0) || 0), 0);
  }

  return (
    <>
      <section className="shell guide-hero">
        <SectionTitle
          eyebrow="Diet Records · 七日紀錄"
          title="記下這一週的飲食"
          sub="點擊常用食物快速加入，或用每餐卡片管理今天的紀錄。資料會自動存在你的瀏覽器中。"
        />
      </section>
      <section className="shell records">
        <aside style={{ display: "grid", gap: 12, alignContent: "start" }}>
          <article className="card" style={{ padding: 18 }}>
            <div className="card-eyebrow"><span aria-hidden="true">📅</span>本週</div>
            <h3 className="card-title" style={{ fontSize: 18 }}>選擇日期</h3>
            <div className="day-list" style={{ marginTop: 12 }}>
              {DAY_LABELS.map((d, i) => {
                const k = Math.round(dayTotalK(week[i]));
                return (
                  <button
                    key={i}
                    className={"day-pill" + (activeDay === i ? " is-active" : "")}
                    onClick={() => setActiveDay(i)}
                  >
                    <span className="day-name">{d}</span>
                    <span className="day-meta">{k > 0 ? `${k} kcal` : "未紀錄"}</span>
                  </button>
                );
              })}
            </div>
          </article>

          <article className="card is-tinted-cream" style={{ padding: 18 }}>
            <div className="card-eyebrow"><span aria-hidden="true">📊</span>今日總覽</div>
            <h3 className="card-title" style={{ fontSize: 18 }}>{DAY_LABELS[activeDay]}</h3>
            <div style={{ display: "grid", gap: 14, marginTop: 14 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span style={{ color: "var(--ink-soft)", fontWeight: 700 }}>熱量</span>
                  <span style={{ fontWeight: 700 }}>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 20 }}>{Math.round(dayKcal)}</span>
                    <span style={{ color: "var(--ink-soft)" }}> / {targetKcal} kcal</span>
                  </span>
                </div>
                <div className="stat-bar"><i style={{ width: `${completion}%`, background: "var(--orange)" }} /></div>
                <div style={{ marginTop: 6, fontSize: 12, color: "var(--ink-soft)" }}>
                  完成度 {completion.toFixed(0)}% · 已紀錄 {itemCount} 項
                </div>
              </div>
              <button className="btn" onClick={clearDay} disabled={itemCount === 0}>
                <span aria-hidden="true">🧹</span>清空今天
              </button>
            </div>
          </article>
        </aside>

        <div className="day-detail">
          <div className="quick-add">
            <div className="quick-add-title">
              <span aria-hidden="true">⚡</span>
              <span>常用食物 · 點擊快速加入到</span>
              <select
                className="select"
                style={{ padding: "4px 28px 4px 10px", fontSize: 12, fontWeight: 700, height: 28, marginLeft: 4 }}
                value={activeMeal}
                onChange={e => setActiveMeal(e.target.value)}
              >
                {MEALS.map(m => <option key={m.id} value={m.id}>{m.icon} {m.label}</option>)}
              </select>
            </div>
            <div className="quick-chips">
              {QUICK_FOODS.map(f => (
                <button key={f.name} className="quick-chip" onClick={() => add(f)}>
                  <span>{f.icon}</span>
                  <span>{f.name}</span>
                  <span style={{ color: "var(--ink-mute)", fontSize: 11 }}>{f.kcal} kcal</span>
                </button>
              ))}
            </div>
          </div>

          {MEALS.map(m => {
            const list = day[m.id] || [];
            const k = list.reduce((a, f) => a + (f.kcal || 0), 0);
            return (
              <article key={m.id} className="meal-card">
                <div className="meal-head">
                  <div className="meal-name">
                    <span className="meal-ico" style={{ background: m.tint }}>{m.icon}</span>
                    {m.label}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span className="meal-kcal">{Math.round(k)} kcal</span>
                    <button
                      className="btn"
                      style={{ padding: "6px 12px", fontSize: 12 }}
                      onClick={() => { setActiveMeal(m.id); }}
                    >
                      <span aria-hidden="true">＋</span>選此餐
                    </button>
                  </div>
                </div>
                {list.length === 0 ? (
                  <div className="empty-meal">
                    <span className="ico" aria-hidden="true">{m.icon}</span>
                    {activeDay === 0 && m.id === "breakfast"
                      ? "今天還沒有紀錄，先從早餐開始吧！"
                      : `${m.label}還是空的，點上方常用食物快速加入吧。`}
                  </div>
                ) : (
                  <div>
                    {list.map(f => (
                      <div key={f.id} className="food-row">
                        <div className="food-info">
                          <span className="ico" aria-hidden="true">{f.icon}</span>
                          <div>
                            <div className="food-name">{f.name}</div>
                            <div className="food-amt">{f.amt}</div>
                          </div>
                        </div>
                        <span className="food-kcal">{f.kcal} kcal</span>
                        <button className="food-x" onClick={() => remove(m.id, f.id)} aria-label="移除">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
window.RecordsPage = RecordsPage;
