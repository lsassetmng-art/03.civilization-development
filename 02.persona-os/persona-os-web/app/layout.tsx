import { PersonaI18nProvider } from "../components/i18n/persona-i18n-provider";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "PersonaOS",
  description: "PersonaOS Web Surface migration shell.",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ja">
      <body><PersonaI18nProvider>{children}</PersonaI18nProvider></body>
    </html>
  );
}
