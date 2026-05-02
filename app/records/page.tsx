import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "七天飲食紀錄",
  description:
    "記錄每日三餐、點心與宵夜，快速查看七天的熱量與六大類食物攝取狀況。",
};

export default function RecordsPage() {
  redirect("/zip-site/index.html#records");
}
