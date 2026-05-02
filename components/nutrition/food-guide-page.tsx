"use client";

import Link from "next/link";
import type { CSSProperties } from "react";

import styles from "./food-guide-page.module.css";
import { NutritionSiteNavigation } from "./site-navigation";
import { FOOD_GUIDE_ITEMS } from "@/lib/food-guide";

type FoodIconVariant =
  | "riceBowl"
  | "toast"
  | "corn"
  | "meat"
  | "egg"
  | "fish"
  | "apple"
  | "banana"
  | "citrus"
  | "broccoli"
  | "leafy"
  | "carrot"
  | "milk"
  | "cheese"
  | "yogurt"
  | "nuts"
  | "avocado"
  | "oilBottle";

const FOOD_DECORATIONS: Record<
  (typeof FOOD_GUIDE_ITEMS)[number]["id"],
  { hero: FoodIconVariant; orbit: FoodIconVariant[]; sparkles: number[] }
> = {
  grains: {
    hero: "riceBowl",
    orbit: ["toast", "corn", "riceBowl"],
    sparkles: [0, 1],
  },
  protein: {
    hero: "meat",
    orbit: ["egg", "fish", "milk"],
    sparkles: [0, 1],
  },
  fruits: {
    hero: "apple",
    orbit: ["banana", "apple", "citrus"],
    sparkles: [0, 1],
  },
  vegetables: {
    hero: "broccoli",
    orbit: ["leafy", "carrot", "broccoli"],
    sparkles: [0, 1],
  },
  dairy: {
    hero: "milk",
    orbit: ["cheese", "yogurt", "milk"],
    sparkles: [0, 1],
  },
  fats: {
    hero: "nuts",
    orbit: ["avocado", "oilBottle", "nuts"],
    sparkles: [0, 1],
  },
};

function CuteFace({
  eyeY = 57,
  smileY = 65,
  eyeLeft = 42,
  eyeRight = 58,
}: {
  eyeY?: number;
  smileY?: number;
  eyeLeft?: number;
  eyeRight?: number;
}) {
  return (
    <g stroke="#3f4d57" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx={eyeLeft} cy={eyeY} r="2.2" fill="#3f4d57" stroke="none" />
      <circle cx={eyeRight} cy={eyeY} r="2.2" fill="#3f4d57" stroke="none" />
      <path d={`M${eyeLeft + 2} ${smileY} Q50 ${smileY + 5} ${eyeRight - 2} ${smileY}`} fill="none" />
    </g>
  );
}

