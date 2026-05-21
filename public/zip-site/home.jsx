// Home landing page — Apple-style scrolling feature highlights.

const { PAGES: HOME_PAGES } = window;

function HomePage() {
  const goto = (id) => () => { window.location.hash = id; };

  return (
    <div className="home">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="home-hero">
        <div className="home-container">
          <span className="home-kicker">飲食計劃 · Daily Nutrition</span>
          <h1 className="home-hero-title">
            算對熱量。<br/>
            <em>吃對份數。</em>
          </h1>
          <p className="home-hero-sub">
            依國健署「每日飲食指南」設計，從身高體重一鍵算出每日熱量與六大類食物份數。
            計算、紀錄、外食對照、長期追蹤，一個網站就完整。
          </p>
          <div className="home-cta">
            <button className="home-btn primary" onClick={goto("calculator")}>開始計算 →</button>
            <button className="home-btn ghost" onClick={goto("guide")}>看食物指南</button>
          </div>

          {/* mini preview chips */}
          <div className="home-hero-chips">
            <div className="hchip"><strong>1,950</strong><span>kcal / 天</span></div>
            <div className="hchip"><strong>22.5</strong><span>BMI</span></div>
            <div className="hchip"><strong>6 / 6</strong><span>類達標</span></div>
            <div className="hchip"><strong>30 天</strong><span>紀錄圖表</span></div>
          </div>
        </div>
        <div className="home-hero-bg" aria-hidden="true"/>
      </section>

      {/* ── Feature 1 · Calculator ───────────────────────── */}
      <Feature
        kicker="飲食計算器　·　Calculator"
        title={<>輸入身高體重，<br/>份數<em>立即出現</em>。</>}
        body="活動量、年齡、目標一起納入考量，結果即時更新。可拖曳滑桿微調，三大營養素與熱量會跟著重算。完成的份數計畫可一鍵匯出 PDF / JPG / CSV / Excel。"
        cta="進入計算器"
        onClick={goto("calculator")}
        align="center"
        visual={
          <div className="hv-calc">
            <div className="hv-row">
              <div className="hv-stat"><span>每日建議</span><strong>1,950</strong><small>kcal</small></div>
              <div className="hv-stat"><span>BMI</span><strong>22.5</strong><small>正常</small></div>
              <div className="hv-stat"><span>達標</span><strong>6 / 6</strong><small>類別</small></div>
            </div>
            <div className="hv-bars">
              {[["全穀雜糧", 0.92, "#c8923a"], ["豆魚蛋肉", 0.78, "#b85a2a"], ["蔬菜", 0.66, "#4a6b32"], ["水果", 0.45, "#8a3d3d"]].map(([n, w, c]) => (
                <div key={n} className="hv-bar">
                  <span className="hv-bar-label">{n}</span>
                  <span className="hv-bar-track"><span className="hv-bar-fill" style={{ width: (w * 100) + "%", background: c }}/></span>
                </div>
              ))}
            </div>
          </div>
        }
      />

      {/* ── Feature 2 · Guide ────────────────────────────── */}
      <Feature
        kicker="六大類食物指南　·　Food Guide"
        title={<>六大類食物，<br/><em>用手掌就能量。</em></>}
        body="把每天該吃多少份「全穀、蛋豆魚肉、奶、蔬菜、水果、油脂堅果」翻譯成手掌大小的估算法。每類食物都有色票、份數範圍與常見食物範例。"
        cta="看食物指南"
        onClick={goto("guide")}
        align="left"
        bg="moss"
        visual={
          <div className="hv-cards">
            {[
              ["全穀雜糧", "🍚", "#c8923a"],
              ["豆魚蛋肉", "🍳", "#b85a2a"],
              ["低脂奶", "🥛", "#e8c47a"],
              ["蔬菜", "🥬", "#4a6b32"],
              ["水果", "🍎", "#8a3d3d"],
              ["油脂堅果", "🥜", "#9a7b3a"],
            ].map(([n, e, c]) => (
              <div key={n} className="hv-mini" style={{ borderColor: c }}>
                <span className="hv-mini-em">{e}</span>
                <strong style={{ color: c }}>{n}</strong>
              </div>
            ))}
          </div>
        }
      />

      {/* ── Feature 3 · Eating out ───────────────────────── */}
      <Feature
        kicker="外食怎麼吃　·　Eating Out"
        title={<>不會做飯也沒關係，<br/><em>211 餐盤搞定。</em></>}
        body="便利商店、火鍋、自助餐、早餐店、麵店⋯⋯ 10 種情境一次教會你選什麼。紅黃綠燈標示常見食物，五個經典踩雷組合提醒。"
        cta="看外食指南"
        onClick={goto("eating-out")}
        align="right"
        bg="sun"
        visual={
          <div className="hv-plate">
            <div className="hv-plate-veg">蔬菜 1/2</div>
            <div className="hv-plate-right">
              <div className="hv-plate-pro">蛋白質 1/4</div>
              <div className="hv-plate-carb">全穀 1/4</div>
            </div>
          </div>
        }
      />

      {/* ── Feature 4 · Principles ───────────────────────── */}
      <Feature
        kicker="計算原理　·　Principles"
        title={<>每個數字，<br/><em>都有公式可看。</em></>}
        body="不是黑盒。四個步驟：熱量 → 比例 → 克數 → 份數，搭配食物代換表，告訴你網站是怎麼從你的體重算出 1,950 kcal、再變成 10 份全穀雜糧的。"
        cta="看計算原理"
        onClick={goto("principles")}
        align="left"
        visual={
          <div className="hv-steps">
            {[
              ["1", "每日熱量", "體重 × 30 kcal"],
              ["2", "營養比例", "CHO 50% · PRO 25% · FAT 25%"],
              ["3", "換成克數", "kcal ÷ 4 或 9"],
              ["4", "反推份數", "克數 ÷ 代換表"],
            ].map(([n, t, f]) => (
              <div key={n} className="hv-step">
                <span className="hv-step-num">{n}</span>
                <div>
                  <strong>{t}</strong>
                  <span className="hv-step-formula">{f}</span>
                </div>
              </div>
            ))}
          </div>
        }
      />

      {/* ── Feature 5 · Records ──────────────────────────── */}
      <Feature
        kicker="七天飲食紀錄　·　Records"
        title={<>記下今天吃的，<br/><em>看見 30 天趨勢。</em></>}
        body="按日期記錄早午晚加點心，自動加總熱量與六大類份數。「查看紀錄」可看到 30 天總覽：每日熱量趨勢、達標日數、堆疊條圖示，並可匯出 CSV / JPG / PDF。"
        cta="開始紀錄"
        onClick={goto("records")}
        align="center"
        bg="plum"
        visual={
          <div className="hv-trend">
            {[0.4, 0.65, 0.55, 0.8, 0.7, 0.9, 0.75, 0.6, 0.85, 0.7, 0.95, 0.8, 0.65, 0.78].map((h, i) => (
              <span key={i} className="hv-trend-bar" style={{ height: (h * 100) + "%" }}/>
            ))}
            <span className="hv-trend-line"/>
          </div>
        }
      />

      {/* ── Closing ─────────────────────────────────────── */}
      <section className="home-closing">
        <div className="home-container">
          <span className="home-kicker">準備好了嗎</span>
          <h2 className="home-closing-title">
            從<em>一頓飯</em>開始，<br/>看見一週的改變。
          </h2>
          <div className="home-cta">
            <button className="home-btn primary" onClick={goto("calculator")}>立即試算 →</button>
            <button className="home-btn ghost" onClick={goto("records")}>看紀錄功能</button>
          </div>
          <p className="home-footnote">
            此網站為飲食衛教教學示範，估算結果非臨床標準。實際飲食仍需依個人健康狀況、運動安排與營養師建議調整。
          </p>
        </div>
      </section>
    </div>
  );
}

function Feature({ kicker, title, body, cta, onClick, visual, align = "center", bg }) {
  return (
    <section className={"home-feature align-" + align + (bg ? " bg-" + bg : "")}>
      <div className="home-container home-feature-inner">
        <div className="home-feature-text">
          <span className="home-kicker">{kicker}</span>
          <h2 className="home-feature-title">{title}</h2>
          <p className="home-feature-body">{body}</p>
          <button className="home-feature-link" onClick={onClick}>{cta} →</button>
        </div>
        <div className="home-feature-visual">{visual}</div>
      </div>
    </section>
  );
}

window.HomePage = HomePage;
