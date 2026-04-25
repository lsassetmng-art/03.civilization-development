import type { Metadata } from "next";
import "./globals.css";
import { GlobalFooter } from "../components/layout/global-footer";
import { GlobalHeader } from "../components/navigation/global-header";
import { SITE_CONFIG } from "../config/site";

export const metadata: Metadata = {
  title: SITE_CONFIG.name,
  description: SITE_CONFIG.description,
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <div className="site-shell">
          <GlobalHeader />
          <main className="page-shell">{children}</main>
          <GlobalFooter />
        </div>
      </body>
    </html>
  );
}
