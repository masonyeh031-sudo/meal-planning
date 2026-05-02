"use client";

import Link from "next/link";

import styles from "./calculator-suggestion-panel.module.css";
import { DAILY_FOOD_TIPS, PLATE_RATIO_GUIDE } from "@/lib/food-guide";
import type { ServingsPlan } from "@/lib/nutrition-calculator";

interface CalculatorSuggestionPanelProps {
  servings: ServingsPlan;
}

export function CalculatorSuggestionPanel({
  servings: _servings,
}: CalculatorSuggestionPanelProps) {
  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>建議吃法</span>
          <h2>用餐盤比例安排三餐</h2>
          <p className={styles.description}>
            把每餐分成蔬菜、主食與蛋白質三塊，份量翻譯與手掌估算可在六大類食物指南查看。
          </p>
        </div>
        <Link href="/food-guide" className={styles.guideLink}>
          查看六大類食物指南
        </Link>
      </div>

      <div className={styles.visualGrid}>
        <article className={styles.visualCard}>
          <div className={styles.visualHeader}>
            <span className={styles.eyebrow}>餐盤比例圖</span>
            <h3>一餐可以先這樣配</h3>
          </div>

          <div className={styles.plateLayout}>
            <div className={styles.plateVisual} aria-hidden="true">
              <div className={styles.plateCenter}>一餐餐盤</div>
            </div>
            <div className={styles.legendList}>
              {PLATE_RATIO_GUIDE.map((item) => (
                <div key={item.label} className={styles.legendItem}>
                  <span
                    className={styles.legendSwatch}
                    style={{ backgroundColor: item.accentColor }}
                  />
                  <div>
                    <strong>
                      {item.label} {item.ratio}
                    </strong>
                    <p>{item.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>

      <div className={styles.tipGrid}>
        {DAILY_FOOD_TIPS.map((tip) => (
          <article key={tip} className={styles.tipCard}>
            <span className={styles.tipPill}>貼心提醒</span>
            <p>{tip}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
