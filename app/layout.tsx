import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "我的记账本",
  description: "简洁高效的个人记账工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
