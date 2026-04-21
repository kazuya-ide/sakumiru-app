import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "現場管理 | Sakumiru-like SaaS",
  description: "建設現場の案件・工程・日報を一元管理",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
