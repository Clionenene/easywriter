import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EasyWriter",
  description: "研究文書の執筆をスモールステップで支援するアプリ"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
