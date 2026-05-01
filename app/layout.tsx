import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "每日飲食份數與營養素計算器",
  description:
    "輸入身高、體重、年齡、性別、活動量與目標，快速估算每日熱量、飲食份數與三大營養素。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}

