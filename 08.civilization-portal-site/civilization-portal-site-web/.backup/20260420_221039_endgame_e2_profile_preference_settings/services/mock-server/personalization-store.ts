import type { PortalSessionSummary } from "../../types/auth";
import type {
  PortalFavoriteEntryItem,
  PortalRecentActionItem,
  PortalSavedShortcutItem,
} from "../../types/portal-personalization-api";

const nowIso = (): string => new Date().toISOString();
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const savedShortcutsByUser = new Map<string, PortalSavedShortcutItem[]>();
const favoriteEntriesByUser = new Map<string, PortalFavoriteEntryItem[]>();
const recentActionsByUser = new Map<string, PortalRecentActionItem[]>();

const requireUserKey = (session: PortalSessionSummary): string => {
  if (!session.isLoggedIn || !session.civilizationUserId) {
    throw new Error("A logged-in Civilization session is required.");
  }
  return session.civilizationUserId;
};

const ensureSeeded = (session: PortalSessionSummary): string => {
  const userKey = requireUserKey(session);

  if (!savedShortcutsByUser.has(userKey)) {
    savedShortcutsByUser.set(userKey, [
      {
        id: crypto.randomUUID(),
        code: "shortcut-launcher",
        title: "Launcher",
        href: "/me/launcher",
        targetKind: "launcher",
        note: "Default launcher shortcut",
        sortOrder: 10,
        lastUpdatedAt: nowIso(),
      },
      {
        id: crypto.randomUUID(),
        code: "shortcut-os-catalog",
        title: "OS Catalog",
        href: "/os",
        targetKind: "page",
        note: "Default official OS directory",
        sortOrder: 20,
        lastUpdatedAt: nowIso(),
      },
      {
        id: crypto.randomUUID(),
        code: "shortcut-search",
        title: "Search",
        href: "/search",
        targetKind: "search",
        note: "Default portal search entry",
        sortOrder: 30,
        lastUpdatedAt: nowIso(),
      },
    ]);
  }

  if (!favoriteEntriesByUser.has(userKey)) {
    favoriteEntriesByUser.set(userKey, []);
  }

  if (!recentActionsByUser.has(userKey)) {
    recentActionsByUser.set(userKey, []);
  }

  return userKey;
};

const sortShortcuts = (items: PortalSavedShortcutItem[]): PortalSavedShortcutItem[] =>
  [...items].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }
    return a.title.localeCompare(b.title);
  });

const sortFavorites = (items: PortalFavoriteEntryItem[]): PortalFavoriteEntryItem[] =>
  [...items].sort((a, b) => {
    if (a.lastUpdatedAt < b.lastUpdatedAt) return 1;
    if (a.lastUpdatedAt > b.lastUpdatedAt) return -1;
    return a.title.localeCompare(b.title);
  });

const sortRecents = (items: PortalRecentActionItem[]): PortalRecentActionItem[] =>
  [...items].sort((a, b) => {
    if (a.occurredAt < b.occurredAt) return 1;
    if (a.occurredAt > b.occurredAt) return -1;
    return a.targetTitle.localeCompare(b.targetTitle);
  });

export const getPersonalEntries = (
  session: PortalSessionSummary,
  limit: number,
): {
  savedShortcuts: PortalSavedShortcutItem[];
  favoriteEntries: PortalFavoriteEntryItem[];
  recentActions: PortalRecentActionItem[];
} => {
  const userKey = ensureSeeded(session);

  return {
    savedShortcuts: clone(
      sortShortcuts(savedShortcutsByUser.get(userKey) || []).slice(0, limit),
    ),
    favoriteEntries: clone(
      sortFavorites(favoriteEntriesByUser.get(userKey) || []).slice(0, limit),
    ),
    recentActions: clone(
      sortRecents(recentActionsByUser.get(userKey) || []).slice(0, limit),
    ),
  };
};

export const upsertSavedShortcut = (
  session: PortalSessionSummary,
  input: {
    code: string;
    title: string;
    href: string;
    targetKind: "page" | "os" | "auth" | "launcher" | "admin" | "search";
    note?: string;
    sortOrder: number;
  },
): PortalSavedShortcutItem => {
  const userKey = ensureSeeded(session);
  const current = savedShortcutsByUser.get(userKey) || [];
  const index = current.findIndex((item) => item.code === input.code);

  const item: PortalSavedShortcutItem = {
    id: index >= 0 ? current[index].id : crypto.randomUUID(),
    code: input.code,
    title: input.title,
    href: input.href,
    targetKind: input.targetKind,
    note: input.note || undefined,
    sortOrder: input.sortOrder,
    lastUpdatedAt: nowIso(),
  };

  if (index >= 0) {
    current[index] = item;
  } else {
    current.push(item);
  }

  savedShortcutsByUser.set(userKey, sortShortcuts(current));
  return clone(item);
};

export const upsertFavoriteEntry = (
  session: PortalSessionSummary,
  input: {
    code: string;
    title: string;
    href: string;
    targetKind: "page" | "os" | "auth" | "launcher" | "admin" | "search";
    reason?: string;
  },
): PortalFavoriteEntryItem => {
  const userKey = ensureSeeded(session);
  const current = favoriteEntriesByUser.get(userKey) || [];
  const index = current.findIndex((item) => item.code === input.code);

  const item: PortalFavoriteEntryItem = {
    id: index >= 0 ? current[index].id : crypto.randomUUID(),
    code: input.code,
    title: input.title,
    href: input.href,
    targetKind: input.targetKind,
    reason: input.reason || undefined,
    lastUpdatedAt: nowIso(),
  };

  if (index >= 0) {
    current[index] = item;
  } else {
    current.push(item);
  }

  favoriteEntriesByUser.set(userKey, sortFavorites(current));
  return clone(item);
};

export const appendRecentAction = (
  session: PortalSessionSummary,
  input: {
    actionCode: string;
    actionLabel: string;
    targetCode: string;
    targetTitle: string;
    targetHref: string;
    targetKind: "page" | "os" | "auth" | "launcher" | "admin" | "search";
  },
): PortalRecentActionItem => {
  const userKey = ensureSeeded(session);
  const current = recentActionsByUser.get(userKey) || [];

  const item: PortalRecentActionItem = {
    id: crypto.randomUUID(),
    actionCode: input.actionCode,
    actionLabel: input.actionLabel,
    targetCode: input.targetCode,
    targetTitle: input.targetTitle,
    targetHref: input.targetHref,
    targetKind: input.targetKind,
    occurredAt: nowIso(),
  };

  const next = [item, ...current].slice(0, 20);
  recentActionsByUser.set(userKey, sortRecents(next));
  return clone(item);
};
