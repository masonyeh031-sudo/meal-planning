"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./site-navigation.module.css";

const NAV_ITEMS = [
  { href: "/", label: "飲食計算器" },
  { href: "/calculation", label: "計算原理" },
];

export function NutritionSiteNavigation() {
  const pathname = usePathname();

  return (
    <header className={styles.shell}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandMark}>MP</span>
          <div>
            <strong>Meal Planning</strong>
            <p>每日飲食份數與營養素工具</p>
          </div>
        </Link>

        <nav className={styles.nav} aria-label="主要分頁">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={isActive ? styles.navLinkActive : styles.navLink}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
