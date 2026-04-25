import Link from "next/link";
import { ROUTES } from "@/lib/routing/routes";

const items = [
  { href: ROUTES.home, label: "Top" },
  { href: ROUTES.civilization, label: "Civilization" },
  { href: ROUTES.osList, label: "OS" },
  { href: ROUTES.guide, label: "Guide" },
  { href: ROUTES.login, label: "Login" },
  { href: ROUTES.signup, label: "Signup" },
];

export function GlobalHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href={ROUTES.home} className="font-semibold">
          Civilization Portal Site
        </Link>
        <nav className="flex gap-4 text-sm">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className="hover:underline">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
