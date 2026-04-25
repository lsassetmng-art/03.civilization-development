import type { Metadata } from "next";
import "./globals.css";
import { GlobalHeader } from "@/components/navigation/global-header";
import { GlobalFooter } from "@/components/layout/global-footer";

export const metadata: Metadata = {
  title: "Civilization Portal Site",
  description: "Civilization 全体の公開入口となる公式Webポータル",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <div className="min-h-screen flex flex-col">
          <GlobalHeader />
          <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
          <GlobalFooter />
        </div>
      </body>
    </html>
  );
}
