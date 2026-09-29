import NextLink from "next/link";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof NextLink>;

function normalizePersonaHref(
  href: Props["href"],
): Props["href"] {
  if (typeof href === "string") {
    if (href === "/persona-menu") return "/";
    if (href.startsWith("/persona-menu/")) {
      return href.slice("/persona-menu".length);
    }
    return href;
  }

  if (
    href &&
    typeof href === "object" &&
    typeof href.pathname === "string"
  ) {
    if (href.pathname === "/persona-menu") {
      return { ...href, pathname: "/" };
    }

    if (href.pathname.startsWith("/persona-menu/")) {
      return {
        ...href,
        pathname: href.pathname.slice("/persona-menu".length),
      };
    }
  }

  return href;
}

export default function PersonaRouteLink(props: Props) {
  return (
    <NextLink
      {...props}
      href={normalizePersonaHref(props.href)}
    />
  );
}
