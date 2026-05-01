"use client";

import { useEffect, useState } from "react";

import styles from "./calculation-principles.module.css";
import { NutritionSiteNavigation } from "./site-navigation";
import {
  CALCULATION_SAMPLE_PROFILE,
  FOOD_EXCHANGE_TABLE,
  buildFormulaExample,
} from "@/lib/nutrition-formula";
import { loadNutritionProfile } from "@/lib/nutrition-profile-store";
import { ACTIVITY_OPTIONS, SEX_OPTIONS, type UserProfile } from "@/lib/nutrition-calculator";

function formatValue(value: number, digits = 0) {
  return value.toFixed(digits).replace(/\.0$/, "");
}

function roundDisplay(value: number) {
  return Math.round(value);
}

const STEP_CARDS = [
  {
    step: "01",
    title: "估算每日熱量",
    detail: "系統會先根據使用者的體重與目標，估算每日所需熱量。",
    formula: ["減脂：體重 × 25 kcal", "維持：體重 × 30 kcal", "增肌：體重 × 35 kcal"],
    example: "若體重 75 kg，目標為維持：75 × 30 = 2250 kcal",
  },
  {
    step: "02",
    title: "分配三大營養素比例",
    detail: "依照一般飲食規劃，將總熱量分配給碳水化合物、蛋白質與脂肪。",
    formula: ["CHO 碳水化合物：50%", "PRO 蛋白質：25%", "FAT 脂肪：25%"],
    example: "此比例可依個人目標、活動量與健康狀況調整。",
  },
  {
    step: "03",
    title: "把熱量換算成克數",
    detail: "因為不同營養素每克提供的熱量不同，所以需要將熱量換算成克數。",
    formula: [
      "CHO(g) = 總熱量 × 50% ÷ 4",
      "PRO(g) = 總熱量 × 25% ÷ 4",
      "FAT(g) = 總熱量 × 25% ÷ 9",
    ],
    example: "碳水與蛋白質每克約 4 kcal，脂肪每克約 9 kcal。",
  },
  {
    step: "04",
    title: "反推每日建議份數",
    detail: "得到 CHO、PRO、FAT 克數後，再利用食物代換表換算成每天應該吃的食物份數。",
    formula: [
      "全穀根莖類、蔬菜類、水果類由 CHO 反推",
      "豆魚肉蛋類由 PRO 反推",
      "油脂與堅果種子類由 FAT 反推",
    ],
    example: "這是一種簡化版估算方式，目的是讓計算更容易理解。",
  },
] as const;

const SERVING_FORMULAS = [
  {
    label: "全穀根莖類",
    formula: "建議份數 = CHO × 60% ÷ 15",
  },
  {
    label: "水果類",
    formula: "建議份數 = CHO × 20% ÷ 15",
  },
  {
    label: "蔬菜類",
    formula: "建議份數 = CHO × 20% ÷ 5",
  },
  {
    label: "豆魚肉蛋類",
    formula: "建議份數 = PRO ÷ 7",
  },
  {
    label: "奶類",
    formula: "建議份數 = 固定 1～2 份，常用 2 份",
  },
  {
    label: "油脂與堅果種子類",
    formula: "建議份數 = FAT ÷ 5",
  },
] as const;

