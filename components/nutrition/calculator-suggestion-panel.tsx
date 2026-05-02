"use client";

import Link from "next/link";

import styles from "./calculator-suggestion-panel.module.css";
import { DAILY_FOOD_TIPS } from "@/lib/food-guide";

function BentoBox() {
  return (
    <div className={styles.bento} aria-hidden="true">
      <div className={styles.bentoChopsticks}>
        <span />
        <span />
      </div>

      <div className={styles.bentoInner}>
        <div className={`${styles.bentoCell} ${styles.bentoCellVeg}`}>
          <div className={styles.bentoCellInner}>
            <svg viewBox="0 0 100 100" className={styles.bentoIcon}>
              <circle cx="32" cy="38" r="11" fill="#7cc27d" />
              <circle cx="50" cy="32" r="13" fill="#6cb86b" />
              <circle cx="68" cy="38" r="11" fill="#82c884" />
              <rect x="44" y="44" width="12" height="22" rx="6" fill="#8cc888" />
              <circle cx="22" cy="60" r="8" fill="#a3d6a4" />
              <circle cx="78" cy="60" r="8" fill="#a3d6a4" />
              <circle cx="42" cy="68" r="6" fill="#ffb6b8" />
              <circle cx="60" cy="68" r="6" fill="#ffb6b8" />
            </svg>
            <span className={styles.bentoLabel}>蔬菜 1/2</span>
          </div>
        </div>

        <div className={`${styles.bentoCell} ${styles.bentoCellGrain}`}>
          <div className={styles.bentoCellInner}>
            <svg viewBox="0 0 100 100" className={styles.bentoIcon}>
              <ellipse cx="50" cy="40" rx="28" ry="14" fill="#fffaf4" />
              <path
                d="M22 44h56c0 18-12 30-28 30S22 62 22 44Z"
                fill="#f3a6a0"
              />
              <ellipse cx="40" cy="38" rx="3" ry="2" fill="#ffffff" />
              <ellipse cx="55" cy="36" rx="3" ry="2" fill="#ffffff" />
              <ellipse cx="48" cy="42" rx="3" ry="2" fill="#ffffff" />
              <circle cx="42" cy="58" r="2" fill="#3f4d57" />
              <circle cx="58" cy="58" r="2" fill="#3f4d57" />
              <path
                d="M44 64 Q50 68 56 64"
                stroke="#3f4d57"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
            <span className={styles.bentoLabel}>主食 1/4</span>
          </div>
        </div>

        <div className={`${styles.bentoCell} ${styles.bentoCellProtein}`}>
          <div className={styles.bentoCellInner}>
            <svg viewBox="0 0 100 100" className={styles.bentoIcon}>
              <path
                d="M50 18c16 0 28 16 28 32 0 18-12 30-28 30S22 68 22 50c0-16 12-32 28-32Z"
                fill="#fffaf1"
              />
              <circle cx="50" cy="50" r="14" fill="#ffbf4d" />
              <circle cx="46" cy="46" r="3" fill="#ffd98a" />
              <circle cx="44" cy="42" r="2" fill="#3f4d57" />
              <circle cx="56" cy="42" r="2" fill="#3f4d57" />
              <path
                d="M44 56 Q50 60 56 56"
                stroke="#3f4d57"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
            <span className={styles.bentoLabel}>蛋白質 1/4</span>
          </div>
        </div>
      </div>

      <span className={`${styles.bentoSparkle} ${styles.bentoSparkleOne}`} />
      <span className={`${styles.bentoSparkle} ${styles.bentoSparkleTwo}`} />
      <span className={`${styles.bentoSparkle} ${styles.bentoSparkleThree}`} />
    </div>
  );
}

export function CalculatorSuggestionPanel() {
  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>建議吃法</span>
          <h2>用餐盤比例安排三餐</h2>
          <p className={styles.description}>
            把每餐分成蔬菜、主食與蛋白質三塊，今天的便當就先這樣配。份量翻譯與手掌估算可到六大類食物指南查看。
          </p>
        </div>
        <Link href="/food-guide" className={styles.guideLink}>
          查看六大類食物指南
        </Link>
      </div>

      <div className={styles.visualGrid}>
        <article className={styles.visualCard}>
          <div className={styles.visualHeader}>
            <span className={styles.eyebrow}>便當比例圖</span>
            <h3>一餐可以先這樣配</h3>
          </div>

          <div className={styles.plateLayout}>
            <BentoBox />
            <div className={styles.legendList}>
              <div className={styles.legendItem}>
                <span
                  className={styles.legendSwatch}
                  style={{ backgroundColor: "#88c98d" }}
                />
                <div>
                  <strong>蔬菜 1/2 盤</strong>
                  <p>先把便當的一半留給青菜與菇類。</p>
                </div>
              </div>
              <div className={styles.legendItem}>
                <span
                  className={styles.legendSwatch}
                  style={{ backgroundColor: "#f2b575" }}
                />
                <div>
                  <strong>全穀雜糧 1/4 盤</strong>
                  <p>飯、麵、地瓜、吐司都可以放在這一格。</p>
                </div>
              </div>
              <div className={styles.legendItem}>
                <span
                  className={styles.legendSwatch}
                  style={{ backgroundColor: "#f29b8f" }}
                />
                <div>
                  <strong>豆魚蛋肉 1/4 盤</strong>
                  <p>主菜抓一掌心大小會更好估。</p>
                </div>
              </div>
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
