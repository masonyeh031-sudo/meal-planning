// ===== Main app shell + tweaks =====
const _NA = window.NUTRITION;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accentColor": "green",
  "fontScale": 100,
  "showStepper": true,
  "iconAnimation": true,
  "compactDashboard": false
}/*EDITMODE-END*/;

function loadProfile() {
  try {
    const raw = localStorage.getItem("nutrition-profile-v1");
    if (!raw) return _NA.DEFAULT_PROFILE;
    const p = JSON.parse(raw);
    return { ..._NA.DEFAULT_PROFILE, ...p };
  } catch { return _NA.DEFAULT_PROFILE; }
}
function saveProfile(p) {
  try { localStorage.setItem("nutrition-profile-v1", JSON.stringify(p)); } catch {}
}

const ACCENT_PRESETS = {
  green:  { tint: "var(--green-soft)",  deep: "var(--green-deep)" },
  blue:   { tint: "var(--blue-soft)",   deep: "var(--kcal-deep)" },
  orange: { tint: "var(--orange-soft)", deep: "var(--orange-deep)" },
  cream:  { tint: "var(--cream-soft)",  deep: "var(--orange-deep)" },
};

function applyAccent(name) {
  const map = {
    green:  ["#9ed5a4", "#4ea35e", "#eaf6e9"],
    blue:   ["#a3c8eb", "#4f8dc4", "#ecf3fa"],
    orange: ["#f6b67a", "#e08a3e", "#fdf0e0"],
    cream:  ["#f5e8c8", "#c8a04a", "#faf3df"],
  };
  const c = map[name] || map.green;
  document.documentElement.style.setProperty("--green", c[0]);
  document.documentElement.style.setProperty("--green-deep", c[1]);
  document.documentElement.style.setProperty("--green-soft", c[2]);
}

function App() {
  const [page, setPage] = useState(() => {
    const h = location.hash.replace("#", "");
    return PAGES.find(p => p.id === h) ? h : "calculator";
  });
  const [profile, setProfile] = useState(loadProfile);
  const [servings, setServings] = useState(() => _NA.buildRecommended(loadProfile()).recommended);
  const [profileReady, setProfileReady] = useState(false);
  const [toast, setToast] = useState(null);
  const [tweaks, setTweak] = window.useTweaks
    ? window.useTweaks(TWEAK_DEFAULTS)
    : [TWEAK_DEFAULTS, () => {}];

  // Re-recommend on profile changes
  useEffect(() => {
    setServings(_NA.buildRecommended(profile).recommended);
  }, [profile.heightCm, profile.weightKg, profile.age, profile.sex, profile.activity, profile.goal]);

  // Persist profile
  useEffect(() => {
    if (!profileReady) { setProfileReady(true); return; }
    saveProfile(profile);
  }, [profile]);

  // Hash routing
  useEffect(() => {
    const onHash = () => {
      const h = location.hash.replace("#", "");
      if (PAGES.find(p => p.id === h)) setPage(h);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const goto = id => { setPage(id); location.hash = id; };

  // Apply tweaks
  useEffect(() => {
    applyAccent(tweaks.accentColor);
    document.documentElement.style.setProperty("font-size", `${tweaks.fontScale}%`);
    document.documentElement.style.setProperty("--anim-state", tweaks.iconAnimation ? "running" : "paused");
  }, [tweaks.accentColor, tweaks.fontScale, tweaks.iconAnimation]);

  const rec = _NA.buildRecommended(profile);

  return (
    <div className="app">
      <TopNav page={page} onChange={goto} />
      {page === "calculator" && (
        <CalculatorPage
          profile={profile} setProfile={setProfile}
          servings={servings} setServings={setServings}
        />
      )}
      {page === "guide" && <FoodGuidePage />}
      {page === "principles" && <PrinciplesPage profile={profile} />}
      {page === "records" && (
        <RecordsPage
          targetKcal={rec.target}
          recommendedServings={rec.recommended}
          onToast={setToast}
        />
      )}

      <Toast msg={toast} onDone={() => setToast(null)} />

      {window.TweaksPanel ? (
        <window.TweaksPanel title="Tweaks">
          <window.TweakSection title="主題色彩">
            <window.TweakRadio
              label="主色調"
              value={tweaks.accentColor}
              options={[
                { value: "green",  label: "🌿 淺綠" },
                { value: "blue",   label: "💧 淺藍" },
                { value: "orange", label: "🍊 淡橘" },
                { value: "cream",  label: "🍯 米色" },
              ]}
              onChange={v => setTweak("accentColor", v)}
            />
          </window.TweakSection>
          <window.TweakSection title="文字與動畫">
            <window.TweakSlider
              label="字體大小"
              min={90} max={115} step={5}
              value={tweaks.fontScale}
              suffix="%"
              onChange={v => setTweak("fontScale", v)}
            />
            <window.TweakToggle
              label="Icon 浮動動畫"
              value={tweaks.iconAnimation}
              onChange={v => setTweak("iconAnimation", v)}
            />
          </window.TweakSection>
        </window.TweaksPanel>
      ) : null}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
