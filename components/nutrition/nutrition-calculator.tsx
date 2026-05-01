"use client";

import { useEffect, useState } from "react";

import styles from "./nutrition-calculator.module.css";
import {
  exportNutritionReport,
  type NutritionExportFormat,
} from "@/lib/nutrition-export";
import {
  ACTIVITY_OPTIONS,
  FOOD_GROUPS,
  GOAL_OPTIONS,
  SEX_OPTIONS,
  buildNutritionRecommendation,
  calculateNutritionFromServings,
  clampServingValue,
  type FoodGroupId,
  type ServingsPlan,
  type UserProfile,
} from "@/lib/nutrition-calculator";

const DEFAULT_PROFILE: UserProfile = {
  heightCm: 165,
  weightKg: 60,
  age: 22,
  sex: "female",
  activity: "medium",
  goal: "maintain",
};

function formatNumber(value: number) {
  if (Number.isInteger(value)) {
    return value.toString();
  }

  return value.toFixed(1);
}

function formatSignedCalories(delta: number) {
  if (Math.abs(delta) < 0.5) {
    return "與建議值接近";
  }

  return delta > 0
    ? `高於建議 ${Math.round(delta)} kcal`
    : `低於建議 ${Math.round(Math.abs(delta))} kcal`;
}

function buildMacroGradient(values: Array<{ value: number; color: string }>) {
  const total = values.reduce((sum, item) => sum + item.value, 0);

  if (total <= 0) {
    return "conic-gradient(#dbe6ea 0deg 360deg)";
  }

  let currentAngle = 0;
  const segments = values.map((item) => {
    const segmentAngle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + segmentAngle;
    currentAngle = endAngle;
    return `${item.color} ${startAngle}deg ${endAngle}deg`;
  });

  return `conic-gradient(${segments.join(", ")})`;
}

const EXPORT_ACTIONS: Array<{ format: NutritionExportFormat; label: string }> = [
  { format: "pdf", label: "匯出 PDF" },
  { format: "jpg", label: "匯出 JPG" },
  { format: "google-sheets", label: "Google 試算表 CSV" },
  { format: "excel", label: "匯出 Excel" },
];

