// App root — router + tweaks panel + page mounting.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "warm",
  "fontScale": 1,
  "density": "comfortable"
}/*EDITMODE-END*/;

function App() {
  const [route, navigate] = useHashRoute();
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", tweaks.theme);
    document.documentElement.style.setProperty("--font-scale", tweaks.fontScale);
    document.body.style.fontSize = `${15 * tweaks.fontScale}px`;
  }, [tweaks.theme, tweaks.fontScale]);

  const Page = route === "calculator" ? CalculatorPage
    : route === "guide" ? FoodGuidePage
    : route === "eating-out" ? EatingOutPage
    : route === "principles" ? PrinciplesPage
    : route === "records" ? RecordsPage
    : HomePage;

  return (
    <div className="app-shell">
      <TopBar route={route} navigate={navigate}/>
      <main key={route} className="fade-on-change">
        <Page/>
      </main>

      <TweaksPanel title="Tweaks · 主題與外觀">
        <TweakSection title="主題色">
          <TweakRadio label="色系" value={tweaks.theme} onChange={(v) => setTweak("theme", v)}
            options={[{ value: "warm", label: "暖橘" }, { value: "mint", label: "薄荷" }, { value: "dark", label: "深色" }]}/>
        </TweakSection>
        <TweakSection title="文字大小">
          <TweakSlider label="基準字級" value={tweaks.fontScale} min={0.9} max={1.15} step={0.05}
            onChange={(v) => setTweak("fontScale", v)} format={(v) => `${Math.round(v * 100)}%`}/>
        </TweakSection>
        <TweakSection title="切換頁面">
          <TweakSelect label="目前頁面" value={route} onChange={navigate}
            options={PAGES.map((p) => ({ value: p.id, label: p.label }))}/>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