function FoodIcon({
  variant,
  className,
}: {
  variant: FoodIconVariant;
  className?: string;
}) {
  switch (variant) {
    case "riceBowl":
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          <ellipse cx="50" cy="42" rx="24" ry="18" fill="#fffaf4" />
          <path d="M26 50h48c0 16-10 27-24 27S26 66 26 50Z" fill="#f3a6a0" />
          <path d="M30 50h40" stroke="#df8c85" strokeWidth="3" strokeLinecap="round" />
          <CuteFace eyeY={60} smileY={67} />
        </svg>
      );
    case "toast":
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          <path d="M28 28c0-10 7-16 17-16 7 0 11 3 15 7 4-4 8-7 15-7 10 0 17 6 17 16v28c0 14-10 24-24 24H44C30 80 20 70 20 56V28h8Z" fill="#f0b66c" />
          <path d="M34 30c0-7 5-11 12-11 5 0 8 2 11 5 3-3 6-5 11-5 7 0 12 4 12 11v23c0 12-8 19-19 19H45c-11 0-19-7-19-19V30h8Z" fill="#fff3d8" />
          <CuteFace eyeY={48} smileY={57} />
        </svg>
      );
    case "corn":
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          <ellipse cx="50" cy="46" rx="18" ry="27" fill="#ffd76a" />
          <path d="M38 65 24 82c13 0 19-3 26-13" fill="#82c980" />
          <path d="M62 65 76 82c-13 0-19-3-26-13" fill="#6eb66e" />
          <path d="M50 23v46M41 26v40M59 26v40" stroke="#f2bf37" strokeWidth="3" strokeLinecap="round" />
          <CuteFace eyeY={48} smileY={58} />
        </svg>
      );
    case "meat":
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          <path d="M27 53c0-18 13-31 31-31 11 0 18 3 24 10 6 7 9 14 9 23 0 17-14 29-33 29-18 0-31-12-31-31Z" fill="#ef8b91" />
          <path d="M38 44c4-7 11-11 21-11 12 0 22 8 22 20 0 10-8 18-21 18-10 0-17-3-21-11" fill="#ffd9d9" opacity="0.9" />
          <CuteFace eyeY={53} smileY={63} />
        </svg>
      );
    case "egg":
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          <path d="M50 16c16 0 29 18 29 36 0 17-12 30-29 30S21 69 21 52c0-18 13-36 29-36Z" fill="#fffaf1" />
          <circle cx="50" cy="54" r="12" fill="#ffbf4d" />
          <CuteFace eyeY={42} smileY={49} />
        </svg>
      );
    case "fish":
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          <ellipse cx="52" cy="50" rx="23" ry="18" fill="#8fd9d7" />
          <path d="M25 50 10 36v28l15-14Z" fill="#66c5c2" />
          <path d="M43 42c3-3 7-5 12-5" stroke="#69b5b2" strokeWidth="3" strokeLinecap="round" />
          <circle cx="62" cy="46" r="2.5" fill="#36454f" />
          <path d="M57 57q5 5 10 0" stroke="#36454f" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </svg>
      );
    case "apple":
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          <path d="M50 26c16 0 27 11 27 26 0 17-11 29-27 29S23 69 23 52c0-15 11-26 27-26Z" fill="#ff8b8f" />
          <path d="M50 21c2-5 6-9 12-11" stroke="#7b8f52" strokeWidth="4" strokeLinecap="round" />
          <path d="M56 18c7-1 11 2 14 8-8 0-13-1-17-4Z" fill="#89c97b" />
          <CuteFace eyeY={49} smileY={59} />
        </svg>
      );
    case "banana":
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          <path d="M26 58c9 13 28 18 47 6 7-4 12-10 15-18-10 5-20 8-30 8-10 0-21-3-32-10Z" fill="#ffd96f" />
          <path d="M30 55c9 9 24 12 38 4" stroke="#efbf3a" strokeWidth="3" strokeLinecap="round" />
          <circle cx="55" cy="49" r="2.2" fill="#36454f" />
          <circle cx="65" cy="47" r="2.2" fill="#36454f" />
          <path d="M57 56q4 4 9 0" stroke="#36454f" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </svg>
      );
    case "citrus":
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          <circle cx="50" cy="50" r="27" fill="#ffbb63" />
          <circle cx="50" cy="50" r="20" fill="#ffd8a0" />
          <path d="M50 30v40M32 41l36 18M68 41 32 59" stroke="#ffbf69" strokeWidth="3" strokeLinecap="round" />
          <CuteFace eyeY={48} smileY={58} />
        </svg>
      );
    case "broccoli":
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          <circle cx="38" cy="38" r="12" fill="#70c36d" />
          <circle cx="50" cy="31" r="14" fill="#67bb64" />
          <circle cx="63" cy="39" r="12" fill="#75c973" />
          <rect x="44" y="45" width="12" height="25" rx="6" fill="#8cc888" />
          <CuteFace eyeY={53} smileY={62} />
        </svg>
      );
    case "leafy":
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          <path d="M50 72c-18-7-25-20-22-36 14 1 24 7 30 19 6-12 16-18 30-19 3 16-4 29-22 36" fill="#8fd28f" />
          <path d="M50 70V34" stroke="#6fae70" strokeWidth="3" strokeLinecap="round" />
          <path d="M50 50c-8-8-14-11-22-13M50 48c8-8 14-11 22-13" stroke="#6fae70" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case "carrot":
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          <path d="M46 28c8 10 14 24 13 38L49 82 33 62c2-15 7-27 13-34Z" fill="#ffae64" />
          <path d="M37 25c3-5 7-8 13-10M47 23c3-6 8-10 14-12" stroke="#74bf75" strokeWidth="4" strokeLinecap="round" />
          <CuteFace eyeY={52} smileY={60} />
        </svg>
      );
    case "milk":
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          <path d="M38 22h20l8 12v42c0 4-3 7-7 7H41c-4 0-7-3-7-7V34l4-12Z" fill="#f5fbff" />
          <path d="M38 22h20l8 12H34l4-12Z" fill="#a7d4ff" />
          <path d="M40 50h20" stroke="#9dc8f5" strokeWidth="3" strokeLinecap="round" />
          <CuteFace eyeY={57} smileY={66} />
        </svg>
      );
    case "cheese":
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          <path d="M26 68 70 30c8 8 10 20 4 29L49 82c-8-1-17-5-23-14Z" fill="#ffd56b" />
          <circle cx="58" cy="48" r="4" fill="#ffefb7" />
          <circle cx="46" cy="60" r="5" fill="#ffefb7" />
          <circle cx="62" cy="63" r="3.5" fill="#ffefb7" />
        </svg>
      );
    case "yogurt":
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          <ellipse cx="50" cy="43" rx="23" ry="12" fill="#ffffff" />
          <path d="M29 44h42c0 17-9 27-21 27S29 61 29 44Z" fill="#9bcaf4" />
          <path d="M33 44c3-10 9-16 17-16s14 6 17 16" fill="#fff8f2" />
          <CuteFace eyeY={54} smileY={62} />
        </svg>
      );
    case "nuts":
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          <path d="M38 30c9 0 16 8 16 19 0 11-7 20-16 20S22 60 22 49c0-11 7-19 16-19Z" fill="#d7b184" />
          <path d="M62 32c9 0 16 8 16 19 0 11-7 20-16 20S46 62 46 51c0-11 7-19 16-19Z" fill="#c99562" />
          <path d="M50 40c4 2 7 6 7 11 0 6-4 11-10 13" stroke="#af7d4e" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case "avocado":
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          <path d="M50 20c17 0 29 15 29 31 0 19-12 31-29 31S21 70 21 51c0-16 12-31 29-31Z" fill="#91d06e" />
          <path d="M50 28c12 0 20 11 20 23 0 15-8 23-20 23S30 66 30 51c0-12 8-23 20-23Z" fill="#d7f3b8" />
          <circle cx="50" cy="57" r="9" fill="#a96b4f" />
          <CuteFace eyeY={44} smileY={50} />
        </svg>
      );
    case "oilBottle":
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          <path d="M44 20h12v10l6 8v33c0 5-4 9-9 9h-6c-5 0-9-4-9-9V38l6-8V20Z" fill="#ffd981" />
          <path d="M44 20h12v10H44Z" fill="#8cc6a1" />
          <path d="M39 49h22" stroke="#f3c65e" strokeWidth="3" strokeLinecap="round" />
          <CuteFace eyeY={58} smileY={67} />
        </svg>
      );
  }
}

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
          <div className={styles.foodHeroIcon}>
            <FoodIcon variant={decoration.hero} className={styles.foodIconSvg} />
          </div>
          <div className={styles.foodOrbitIcons}>
            {decoration.orbit.map((icon) => (
              <div
                key={`${item.id}-${icon}`}
                className={styles.foodOrbitIcon}
              >
                <FoodIcon variant={icon} className={styles.foodIconSvg} />
              </div>
            ))}
          </div>
          <div className={styles.foodSparkles}>
            {decoration.sparkles.map((sparkleIndex) => (
              <span
                key={`${item.id}-sparkle-${sparkleIndex}`}
                className={styles.foodSparkle}
                style={{ ["--sparkle-index" as string]: sparkleIndex } as CSSProperties}
              />
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
