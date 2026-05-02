// ===== Shared chrome: top nav, toast =====
const { useState, useEffect, useMemo, useRef } = React;
const N = window.NUTRITION;

const PAGES = [
  { id: "calculator", label: "飲食計算器", icon: "🧮" },
  { id: "guide",      label: "六大類食物", icon: "🍱" },
  { id: "principles", label: "計算原理",   icon: "📐" },
  { id: "records",    label: "七日紀錄",   icon: "📔" },
];

function TopNav({ page, onChange }) {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="brand">
          <div className="brand-mark">🥗</div>
          <span>飲食規劃</span>
        </div>
        <div className="nav-links" role="tablist">
          {PAGES.map(p => (
            <button
              key={p.id}
              role="tab"
              aria-selected={page === p.id}
              className={"nav-link" + (page === p.id ? " is-active" : "")}
              onClick={() => onChange(p.id)}
            >
              <span className="ico" aria-hidden="true">{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>
        <select
          className="select nav-mobile"
          style={{ maxWidth: 160 }}
          value={page}
          onChange={(e) => onChange(e.target.value)}
        >
          {PAGES.map(p => (
            <option key={p.id} value={p.id}>{p.icon} {p.label}</option>
          ))}
        </select>
      </div>
    </nav>
  );
}

function Toast({ msg, onDone }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [msg]);
  if (!msg) return null;
  return (
    <div className="toast" role="status">
      <span className="ico">{msg.icon || "✨"}</span>
      <span>{msg.text}</span>
    </div>
  );
}

function SectionTitle({ eyebrow, title, sub }) {
  return (
    <header className="section">
      {eyebrow ? <span className="section-eyebrow">{eyebrow}</span> : null}
      <h2 className="section-title">{title}</h2>
      {sub ? <p className="section-sub">{sub}</p> : null}
    </header>
  );
}

Object.assign(window, { TopNav, Toast, SectionTitle, PAGES });
