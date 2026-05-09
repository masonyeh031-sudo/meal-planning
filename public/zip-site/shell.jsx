// Shared shell — top bar, page chrome, donut/bar charts, common bits.

const { useState, useEffect, useRef, useMemo } = React;

const PAGES = [
  { id: "calculator", label: "飲食計算器", sub: "Calculator" },
  { id: "guide", label: "六大類食物指南", sub: "Food Guide" },
  { id: "eating-out", label: "外食怎麼吃", sub: "Eating Out" },
  { id: "principles", label: "計算原理", sub: "Principles" },
  { id: "records", label: "七天飲食紀錄", sub: "Records" },
];

function useHashRoute() {
  const [route, setRoute] = useState(() => window.location.hash.replace("#", "") || "calculator");
  useEffect(() => {
    const onHash = () => setRoute(window.location.hash.replace("#", "") || "calculator");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const navigate = (id) => { window.location.hash = id; };
  return [route, navigate];
}

function TopBar({ route, navigate }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <div className="brand">
          <div className="brand-mark">飲</div>
          <div className="brand-text">
            <strong>飲食計劃</strong>
            <span>Daily Nutrition · 民國 115 春</span>
          </div>
        </div>
        <nav className="nav" aria-label="主要分頁">
          {PAGES.map((p) => (
            <button
              key={p.id}
              className={"nav-link " + (route === p.id ? "active" : "")}
              onClick={() => navigate(p.id)}
            >
              {p.label}
            </button>
          ))}
        </nav>
        <div className="topbar-actions">
          <button className="icon-btn menu-toggle" aria-label="選單" onClick={() => setMobileOpen((v) => !v)}>
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
              <path d="M1 1h16M1 7h16M1 13h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="mobile-nav">
          {PAGES.map((p) => (
            <button
              key={p.id}
              className={"nav-link " + (route === p.id ? "active" : "")}
              onClick={() => { navigate(p.id); setMobileOpen(false); }}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

function PageHead({ eyebrow, title, sub, children }) {
  return (
    <section className="page-head">
      <div className="container">
        <div className="rise" style={{ "--motion-delay": "0ms" }}>
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="page-title" dangerouslySetInnerHTML={{ __html: title }} />
          {sub && <p className="page-sub">{sub}</p>}
          {children}
        </div>
      </div>
    </section>
  );
}

// Donut chart with smooth conic-gradient transitions.
function Donut({ segments, centerValue, centerLabel }) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  let cur = 0;
  const stops = segments.map((s) => {
    const a = (s.value / total) * 360;
    const start = cur;
    cur += a;
    return `${s.color} ${start}deg ${cur}deg`;
  });
  const bg = `conic-gradient(${stops.join(", ")})`;
  return (
    <div className="donut" style={{ backgroundImage: bg }}>
      <div className="donut-center">
        <strong>{centerValue}</strong>
        <span>{centerLabel}</span>
      </div>
    </div>
  );
}

// Bar list with target marker + optional status pill.
function BarList({ rows, showStatus = true, targetOnly = false }) {
  const max = Math.max(...rows.map((r) => Math.max(r.value, r.target)), 1);
  return (
    <div className="bar-list">
      {rows.map((r, i) => {
        const diff = +(r.value - r.target).toFixed(1);
        const status = r.target > 0 && Math.abs(diff) >= 0.5
          ? (diff > 0 ? "over" : "under")
          : "ok";
        const absDiff = Math.abs(diff);
        const statusDecimals = Number.isInteger(absDiff) ? 0 : 1;
        const statusNode = status === "ok"
          ? "✓ 達標"
          : (
            <>
              {status === "over" ? "多 " : "差 "}
              <Counter value={absDiff} decimals={statusDecimals}/>
              {" 份"}
            </>
          );
        return (
          <div
            key={r.id}
            className="bar-row rise"
            style={{ "--motion-delay": `${i * 50}ms`, "--hue": r.color, ...(r.hue ? hueVars(r.hue) : {}) }}
          >
            <div className="bar-meta">
              <span className="bar-label">
                {r.short && <span className="bar-badge">{r.short}</span>}
                <strong>{r.label}</strong>
              </span>
              {showStatus && <span className={"bar-status is-" + status}>{statusNode}</span>}
            </div>
            <div className="bar-track">
              <div className="bar-target" style={{ width: `${(r.target / max) * 100}%` }}/>
              <div className="bar-fill" style={{ width: `${(r.value / max) * 100}%` }}/>
              <div className="bar-target-pin" style={{ left: `${(r.target / max) * 100}%` }} aria-hidden="true">
                <span className="bar-target-pin-label">建議份數 {fmt(r.target)}</span>
              </div>
            </div>
            <div className="bar-foot">
              {targetOnly ? (
                <span>建議份數 <strong><Counter value={r.target} decimals={Number.isInteger(r.target) ? 0 : 1}/></strong> 份</span>
              ) : (
                <>
                  <span>目前 <strong><Counter value={r.value} decimals={Number.isInteger(r.value) ? 0 : 1}/></strong> 份</span>
                  <span className="bar-foot-sep">·</span>
                  <span>建議 <strong><Counter value={r.target} decimals={Number.isInteger(r.target) ? 0 : 1}/></strong> 份</span>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Animated counter — animates from 0 on mount, then between values on updates.
function Counter({ value, decimals = 0, duration = 600, mountFrom = 0 }) {
  const [display, setDisplay] = useState(mountFrom);
  const ref = useRef({ from: mountFrom, to: value, start: 0 });
  useEffect(() => {
    ref.current.from = display;
    ref.current.to = value;
    ref.current.start = performance.now();
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - ref.current.start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(ref.current.from + (ref.current.to - ref.current.from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{display.toFixed(decimals)}</>;
}

function fmt(v) { return Number.isInteger(v) ? v.toString() : v.toFixed(1); }

// Hue helper — maps a food group hue token to CSS variables.
function hueVars(hue) {
  return {
    "--hue": `var(--hue-${hue})`,
    "--hue-soft": `var(--hue-${hue}-soft)`,
  };
}

Object.assign(window, {
  PAGES, useHashRoute, TopBar, PageHead, Donut, BarList, Counter, fmt, hueVars,
});