export function CalculationPrinciplesPage() {
  const [profile, setProfile] = useState<UserProfile>(CALCULATION_SAMPLE_PROFILE);
  const [hasStoredProfile, setHasStoredProfile] = useState(false);

  useEffect(() => {
    const stored = loadNutritionProfile();

    if (stored) {
      setProfile(stored);
      setHasStoredProfile(true);
    }
  }, []);

  const example = buildFormulaExample(profile);
  const sexLabel =
    SEX_OPTIONS.find((option) => option.value === profile.sex)?.label ?? "未指定";
  const activityLabel =
    ACTIVITY_OPTIONS.find((option) => option.value === profile.activity)?.label ?? "中活動量";

  return (
    <main className={styles.page}>
      <div className={styles.pageGlow} />
      <NutritionSiteNavigation />

      <section className={styles.hero}>
        <div className={styles.heroBadge}>Calculation Guide</div>
        <h1 className={styles.title}>飲食數據怎麼算？</h1>
        <p className={styles.description}>
          從身高體重、每日熱量，到飲食份數與營養素，帶你一步一步看懂計算邏輯。
        </p>

        <div className={styles.heroFacts}>
          <article className={styles.factCard}>
            <span>目前範例</span>
            <strong>
              {profile.heightCm} cm / {profile.weightKg} kg
            </strong>
            <p>
              {sexLabel} ・ {activityLabel} ・ {example.goalLabel}
            </p>
          </article>
          <article className={styles.factCard}>
            <span>估算熱量</span>
            <strong>{example.targetCalories} kcal</strong>
            <p>
              {profile.weightKg} ×{" "}
              {example.goalLabel === "減脂" ? 25 : example.goalLabel === "增肌" ? 35 : 30}
            </p>
          </article>
          <article className={styles.factCard}>
            <span>使用資料來源</span>
            <strong>{hasStoredProfile ? "讀取網站目前輸入" : "固定教學範例"}</strong>
            <p>
              {hasStoredProfile
                ? "已讀取你在計算器頁面的最新身高、體重與目標。"
                : "目前沒有串接中的輸入資料，先用 175 / 75 / 維持示範。"}
            </p>
          </article>
        </div>
      </section>

      <section className={styles.content}>
        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <span className={styles.eyebrow}>流程總覽</span>
            <h2>4 個步驟看懂整體邏輯</h2>
          </div>

          <div className={styles.stepsGrid}>
            {STEP_CARDS.map((card) => (
              <article key={card.step} className={styles.stepCard}>
                <div className={styles.stepTop}>
                  <span className={styles.stepNumber}>{card.step}</span>
                  <h3>{card.title}</h3>
                </div>
                <p className={styles.stepDetail}>{card.detail}</p>
                <div className={styles.formulaBlock}>
                  {card.formula.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
                <p className={styles.stepExample}>{card.example}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.sectionCard}>
          <div className={styles.sectionHeading}>
            <span className={styles.eyebrow}>食物代換表</span>
            <h2>每一份大概提供多少營養素</h2>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>食物類別</th>
                  <th>每份 CHO</th>
                  <th>每份 PRO</th>
                  <th>每份 FAT</th>
                  <th>常見食物例子</th>
                </tr>
              </thead>
              <tbody>
                {FOOD_EXCHANGE_TABLE.map((item) => (
                  <tr key={item.id}>
                    <td>{item.label}</td>
                    <td>{item.cho} g</td>
                    <td>{item.pro} g</td>
                    <td>{item.fat} g</td>
                    <td>{item.examples}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <span className={styles.eyebrow}>建議份數</span>
            <h2>份數怎麼由營養素反推</h2>
          </div>

          <div className={styles.formulaGrid}>
            {SERVING_FORMULAS.map((item) => (
              <article key={item.label} className={styles.miniCard}>
                <span className={styles.miniLabel}>{item.label}</span>
                <strong>{item.formula}</strong>
              </article>
            ))}
          </div>

          <div className={styles.tipBox}>
            這是一種簡化版的估算方式，目的是讓使用者快速理解份數如何由營養素反推而來。實際飲食規劃仍可依照活動量、疾病狀況、飲食習慣與營養師建議調整。
          </div>
        </section>

        <section className={styles.exampleCard}>
          <div className={styles.exampleHeader}>
            <div>
              <span className={styles.eyebrow}>範例計算</span>
              <h2>把目前資料套進公式</h2>
            </div>
            <div className={styles.profilePill}>
              {profile.heightCm} cm / {profile.weightKg} kg / {example.goalLabel}
            </div>
          </div>

          <div className={styles.exampleGrid}>
            <article className={styles.examplePanel}>
              <h3>1. 每日熱量</h3>
              <p>
                每日熱量 = {profile.weightKg} ×{" "}
                {example.goalLabel === "減脂" ? 25 : example.goalLabel === "增肌" ? 35 : 30} ={" "}
                {example.targetCalories} kcal
              </p>
            </article>

            <article className={styles.examplePanel}>
              <h3>2. 三大營養素克數</h3>
              <p>
                CHO = {example.targetCalories} × 50% ÷ 4 = 約{" "}
                {roundDisplay(example.macroGrams.cho)} g
              </p>
              <p>
                PRO = {example.targetCalories} × 25% ÷ 4 = 約{" "}
                {roundDisplay(example.macroGrams.pro)} g
              </p>
              <p>
                FAT = {example.targetCalories} × 25% ÷ 9 = 約{" "}
                {roundDisplay(example.macroGrams.fat)} g
              </p>
            </article>

            <article className={styles.examplePanel}>
              <h3>3. 建議份數示範</h3>
              <p>
                全穀根莖類 = {formatValue(example.macroGrams.cho, 1)} × 60% ÷ 15 = 約{" "}
                {roundDisplay(example.servings.grains)} 份
              </p>
              <p>
                水果類 = {formatValue(example.macroGrams.cho, 1)} × 20% ÷ 15 = 約{" "}
                {roundDisplay(example.servings.fruits)} 份
              </p>
              <p>
                蔬菜類 = {formatValue(example.macroGrams.cho, 1)} × 20% ÷ 5 = 約{" "}
                {roundDisplay(example.servings.vegetables)} 份
              </p>
              <p>
                豆魚肉蛋類 = {formatValue(example.macroGrams.pro, 1)} ÷ 7 = 約{" "}
                {roundDisplay(example.servings.protein)} 份
              </p>
              <p>
                油脂與堅果種子類 = {formatValue(example.macroGrams.fat, 1)} ÷ 5 = 約{" "}
                {roundDisplay(example.servings.fats)} 份
              </p>
            </article>
          </div>

          <div className={styles.warningBox}>
            此為公式反推的理論值，實際網站可依照健康飲食原則與一般飲食習慣進行份數修正，避免份數過高或不符合日常飲食。
          </div>
        </section>

        <section className={styles.summaryBand}>
          先估算熱量 → 分配營養素比例 → 換算成克數 → 用食物代換表反推每日建議份數。
        </section>
      </section>
    </main>
  );
}
