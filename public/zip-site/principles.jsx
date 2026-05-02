// ===== Calculation Principles page (teaching-style with live data) =====
const _NP = window.NUTRITION;

function PrinciplesPage({ profile }) {
  const rec = _NP.buildRecommended(profile);
  const goal = _NP.GOAL_OPTIONS.find(g => g.value === profile.goal);
  const sex = _NP.SEX_OPTIONS.find(o => o.value === profile.sex);
  const act = _NP.ACTIVITY_OPTIONS.find(o => o.value === profile.activity);

  return (
    <>
      <section className="shell guide-hero">
        <h1 className="big-title">飲食數據怎麼算？<span className="wave">🤔</span></h1>
        <p className="big-sub">從身高體重、每日熱量，到飲食份數與營養素，帶你一步步看懂計算邏輯。</p>

        <div className="prn-snapshot">
          <article className="snap-card">
            <span className="snap-eye">目前資料</span>
            <strong className="snap-val">{profile.heightCm} cm <i>/</i> {profile.weightKg} kg</strong>
            <span className="snap-meta">{sex?.label?.replace(/[♂♀]/g, '').trim()}・{act?.label}・{goal?.label}</span>
          </article>
          <article className="snap-card is-blue">
            <span className="snap-eye">估算熱量</span>
            <strong className="snap-val">{rec.target} <small>kcal</small></strong>
            <span className="snap-meta">{profile.weightKg} × {goal?.factor}</span>
          </article>
          <article className="snap-card is-green">
            <span className="snap-eye">使用資料來源</span>
            <strong className="snap-val" style={{ fontSize: 22 }}>讀取網站目前輸入</strong>
            <span className="snap-meta">已讀取你在計算頁面的最新身高、體重與目標。</span>
          </article>
        </div>
      </section>

      <section className="shell prn-section">
        <div className="section">
          <span className="section-eyebrow">流程邏輯</span>
          <h2 className="section-title">4 個步驟看懂整體邏輯</h2>
        </div>

        <div className="prn-steps">
          <article className="prn-step is-1">
            <div className="prn-num">01</div>
            <h3 className="prn-title">估算每日熱量</h3>
            <p className="prn-desc">系統會依使用者的體重與目標，估算每日熱量需求。</p>
            <div className="prn-formula">
              <div><b>減脂</b><span>體重 × 25 kcal</span></div>
              <div><b>維持</b><span>體重 × 30 kcal</span></div>
              <div><b>增肌</b><span>體重 × 35 kcal</span></div>
            </div>
            <div className="prn-example">
              若體重 {profile.weightKg} kg、目標為{goal?.label}，{profile.weightKg} × {goal?.factor} = <b>{rec.target} kcal</b>
            </div>
          </article>

          <article className="prn-step is-2">
            <div className="prn-num">02</div>
            <h3 className="prn-title">分配三大營養素比例</h3>
            <p className="prn-desc">依個人需求，將熱量分配給碳水化合物、蛋白質與脂肪。</p>
            <div className="prn-formula">
              <div><b>CHO 碳水化合物</b><span>50%</span></div>
              <div><b>PRO 蛋白質</b><span>25%</span></div>
              <div><b>FAT 脂肪</b><span>25%</span></div>
            </div>
            <div className="prn-example">此比例可依個人目標、活動量與健康狀況調整。</div>
          </article>

          <article className="prn-step is-3">
            <div className="prn-num">03</div>
            <h3 className="prn-title">把熱量換算成克數</h3>
            <p className="prn-desc">因為不同營養素每克提供的熱量不同，所以需要將熱量換算成克數。</p>
            <div className="prn-formula">
              <div><b>CHO(g)</b><span>總熱量 × 50% ÷ 4</span></div>
              <div><b>PRO(g)</b><span>總熱量 × 25% ÷ 4</span></div>
              <div><b>FAT(g)</b><span>總熱量 × 25% ÷ 9</span></div>
            </div>
            <div className="prn-example">碳水與蛋白質每克 4 kcal，脂肪每克約 9 kcal。</div>
          </article>

          <article className="prn-step is-4">
            <div className="prn-num">04</div>
            <h3 className="prn-title">反推每日建議份數</h3>
            <p className="prn-desc">得到 CHO、PRO、FAT 克數後，再利用食物代換表換算成天該吃的食物份數。</p>
            <div className="prn-formula">
              <div><b>全穀根莖類、蔬菜類、水果類</b><span>由 CHO 反推</span></div>
              <div><b>豆魚肉蛋類</b><span>由 PRO 反推</span></div>
              <div><b>油脂與堅果種子類</b><span>由 FAT 反推</span></div>
            </div>
            <div className="prn-example">這是一種簡化版估算方式，目的是讓使用者容易理解。</div>
          </article>
        </div>
      </section>

      <section className="shell prn-section">
        <div className="section">
          <span className="section-eyebrow">食物代換表</span>
          <h2 className="section-title">每一份大概提供多少營養素</h2>
        </div>
        <div className="prn-table-wrap">
          <table className="prn-table">
            <thead>
              <tr>
                <th>食物類別</th><th>每份 CHO</th><th>每份 PRO</th><th>每份 FAT</th><th>常見食物例子</th>
              </tr>
            </thead>
            <tbody>
              {[
                { ico: "🍚", name: "全穀根莖類", cho: 15, pro: 2, fat: 0, eg: "飯、麵、地瓜、吐司" },
                { ico: "🥛", name: "奶類",       cho: 12, pro: 8, fat: 8, eg: "牛奶、優格、無糖優酪" },
                { ico: "🥚", name: "豆魚肉蛋類", cho: 0,  pro: 7, fat: 5, eg: "雞肉、魚、雞蛋、豆腐" },
                { ico: "🥦", name: "蔬菜類",     cho: 5,  pro: 1, fat: 0, eg: "青菜、花椰菜、菇類" },
                { ico: "🍎", name: "水果類",     cho: 15, pro: 0, fat: 0, eg: "蘋果、香蕉、芭樂" },
                { ico: "🥜", name: "油脂與堅果種子類", cho: 0, pro: 0, fat: 5, eg: "堅果、橄欖油、酪梨" },
              ].map(r => (
                <tr key={r.name}>
                  <td><span className="cell-name"><span className="ico">{r.ico}</span><b>{r.name}</b></span></td>
                  <td>{r.cho} g</td><td>{r.pro} g</td><td>{r.fat} g</td>
                  <td className="muted">{r.eg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="shell prn-section">
        <div className="section">
          <span className="section-eyebrow">份數反推</span>
          <h2 className="section-title">份數怎麼由營養素反推</h2>
        </div>
        <div className="prn-derive">
          <article className="derive-card is-1"><b>🍚 全穀根莖類</b><span>建議份數 = CHO × 60% ÷ 15</span></article>
          <article className="derive-card is-2"><b>🍎 水果類</b><span>建議份數 = CHO × 20% ÷ 15</span></article>
          <article className="derive-card is-3"><b>🥦 蔬菜類</b><span>建議份數 = CHO × 20% ÷ 5</span></article>
          <article className="derive-card is-4"><b>🥚 豆魚肉蛋類</b><span>建議份數 = PRO ÷ 7</span></article>
          <article className="derive-card is-5"><b>🥛 奶類</b><span>建議固定 1～2 份，常用 2 份</span></article>
          <article className="derive-card is-6"><b>🥜 油脂與堅果種子類</b><span>建議份數 = FAT ÷ 5</span></article>
        </div>
        <div className="disclaimer">
          <span aria-hidden="true">📒</span>
          <span>這是一種簡化估算方式，目的是讓使用者快速理解份數如何由營養素反推而來。實際飲食規劃仍可依照活動量、疾病狀況、飲食習慣等再調整。</span>
        </div>
      </section>

      <section className="shell prn-section">
        <div className="section">
          <span className="section-eyebrow">範例計算</span>
          <h2 className="section-title">把目前資料套進公式</h2>
          <p className="section-sub">使用 <b>{profile.heightCm} cm / {profile.weightKg} kg / {goal?.label}</b> 套進公式試算看看。</p>
        </div>
        {window.FormulaShowcase ? <window.FormulaShowcase profile={profile} rec={rec} embedded /> : null}
      </section>
    </>
  );
}
window.PrinciplesPage = PrinciplesPage;
