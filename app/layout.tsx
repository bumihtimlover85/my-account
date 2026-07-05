import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Navbar } from "@/components/navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "项目管理看板",
  description: "高效的团队项目管理看板工具",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {session?.user && <Navbar user={session.user} />}
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
