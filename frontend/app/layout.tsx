import type { Metadata } from "next";

import AppShell from "@/components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "国际货运代理 · 海运进出口业务平台",
  description: "整箱作业单管理（云海简化版）",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