export function NutritionCalculator() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [servings, setServings] = useState<ServingsPlan>(() => {
    return buildNutritionRecommendation(DEFAULT_PROFILE).recommendedServings;
  });
  const [exportingFormat, setExportingFormat] = useState<NutritionExportFormat | null>(
    null,
  );
  const [exportMessage, setExportMessage] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);

  const recommendation = buildNutritionRecommendation(profile);

  useEffect(() => {
    setServings(buildNutritionRecommendation(profile).recommendedServings);
  }, [
    profile.heightCm,
    profile.weightKg,
    profile.age,
    profile.sex,
    profile.activity,
    profile.goal,
  ]);

  const currentSummary = calculateNutritionFromServings(servings);
  const calorieDelta = currentSummary.totalCalories - recommendation.targetCalories;
  const isCustomized = FOOD_GROUPS.some(
    (group) => servings[group.id] !== recommendation.recommendedServings[group.id],
  );

  const goalLabel =
    GOAL_OPTIONS.find((option) => option.value === profile.goal)?.label ?? "維持";
  const activityLabel =
    ACTIVITY_OPTIONS.find((option) => option.value === profile.activity)?.label ?? "中活動量";

  const macroBreakdown = [
    {
      label: "CHO 碳水",
      grams: currentSummary.totals.cho,
      calories: currentSummary.macroCalories.cho,
      ratio: currentSummary.macroRatios.cho,
      color: "#4f83ff",
    },
    {
      label: "PRO 蛋白質",
      grams: currentSummary.totals.pro,
      calories: currentSummary.macroCalories.pro,
      ratio: currentSummary.macroRatios.pro,
      color: "#4bc4a3",
    },
    {
      label: "FAT 脂肪",
      grams: currentSummary.totals.fat,
      calories: currentSummary.macroCalories.fat,
      ratio: currentSummary.macroRatios.fat,
      color: "#94b3c2",
    },
  ];

  const donutBackground = buildMacroGradient(
    macroBreakdown.map((item) => ({ value: item.calories, color: item.color })),
  );

  const barMaxValue = Math.max(
    ...FOOD_GROUPS.map((group) => servings[group.id]),
    ...FOOD_GROUPS.map((group) => recommendation.recommendedServings[group.id]),
    1,
  );

  function handleProfileNumberChange(field: "heightCm" | "weightKg" | "age", value: string) {
    const nextValue = Number(value);

    if (!Number.isFinite(nextValue)) {
      return;
    }

    setProfile((current) => ({
      ...current,
      [field]: nextValue,
    }));
  }

  function handleServingChange(foodId: FoodGroupId, nextValue: number) {
    setServings((current) => ({
      ...current,
      [foodId]: clampServingValue(foodId, nextValue),
    }));
  }

  async function handleExport(format: NutritionExportFormat) {
    setExportingFormat(format);
    setExportMessage(null);

    try {
      const filename = await exportNutritionReport(format, {
        profile,
        servings,
        recommendation,
        summary: currentSummary,
      });

      setExportMessage({
        text: `已下載 ${filename}`,
        isError: false,
      });
    } catch (error) {
      setExportMessage({
        text: error instanceof Error ? error.message : "匯出失敗，請稍後再試。",
        isError: true,
      });
    } finally {
      setExportingFormat(null);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.pageGlow} />
      <section className={styles.hero}>
        <div className={styles.heroBadge}>Daily Nutrition Planner</div>
        <h1 className={styles.title}>每日飲食份數與營養素計算器</h1>
        <p className={styles.description}>
          輸入基本資料後，系統會以簡化版熱量公式估算每日建議熱量，並自動換算六大類食物份數、三大營養素與總熱量。
        </p>
        <div className={styles.heroChips}>
          <span className={styles.chip}>白底卡片式介面</span>
          <span className={styles.chip}>即時更新</span>
          <span className={styles.chip}>可手動微調份數</span>
        </div>
      </section>

      <section className={styles.workspace}>
        <aside className={styles.sidebar}>
          <article className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.eyebrow}>輸入區</span>
              <h2>個人資料</h2>
            </div>
            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>身高 cm</span>
                <input
                  className={styles.input}
                  type="number"
                  min="100"
                  max="230"
                  step="1"
                  value={profile.heightCm}
                  onChange={(event) =>
                    handleProfileNumberChange("heightCm", event.target.value)
                  }
                />
              </label>
              <label className={styles.field}>
                <span>體重 kg</span>
                <input
                  className={styles.input}
                  type="number"
                  min="30"
                  max="200"
                  step="0.1"
                  value={profile.weightKg}
                  onChange={(event) =>
                    handleProfileNumberChange("weightKg", event.target.value)
                  }
                />
              </label>
              <label className={styles.field}>
                <span>年齡</span>
                <input
                  className={styles.input}
                  type="number"
                  min="10"
                  max="100"
                  step="1"
                  value={profile.age}
                  onChange={(event) => handleProfileNumberChange("age", event.target.value)}
                />
              </label>
              <label className={styles.field}>
                <span>性別</span>
                <select
                  className={styles.select}
                  value={profile.sex}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      sex: event.target.value as UserProfile["sex"],
                    }))
                  }
                >
                  {SEX_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                <span>活動量</span>
                <select
                  className={styles.select}
                  value={profile.activity}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      activity: event.target.value as UserProfile["activity"],
                    }))
                  }
                >
                  {ACTIVITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                <span>飲食目標</span>
                <select
                  className={styles.select}
                  value={profile.goal}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      goal: event.target.value as UserProfile["goal"],
                    }))
                  }
                >
                  {GOAL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </article>

          <article className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.eyebrow}>計算規則</span>
              <h2>估算邏輯</h2>
            </div>
            <ul className={styles.ruleList}>
              <li>減脂：體重 × 25 kcal</li>
              <li>維持：體重 × 30 kcal</li>
              <li>增肌：體重 × 35 kcal</li>
              <li>活動量、年齡、性別會微調每日食物份數分配。</li>
              <li>手動修改份數後，總營養素與熱量會立即更新。</li>
            </ul>
          </article>

          <article className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.eyebrow}>使用情境</span>
              <h2>適用對象</h2>
            </div>
            <p className={styles.sideNote}>
              適合學生、營養課程、健康管理與教學展示。若要作為個人長期飲食計畫，仍建議搭配專業營養師評估。
            </p>
          </article>
        </aside>

        <div className={styles.mainColumn}>
          <section className={styles.statsGrid}>
            <article className={styles.statCard}>
              <span className={styles.statLabel}>每日建議熱量</span>
              <strong className={styles.statValue}>
                {recommendation.targetCalories}
                <small>kcal</small>
              </strong>
              <p className={styles.statHint}>{goalLabel}模式</p>
            </article>
            <article className={styles.statCard}>
              <span className={styles.statLabel}>目前份數總熱量</span>
              <strong className={styles.statValue}>
                {Math.round(currentSummary.totalCalories)}
                <small>kcal</small>
              </strong>
              <p className={styles.statHint}>{formatSignedCalories(calorieDelta)}</p>
            </article>
            <article className={styles.statCard}>
              <span className={styles.statLabel}>BMI</span>
              <strong className={styles.statValue}>
                {recommendation.bmi.toFixed(1)}
                <small>{recommendation.bmiStatus}</small>
              </strong>
              <p className={styles.statHint}>由身高與體重估算</p>
            </article>
            <article className={styles.statCard}>
              <span className={styles.statLabel}>份數分配基準</span>
              <strong className={styles.statValue}>
                {activityLabel}
                <small>{profile.age} 歲</small>
              </strong>
              <p className={styles.statHint}>活動量與年齡會微調份數</p>
            </article>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <span className={styles.eyebrow}>匯出功能</span>
                <h2>下載報表與試算表</h2>
              </div>
            </div>
            <p className={styles.sectionHint}>
              PDF 與 JPG 會輸出完整視覺報表；Google 試算表會下載可直接匯入的 CSV；Excel 會下載 `.xls`
              檔。
            </p>
            <div className={styles.exportToolbar}>
              {EXPORT_ACTIONS.map((action) => {
                const isBusy = exportingFormat === action.format;

                return (
                  <button
                    key={action.format}
                    type="button"
                    className={styles.exportButton}
                    onClick={() => void handleExport(action.format)}
                    disabled={exportingFormat !== null}
                  >
                    {isBusy ? "匯出中..." : action.label}
                  </button>
                );
              })}
            </div>
            {exportMessage ? (
              <p
                className={
                  exportMessage.isError ? styles.exportStatusError : styles.exportStatus
                }
              >
                {exportMessage.text}
              </p>
            ) : null}
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeaderInline}>
              <div>
                <span className={styles.eyebrow}>結果區</span>
                <h2>每日飲食份數建議</h2>
              </div>
              <button
                type="button"
                className={styles.resetButton}
                onClick={() => setServings(recommendation.recommendedServings)}
                disabled={!isCustomized}
              >
                恢復系統建議
              </button>
            </div>
            <p className={styles.sectionHint}>
              你可以直接微調每一類食物份數，系統會立即重新計算營養素與總熱量。
            </p>

            <div className={styles.editorGrid}>
              {FOOD_GROUPS.map((group) => (
                <article
                  key={group.id}
                  className={styles.editorCard}
                  style={{ borderColor: `${group.color}26` }}
                >
                  <div className={styles.editorHeading}>
                    <div>
                      <h3>{group.label}</h3>
                      <p>{group.description}</p>
                    </div>
                    <span
                      className={styles.colorDot}
                      style={{ backgroundColor: group.color }}
                    />
                  </div>
                  <div className={styles.editorControls}>
                    <button
                      type="button"
                      className={styles.stepButton}
                      onClick={() => handleServingChange(group.id, servings[group.id] - 0.5)}
                    >
                      -
                    </button>
                    <input
                      className={styles.servingInput}
                      type="number"
                      min="0"
                      max="20"
                      step="0.5"
                      value={servings[group.id]}
                      onChange={(event) =>
                        handleServingChange(group.id, Number(event.target.value))
                      }
                    />
                    <button
                      type="button"
                      className={styles.stepButton}
                      onClick={() => handleServingChange(group.id, servings[group.id] + 0.5)}
                    >
                      +
                    </button>
                  </div>
                  <div className={styles.editorMeta}>
                    <span>系統建議 {formatNumber(recommendation.recommendedServings[group.id])} 份</span>
                    <span>目前 {formatNumber(servings[group.id])} 份</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.macroCards}>
            {macroBreakdown.map((item) => (
              <article key={item.label} className={styles.macroCard}>
                <span className={styles.macroLabel} style={{ color: item.color }}>
                  {item.label}
                </span>
                <strong className={styles.macroValue}>{Math.round(item.grams)} g</strong>
                <p className={styles.macroMeta}>
                  {Math.round(item.calories)} kcal ・ {item.ratio.toFixed(1)}%
                </p>
              </article>
            ))}
          </section>

          <section className={styles.chartGrid}>
            <article className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.eyebrow}>圖表</span>
                <h2>三大營養素比例</h2>
              </div>
              <div className={styles.donutLayout}>
                <div
                  className={styles.donutChart}
                  style={{ backgroundImage: donutBackground }}
                  aria-hidden="true"
                >
                  <div className={styles.donutCenter}>
                    <strong>{Math.round(currentSummary.totalCalories)}</strong>
                    <span>kcal</span>
                  </div>
                </div>
                <div className={styles.legendList}>
                  {macroBreakdown.map((item) => (
                    <div key={item.label} className={styles.legendItem}>
                      <span
                        className={styles.legendSwatch}
                        style={{ backgroundColor: item.color }}
                      />
                      <div>
                        <strong>{item.label}</strong>
                        <p>
                          {Math.round(item.grams)} g / {item.ratio.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <article className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.eyebrow}>圖表</span>
                <h2>各類食物份數</h2>
              </div>
              <div className={styles.barList}>
                {FOOD_GROUPS.map((group) => (
                  <div key={group.id} className={styles.barRow}>
                    <div className={styles.barLabels}>
                      <strong>{group.label}</strong>
                      <span>
                        目前 {formatNumber(servings[group.id])} 份 / 建議{" "}
                        {formatNumber(recommendation.recommendedServings[group.id])} 份
                      </span>
                    </div>
                    <div className={styles.barTrack}>
                      <div
                        className={styles.barTarget}
                        style={{
                          width: `${
                            (recommendation.recommendedServings[group.id] / barMaxValue) * 100
                          }%`,
                        }}
                      />
                      <div
                        className={styles.barFill}
                        style={{
                          width: `${(servings[group.id] / barMaxValue) * 100}%`,
                          backgroundColor: group.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.eyebrow}>明細表</span>
              <h2>每類食物計算明細</h2>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>食物類別</th>
                    <th>建議份數（可調）</th>
                    <th>每份 CHO</th>
                    <th>每份 PRO</th>
                    <th>每份 FAT</th>
                    <th>CHO 計算</th>
                    <th>PRO 計算</th>
                    <th>FAT 計算</th>
                    <th>小計熱量</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSummary.rows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <div className={styles.cellTitle}>
                          <span
                            className={styles.legendSwatch}
                            style={{ backgroundColor: row.color }}
                          />
                          <div>
                            <strong>{row.label}</strong>
                            <p>{row.description}</p>
                          </div>
                        </div>
                      </td>
                      <td>{formatNumber(row.servings)} 份</td>
                      <td>{row.perServing.cho} g</td>
                      <td>{row.perServing.pro} g</td>
                      <td>{row.perServing.fat} g</td>
                      <td>
                        {formatNumber(row.servings)} × {row.perServing.cho} ={" "}
                        {formatNumber(row.choTotal)} g
                      </td>
                      <td>
                        {formatNumber(row.servings)} × {row.perServing.pro} ={" "}
                        {formatNumber(row.proTotal)} g
                      </td>
                      <td>
                        {formatNumber(row.servings)} × {row.perServing.fat} ={" "}
                        {formatNumber(row.fatTotal)} g
                      </td>
                      <td>{Math.round(row.subtotalCalories)} kcal</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>總計</td>
                    <td>{formatNumber(FOOD_GROUPS.reduce((sum, group) => sum + servings[group.id], 0))} 份</td>
                    <td>{Math.round(currentSummary.totals.cho)} g</td>
                    <td>{Math.round(currentSummary.totals.pro)} g</td>
                    <td>{Math.round(currentSummary.totals.fat)} g</td>
                    <td>{Math.round(currentSummary.macroCalories.cho)} kcal</td>
                    <td>{Math.round(currentSummary.macroCalories.pro)} kcal</td>
                    <td>{Math.round(currentSummary.macroCalories.fat)} kcal</td>
                    <td>{Math.round(currentSummary.totalCalories)} kcal</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          <section className={styles.disclaimer}>
            此結果為估算值，實際飲食仍需依個人健康狀況、運動安排與營養師建議調整。
          </section>
        </div>
      </section>
    </main>
  );
}

