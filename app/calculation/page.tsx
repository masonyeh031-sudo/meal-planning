import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "飲食數據怎麼算？",
  description:
    "看懂每日熱量、三大營養素與六大類飲食份數的簡化計算邏輯。",
};

export default function CalculationPage() {
  redirect("/zip-site/index.html#principles");
}
