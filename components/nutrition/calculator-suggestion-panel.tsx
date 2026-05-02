"use client";

import Link from "next/link";
import type { CSSProperties } from "react";

import styles from "./calculator-suggestion-panel.module.css";
import {
  DAILY_FOOD_TIPS,
  HAND_PORTION_GUIDE,
  PLATE_RATIO_GUIDE,
  buildDailyServingSuggestions,
} from "@/lib/food-guide";
import type { ServingsPlan } from "@/lib/nutrition-calculator";

interface CalculatorSuggestionPanelProps {
  servings: ServingsPlan;
}

function formatServingValue(value: number) {
  if (Number.isInteger(value)) {
    return value.toString();
  }

  return value.toFixed(1).replace(/\.0$/, "");
}

export function CalculatorSuggestionPanel({
  servings,
}: CalculatorSuggestionPanelProps) {
  const suggestions = buildDailyServingSuggestions(servings);

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>建議吃法</span>
          <h2>把每日份數翻譯成比較好懂的吃法</h2>
          <p className={styles.description}>
            這一區把每天建議份數轉成飯碗、掌心、拳頭、茶匙與餐盤比例，讓你更容易安排三餐。
          </p>
        </div>
        <Link href="/food-guide" className={styles.guideLink}>
          查看六大類食物指南
        </Link>
      </div>

      <div className={styles.dailyGrid}>
        {suggestions.map((item, index) => (
          <article
            key={item.id}
            className={styles.suggestionCard}
            style={
              {
                "--accent-color": item.accentColor,
                "--soft-color": item.softColor,
                "--motion-delay": `${index * 55}ms`,
              } as CSSProperties
            }
          >
            <div className={styles.cardHeader}>
              <span className={styles.badge}>{item.badge}</span>
              <div>
                <h3>{item.title}</h3>
                <p>建議 {formatServingValue(item.servings)} 份 / 日</p>
              </div>
            </div>

            <strong className={styles.highlight}>{item.headline}</strong>

            <ul className={styles.exchangeList}>
              {item.alternatives.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>

            <div className={styles.infoBlock}>
              <span>每餐怎麼分</span>
              <p>{item.mealSplit}</p>
            </div>

            <div className={styles.infoBlock}>
              <span>小提醒</span>
              <p>{item.reminder}</p>
            </div>

            <details className={styles.tooltip}>
              <summary>
                <span className={styles.questionMark}>?</span>
                {item.tooltipQuestion}
              </summary>
              <p>{item.tooltipAnswer}</p>
            </details>
          </article>
        ))}
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

        <article className={styles.visualCard}>
          <div className={styles.visualHeader}>
            <span className={styles.eyebrow}>手掌估算法</span>
            <h3>沒有秤重也能快速抓份量</h3>
          </div>

          <div className={styles.handGrid}>
            {HAND_PORTION_GUIDE.map((item) => (
              <article key={item.label} className={styles.handCard}>
                <span className={styles.handBadge}>{item.badge}</span>
                <strong>{item.label}</strong>
                <p>{item.measure}</p>
                <small>{item.note}</small>
              </article>
            ))}
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
