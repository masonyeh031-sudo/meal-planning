"use client";

import type { CSSProperties } from "react";

import styles from "./food-guide-page.module.css";
import { NutritionSiteNavigation } from "./site-navigation";

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

interface FoodGroup {
  id: string;
  title: string;
  tag: string;
  description: string;
  examples: string[];
  hero: FoodIconVariant;
  companions: FoodIconVariant[];
  accentColor: string;
  softColor: string;
}

const FOOD_GROUPS: FoodGroup[] = [
  {
    id: "grains",
    title: "全穀雜糧類",
    tag: "能量來源",
    description: "提供身體主要的能量，是每天活力的基礎。",
    examples: ["白飯", "地瓜", "燕麥", "吐司", "麵"],
    hero: "riceBowl",
    companions: ["toast", "corn"],
    accentColor: "#f2b575",
    softColor: "#fff4e6",
  },
  {
    id: "protein",
    title: "豆魚蛋肉類",
    tag: "蛋白質來源",
    description: "幫助肌肉生長、修復身體並維持體力。",
    examples: ["雞胸肉", "魚", "雞蛋", "豆腐", "豆漿"],
    hero: "meat",
    companions: ["egg", "fish"],
    accentColor: "#f29b8f",
    softColor: "#fff0ec",
  },
  {
    id: "dairy",
    title: "乳品類",
    tag: "鈣質來源",
    description: "提供豐富蛋白質與鈣質，幫助骨骼健康。",
    examples: ["牛奶", "起司", "優格", "優酪乳"],
    hero: "milk",
    companions: ["cheese", "yogurt"],
    accentColor: "#8fb8ff",
    softColor: "#edf5ff",
  },
  {
    id: "vegetables",
    title: "蔬菜類",
    tag: "維生素 & 纖維",
    description: "提供維生素、礦物質與纖維，每天都要吃足。",
    examples: ["高麗菜", "花椰菜", "菠菜", "番茄", "胡蘿蔔"],
    hero: "broccoli",
    companions: ["leafy", "carrot"],
    accentColor: "#88c98d",
    softColor: "#eef9ef",
  },
  {
    id: "fruits",
    title: "水果類",
    tag: "維生素補充",
    description: "提供維生素與天然糖分，補充每日活力。",
    examples: ["蘋果", "香蕉", "芭樂", "橘子", "奇異果"],
    hero: "apple",
    companions: ["banana", "citrus"],
    accentColor: "#ffb76e",
    softColor: "#fff4e7",
  },
  {
    id: "fats",
    title: "油脂與堅果種子類",
    tag: "好油脂",
    description: "提供必需脂肪酸，幫助身體運作，份量少少就夠。",
    examples: ["杏仁", "核桃", "花生", "酪梨", "橄欖油"],
    hero: "nuts",
    companions: ["avocado", "oilBottle"],
    accentColor: "#d3b98c",
    softColor: "#f8f2e8",
  },
];

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

function FoodIcon({ variant, className }: { variant: FoodIconVariant; className?: string }) {
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

function FoodGroupCard({ group, index }: { group: FoodGroup; index: number }) {
  const cardStyle = {
    "--accent-color": group.accentColor,
    "--soft-color": group.softColor,
    "--motion-delay": `${120 + index * 80}ms`,
  } as CSSProperties;

  return (
    <article className={styles.card} style={cardStyle}>
      <div className={styles.cardTag}>{group.tag}</div>

      <div className={styles.iconRow} aria-hidden="true">
        <div className={`${styles.iconBubble} ${styles.iconBubbleHero}`}>
          <FoodIcon variant={group.hero} className={styles.iconSvg} />
        </div>
        {group.companions.map((variant, i) => (
          <div
            key={variant}
            className={`${styles.iconBubble} ${styles.iconBubbleSmall}`}
            style={{ "--bubble-index": i } as CSSProperties}
          >
            <FoodIcon variant={variant} className={styles.iconSvg} />
          </div>
        ))}
      </div>

      <h2 className={styles.cardTitle}>{group.title}</h2>
      <p className={styles.cardDescription}>{group.description}</p>

      <div className={styles.examples}>
        <span className={styles.examplesLabel}>常見食物</span>
        <div className={styles.chipList}>
          {group.examples.map((example) => (
            <span key={example} className={styles.chip}>
              {example}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export function FoodGuidePage() {
  return (
    <main className={styles.page}>
      <NutritionSiteNavigation />

      <section className={styles.hero}>
        <div className={styles.heroDecorations} aria-hidden="true">
          <span className={`${styles.heroDecoration} ${styles.heroDecorationOne}`}>
            <FoodIcon variant="riceBowl" className={styles.iconSvg} />
          </span>
          <span className={`${styles.heroDecoration} ${styles.heroDecorationTwo}`}>
            <FoodIcon variant="apple" className={styles.iconSvg} />
          </span>
          <span className={`${styles.heroDecoration} ${styles.heroDecorationThree}`}>
            <FoodIcon variant="milk" className={styles.iconSvg} />
          </span>
          <span className={`${styles.heroDecoration} ${styles.heroDecorationFour}`}>
            <FoodIcon variant="broccoli" className={styles.iconSvg} />
          </span>
        </div>

        <span className={styles.heroBadge}>Six Food Groups</span>
        <h1 className={styles.heroTitle}>六大類食物指南</h1>
        <p className={styles.heroSubtitle}>
          用簡單清楚的方式，帶你認識每天飲食中不可缺少的六大類食物。
        </p>
      </section>

      <section className={styles.cardGrid}>
        {FOOD_GROUPS.map((group, index) => (
          <FoodGroupCard key={group.id} group={group} index={index} />
        ))}
      </section>

      <section className={styles.footerNote}>
        <p>
          均衡飲食的重點是「每一類都吃到」，不需要每天分量完全一樣。先把六大類認得清楚，再慢慢調整成適合自己的份量就好。
        </p>
      </section>
    </main>
  );
}
