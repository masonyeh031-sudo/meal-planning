// ===== Food Guide page =====
const _NG = window.NUTRITION;

function FoodGuidePage() {
  return (
    <>
      <section className="shell guide-hero">
        <div className="guide-hero-deco" aria-hidden="true">
          <span className="float f1">🍎</span>
          <span className="float f2">🥦</span>
          <span className="float f3">🥕</span>
          <span className="float f4">🍳</span>
          <span className="float f5">🥛</span>
          <span className="float f6">🥜</span>
          <span className="float f7">🍞</span>
          <span className="float f8">🍇</span>
        </div>
        <span className="hero-eyebrow"><span>🍱</span><span>SIX FOOD GROUPS</span></span>
        <h1 className="big-title">六大類食物指南</h1>
        <p className="big-sub">用簡單清楚的方式，帶你認識每天飲食中不可缺少的六大類食物。</p>
      </section>
      <section className="shell guide-grid">
        {_NG.FOOD_GUIDE.map((g, i) => (
          <article
            key={g.id}
            className="guide-card"
            style={{ animationDelay: `${i * 80}ms`, "--tint": g.tint }}
          >
            <div className="guide-head">
              <div className="guide-ico" style={{ background: g.tint }}>{g.icon}</div>
              <div>
                <div className="guide-name">{g.title}</div>
                <span className="guide-tag" style={{ color: g.accent }}>{g.tag}</span>
              </div>
            </div>
            <p className="guide-role">{g.role}</p>

            <div className="guide-portion-grid">
              <div className="guide-portion">
                <b>手掌估算</b>
                <span>{g.portion.split('，')[0]}</span>
              </div>
              <div className="guide-portion">
                <b>份量翻譯</b>
                <span>{g.portion.split('，')[1] || g.portion}</span>
              </div>
            </div>

            <div className="guide-ex-label">常見食物</div>
            <div className="guide-examples">
              {g.examples.map(ex => <span key={ex} className="guide-chip">{ex}</span>)}
            </div>
          </article>
        ))}
      </section>
      <p style={{ textAlign: "center", color: "var(--ink-soft)", fontSize: 13, padding: "0 0 24px" }}>
        均衡飲食的重點是「每一類都吃到」，先把六大類認得清楚，再調整成適合自己的份量就好。
      </p>
    </>
  );
}
window.FoodGuidePage = FoodGuidePage;
