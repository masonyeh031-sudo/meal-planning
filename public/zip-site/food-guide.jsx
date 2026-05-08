// Food Guide page — six categories, plate ratio visual, hand portions.

const { FOOD_GUIDE, PLATE_RATIO, HAND_PORTION } = window;

function PlateCallout({ side, hue, badge, tag, title, note }) {
  return (
    <div className={`plate-callout side-${side}`} style={hueVars(hue)}>
      <div className="callout-icon">
        <span className="callout-badge">{badge}</span>
      </div>
      <div className="callout-body">
        <div className="callout-tag">{tag}</div>
        <h4 className="callout-title">{title}</h4>
        <p className="callout-note">{note}</p>
      </div>
      <div className="callout-line"/>
    </div>
  );
}

function FoodGuidePage() {
  return (
    <>
      <PageHead
        eyebrow="SIX FOOD GROUPS · 食物指南"
        title='六大類食物<em>怎麼換算</em>'
        sub="從每份大概是多少、可以怎麼替換，到 1/2 餐盤蔬菜、1/4 全穀、1/4 蛋白的搭配原則。看一眼就能在餐桌上估好份數。"
      />

      <section className="container" style={{ paddingBottom: 80, display: "grid", gap: 32 }}>

        {/* My Plate visual */}
        <article className="card rise plate-card" style={{ "--motion-delay": "60ms" }}>
          <div className="plate-card-head">
            <span className="eyebrow">我的餐盤　·　My Plate</span>
            <h2>聰明吃<em>，營養跟著來</em></h2>
            <p className="plate-card-sub">六大類食物每天都要吃，份量按比例擺好就對了。</p>
          </div>

          <div className="myplate-scene" aria-hidden="false">
            {/* LEFT callouts */}
            <PlateCallout side="left" hue="dairy" badge="奶"
              tag="每天早晚一杯奶"
              title="乳品類"
              note="每天 1.5–2 杯（1 杯 240 毫升）"/>
            <PlateCallout side="left" hue="fruit" badge="果"
              tag="每餐水果拳頭大"
              title="水果類"
              note="在地當季多樣化"/>
            <PlateCallout side="left" hue="veg" badge="菜"
              tag="菜比水果多一點"
              title="蔬菜類"
              note="當季且 1/3 選深色"/>

            {/* The plate itself */}
            <div className="myplate-stage">
              <div className="chopsticks" aria-hidden="true">
                <span/><span/>
              </div>

              <div className="myplate-rect">
                <div className="myplate-shadow"/>
                <div className="myplate-grid">
                  <div className="myplate-cell c-fruit">
                    <div className="cell-fill" style={hueVars("fruit")}/>
                    <span className="cell-tag">水果</span>
                  </div>
                  <div className="myplate-cell c-veg">
                    <div className="cell-fill" style={hueVars("veg")}/>
                    <span className="cell-tag">蔬菜</span>
                  </div>
                  <div className="myplate-col">
                    <div className="myplate-cell c-protein">
                      <div className="cell-fill" style={hueVars("protein")}/>
                      <span className="cell-tag">豆魚蛋肉</span>
                    </div>
                    <div className="myplate-cell c-grain">
                      <div className="cell-fill" style={hueVars("grain")}/>
                      <span className="cell-tag">全穀雜糧</span>
                    </div>
                  </div>
                </div>

                {/* Floating circles on the plate */}
                <div className="myplate-circle dairy-circle" style={hueVars("dairy")}>
                  <span>奶</span>
                </div>
                <div className="myplate-circle nuts-circle" style={hueVars("fat")}>
                  <span>堅果</span>
                </div>
              </div>

              <div className="myplate-caption">
                <span className="caption-dot" style={hueVars("fruit")}/>
                水果
                <span className="caption-dot" style={hueVars("veg")}/>
                蔬菜
                <span className="caption-dot" style={hueVars("protein")}/>
                豆魚蛋肉
                <span className="caption-dot" style={hueVars("grain")}/>
                全穀雜糧
              </div>
            </div>

            {/* RIGHT callouts */}
            <PlateCallout side="right" hue="fat" badge="油"
              tag="堅果種子一茶匙"
              title="油脂與堅果種子類"
              note="每餐一茶匙，相當於大拇指第一節大小"/>
            <PlateCallout side="right" hue="protein" badge="蛋"
              tag="豆魚蛋肉一掌心"
              title="豆魚蛋肉類"
              note="豆 ＞ 魚 ＞ 蛋 ＞ 肉"/>
            <PlateCallout side="right" hue="grain" badge="穀"
              tag="飯跟蔬菜一樣多"
              title="全穀雜糧類"
              note="至少 1/3 為未精製全穀雜糧"/>
          </div>

          <div className="plate-mottos">
            {[
              { k: "吃得下", v: "善用烹飪軟化助吞咽" },
              { k: "吃得夠", v: "少量多餐能吃盡量吃" },
              { k: "吃得對", v: "每天吃足 6 大類食物" },
              { k: "吃得巧", v: "天然調味食更美味" },
            ].map((m) => (
              <div key={m.k} className="motto-pill">
                <strong>{m.k}</strong>
                <span>{m.v}</span>
              </div>
            ))}
          </div>
        </article>

        {/* Hand portions */}
        <div>
          <div className="section-head">
            <div>
              <span className="eyebrow">手測份量　·　Hand Portions</span>
              <h2>沒有秤，也能估份數</h2>
            </div>
            <p className="head-meta">用手掌、拳頭、碗、湯匙這些日常單位來估算，比公克數更直覺。</p>
          </div>
          <div className="hand-grid">
            {HAND_PORTION.map((h, i) => (
              <article key={h.label} className="hand-card rise" style={{ "--motion-delay": `${i * 50}ms` }}>
                <div className="hand-mark">{h.badge}</div>
                <div>
                  <strong>{h.label}</strong>
                  <div className="measure">{h.measure}</div>
                  <p>{h.note}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Six groups */}
        <div>
          <div className="section-head">
            <div>
              <span className="eyebrow">六大類食物　·　Six Groups</span>
              <h2>每一類大概要怎麼吃</h2>
            </div>
            <p className="head-meta">點開每張卡片可以看到常見的代換項目；外食或自煮都派得上用場。</p>
          </div>
          <div className="guide-grid">
            {FOOD_GUIDE.map((item, i) => (
              <article key={item.id} className="guide-card rise" style={{ "--motion-delay": `${i * 60}ms`, ...hueVars(item.hue) }}>
                <div className="guide-head">
                  <div className="badge" style={{ width: 44, height: 44, fontSize: 18, ...hueVars(item.hue) }}>{item.badge}</div>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.role}</p>
                  </div>
                </div>
                <span className="guide-quick" style={hueVars(item.hue)}>＝ {item.quickLook}</span>
                <p className="guide-portion">{item.portion}</p>
                <div className="guide-exchanges">
                  {item.exchanges.map((ex) => <span key={ex} className="exchange-chip">{ex}</span>)}
                </div>
                <p className="guide-reminder">{item.reminder}</p>
              </article>
            ))}
          </div>
        </div>

        <p className="disclaimer">六大類食物份數的估算是教育性質的簡化，實際飲食搭配可依個人狀況微調。</p>
      </section>
    </>
  );
}

window.FoodGuidePage = FoodGuidePage;
