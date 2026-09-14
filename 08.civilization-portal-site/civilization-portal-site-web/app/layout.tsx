import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { PortalI18nProvider } from "../components/i18n/portal-i18n-provider";
import { GlobalFooter } from "../components/layout/global-footer";
import { GlobalHeader } from "../components/navigation/global-header";

export const metadata: Metadata = {
  title: "Civilization ポータルサイト",
  description: "Civilizationの公式Web入口です。",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <PortalI18nProvider>
          <GlobalHeader />
          <main>{children}</main>
          <GlobalFooter />
        </PortalI18nProvider>
      </body>
    </html>
  );
}
