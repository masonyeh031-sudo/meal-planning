"use client";

import Link from "next/link";
import type { CSSProperties } from "react";

import styles from "./food-guide-page.module.css";
import { NutritionSiteNavigation } from "./site-navigation";
import { FOOD_GUIDE_ITEMS } from "@/lib/food-guide";

const FOOD_DECORATIONS: Record<
  (typeof FOOD_GUIDE_ITEMS)[number]["id"],
  { hero: string; orbit: string[]; sparkles: string[] }
> = {
  grains: {
    hero: "🍚",
    orbit: ["🍞", "🌽", "🥣"],
    sparkles: ["✨", "🌾"],
  },
  protein: {
    hero: "🥩",
    orbit: ["🥚", "🐟", "🧃"],
    sparkles: ["✨", "💪"],
  },
  fruits: {
    hero: "🍎",
    orbit: ["🍌", "🥝", "🍊"],
    sparkles: ["✨", "🌼"],
  },
  vegetables: {
    hero: "🥦",
    orbit: ["🥬", "🥕", "🍄"],
    sparkles: ["✨", "🌿"],
  },
  dairy: {
    hero: "🥛",
    orbit: ["🧀", "🍶", "🥣"],
    sparkles: ["✨", "🫧"],
  },
  fats: {
    hero: "🥜",
    orbit: ["🥑", "🫒", "🥄"],
    sparkles: ["✨", "🌰"],
  },
};

function buildMotionStyle(delayMs: number): CSSProperties {
  return {
    "--motion-delay": `${delayMs}ms`,
  } as CSSProperties;
}

function FoodGroupGuideCard({
  index,
  item,
}: {
  index: number;
  item: (typeof FOOD_GUIDE_ITEMS)[number];
}) {
  const decoration = FOOD_DECORATIONS[item.id];

  return (
    <article
      className={styles.groupCard}
      style={
        {
          "--accent-color": item.accentColor,
          "--soft-color": item.softColor,
          "--motion-delay": `${220 + index * 65}ms`,
          borderColor: `${item.accentColor}26`,
        } as CSSProperties
      }
    >
      <div className={styles.groupVisual}>
        <div className={styles.groupVisualGlow} />
        <div className={styles.groupVisualOrbit} />
        <div className={styles.foodScene} aria-hidden="true">
          <span className={styles.foodHeroIcon}>{decoration.hero}</span>
          <div className={styles.foodOrbitIcons}>
            {decoration.orbit.map((icon, orbitIndex) => (
              <span
                key={`${item.id}-${icon}`}
                className={styles.foodOrbitIcon}
                style={{ ["--orbit-index" as string]: orbitIndex } as CSSProperties}
              >
                {icon}
              </span>
            ))}
          </div>
          <div className={styles.foodSparkles}>
            {decoration.sparkles.map((icon, sparkleIndex) => (
              <span
                key={`${item.id}-sparkle-${icon}`}
                className={styles.foodSparkle}
                style={{ ["--sparkle-index" as string]: sparkleIndex } as CSSProperties}
              >
                {icon}
              </span>
            ))}
          </div>
        </div>
        <div className={styles.groupHeader}>
          <span className={styles.groupBadge}>{item.badge}</span>
          <div>
            <h2>{item.title}</h2>
            <p>{item.roleDescription}</p>
          </div>
        </div>
        <div className={styles.groupHeroNote}>
          <span className={styles.sectionTag}>快速記法</span>
          <strong>{item.quickLook}</strong>
        </div>
        <div className={styles.groupStickers}>
          <span className={styles.sticker}>{item.commonExchanges[0]}</span>
          <span className={styles.sticker}>{item.commonExchanges[1]}</span>
          <span className={styles.sticker}>{item.easyReads[0]}</span>
        </div>
      </div>

      <div className={styles.groupContent}>
        <section className={styles.groupSection}>
          <span className={styles.sectionTag}>1 份大概是</span>
          <strong className={styles.sectionHighlight}>{item.servingHighlight}</strong>
        </section>

        <section className={styles.groupSection}>
          <span className={styles.sectionTag}>常見替換食物</span>
          <div className={styles.chipList}>
            {item.commonExchanges.map((line) => (
              <span key={line} className={styles.chip}>
                {line}
              </span>
            ))}
          </div>
        </section>

        <div className={styles.groupBottomGrid}>
          <section className={styles.groupSection}>
            <span className={styles.sectionTag}>怎麼記最簡單</span>
            <ul className={styles.readList}>
              {item.easyReads.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>

          <div className={styles.reminderBubble}>
            <span>小提醒</span>
            <p>{item.reminder}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

export function FoodGuidePage() {
  return (
    <main className={styles.page}>
      <div className={styles.pageGlow} />
      <NutritionSiteNavigation />

      <section className={styles.hero}>
        <div className={styles.heroBadge}>Food Portion Guide</div>
        <h1 className={styles.title}>六大類食物指南</h1>
        <p className={styles.description}>
          用最簡單的方式，帶你看懂每天該怎麼吃。從飯碗、掌心、拳頭、杯子到小茶匙，把抽象的份數變成日常看得懂的份量。
        </p>

        <div className={styles.heroFacts}>
          <article className={styles.factCard} style={buildMotionStyle(120)}>
            <span>先記 1 份</span>
            <strong>比背公克更容易</strong>
            <p>把每一類先記成碗、片、掌心、拳頭與小茶匙。</p>
          </article>
          <article className={styles.factCard} style={buildMotionStyle(190)}>
            <span>可互相替換</span>
            <strong>不是只能吃同一種</strong>
            <p>飯可以換吐司，牛奶也能換優格，重點是抓到份量概念。</p>
          </article>
          <article className={styles.factCard} style={buildMotionStyle(260)}>
            <span>外食也能估</span>
            <strong>用眼睛就能先抓方向</strong>
            <p>看到主食、主菜、青菜、飲品時，就能先用生活化方式判斷。</p>
          </article>
        </div>
      </section>

      <section className={styles.content}>
        <section className={styles.quickSection}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>快速總覽</span>
              <h2>先記住這 6 個最常用的份量</h2>
            </div>
            <Link href="/" className={styles.inlineLink}>
              回到飲食計算器
            </Link>
          </div>

          <div className={styles.quickGrid}>
            {FOOD_GUIDE_ITEMS.map((item, index) => (
              <article
                key={item.id}
                className={styles.quickCard}
                style={
                  {
                    "--accent-color": item.accentColor,
                    "--soft-color": item.softColor,
                    "--motion-delay": `${170 + index * 45}ms`,
                  } as CSSProperties
                }
              >
                <span className={styles.quickBadge}>{item.badge}</span>
                <strong>{item.title}</strong>
                <p>{item.quickLook}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.guidesSection}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>六大類主卡片</span>
              <h2>把 1 份換成看得懂的日常份量</h2>
            </div>
          </div>

          <div className={styles.guidesGrid}>
            {FOOD_GUIDE_ITEMS.map((item, index) => (
              <FoodGroupGuideCard key={item.id} item={item} index={index} />
            ))}
          </div>
        </section>

        <section className={styles.footerCard} style={buildMotionStyle(640)}>
          <div>
            <span className={styles.eyebrow}>貼心提醒</span>
            <h2>份量是教學估算，不是唯一答案</h2>
          </div>
          <p>
            每個人的需求會依年齡、活動量、健康狀況與飲食習慣不同而調整。這一頁的份量主要是幫助你先建立生活化概念，如果有特殊需求，仍建議依營養師或醫師建議調整。
          </p>
        </section>
      </section>
    </main>
  );
}
