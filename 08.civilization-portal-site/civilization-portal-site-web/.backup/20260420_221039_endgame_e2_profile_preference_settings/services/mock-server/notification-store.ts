import type { PortalSessionSummary } from "../../types/auth";
import type {
  PortalAnnouncementAckState,
  PortalNotificationCenterItem,
} from "../../types/portal-notification-api";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const nowIso = (): string => new Date().toISOString();

let notificationItems: PortalNotificationCenterItem[] = [
  {
    id: "notification-home-banner-01",
    code: "home-banner-platform-update",
    channel: "banner",
    surface: "home",
    audience: "public",
    title: "Portal update",
    body: "The portal is now using notification center payloads for public banners and launcher inbox items.",
    href: "/guide",
    tone: "info",
    priority: 10,
    visibility: "visible",
    ackRequired: false,
    dismissible: false,
    lastUpdatedAt: nowIso(),
  },
  {
    id: "notification-home-banner-02",
    code: "home-banner-search-recommendation",
    channel: "banner",
    surface: "home",
    audience: "public",
    title: "Search and recommendations are active",
    body: "Use Search and Recommended entries to find the right portal path more quickly.",
    href: "/search",
    tone: "success",
    priority: 20,
    visibility: "visible",
    ackRequired: false,
    dismissible: false,
    lastUpdatedAt: nowIso(),
  },
  {
    id: "notification-launcher-inbox-01",
    code: "launcher-inbox-personalization",
    channel: "inbox",
    surface: "launcher",
    audience: "member",
    title: "Personal entries are active",
    body: "Saved shortcuts, favorites, and recent actions can now be read from the launcher.",
    href: "/me/launcher",
    tone: "success",
    priority: 10,
    visibility: "visible",
    ackRequired: false,
    dismissible: true,
    lastUpdatedAt: nowIso(),
  },
  {
    id: "notification-launcher-announcement-01",
    code: "launcher-announcement-review",
    channel: "announcement",
    surface: "launcher",
    audience: "member",
    title: "Launcher review notice",
    body: "Please review your launcher shortcuts after major portal changes.",
    href: "/me/launcher",
    tone: "warning",
    priority: 20,
    visibility: "visible",
    ackRequired: true,
    dismissible: true,
    lastUpdatedAt: nowIso(),
  },
  {
    id: "notification-launcher-banner-operator",
    code: "launcher-operator-banner",
    channel: "banner",
    surface: "launcher",
    audience: "operator",
    title: "Operator workspace available",
    body: "Operators can review notifications and acknowledgements from the admin workspace.",
    href: "/admin",
    tone: "info",
    priority: 30,
    visibility: "visible",
    ackRequired: false,
    dismissible: false,
    lastUpdatedAt: nowIso(),
  },
];

const ackStatesByUser = new Map<string, PortalAnnouncementAckState[]>();

const isOperator = (session: PortalSessionSummary): boolean =>
  session.isLoggedIn &&
  session.entityType === "human" &&
  session.contractTier === "business" &&
  session.affiliations.includes("operator");

const audienceFits = (
  audience: "public" | "member" | "operator",
  session: PortalSessionSummary,
): boolean => {
  if (audience === "public") {
    return true;
  }
  if (audience === "member") {
    return session.isLoggedIn;
  }
  return isOperator(session);
};

const sortItems = (items: PortalNotificationCenterItem[]): PortalNotificationCenterItem[] =>
  [...items].sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return a.title.localeCompare(b.title);
  });

const requireUserKey = (session: PortalSessionSummary): string => {
  if (!session.isLoggedIn || !session.civilizationUserId) {
    throw new Error("A logged-in Civilization session is required.");
  }
  return session.civilizationUserId;
};

const getAckStates = (session: PortalSessionSummary): PortalAnnouncementAckState[] => {
  if (!session.isLoggedIn || !session.civilizationUserId) {
    return [];
  }
  return ackStatesByUser.get(session.civilizationUserId) || [];
};

export const getPublicNotificationCenter = (input: {
  surface: "home" | "launcher";
  session: PortalSessionSummary;
  limit: number;
}): {
  bannerItems: PortalNotificationCenterItem[];
  inboxItems: PortalNotificationCenterItem[];
  announcementItems: PortalNotificationCenterItem[];
  ackedItems: PortalAnnouncementAckState[];
} => {
  const ackedItems = getAckStates(input.session);
  const ackedSet = new Set(ackedItems.map((item) => item.code));

  const visible = notificationItems
    .filter((item) => item.visibility === "visible")
    .filter((item) => item.surface === input.surface)
    .filter((item) => audienceFits(item.audience, input.session));

  const bannerItems = sortItems(
    visible.filter((item) => item.channel === "banner"),
  ).slice(0, input.limit);

  const inboxItems = sortItems(
    visible.filter((item) => item.channel === "inbox"),
  ).slice(0, input.limit);

  const announcementItems = sortItems(
    visible.filter((item) => {
      if (item.channel !== "announcement") {
        return false;
      }
      if (!item.ackRequired) {
        return true;
      }
      return !ackedSet.has(item.code);
    }),
  ).slice(0, input.limit);

  return {
    bannerItems: clone(bannerItems),
    inboxItems: clone(inboxItems),
    announcementItems: clone(announcementItems),
    ackedItems: clone(ackedItems),
  };
};

export const ackAnnouncement = (
  session: PortalSessionSummary,
  input: {
    code: string;
    surface: "home" | "launcher";
  },
): PortalAnnouncementAckState => {
  const userKey = requireUserKey(session);

  const item = notificationItems.find(
    (notification) =>
      notification.code === input.code &&
      notification.surface === input.surface &&
      notification.channel === "announcement",
  );

  if (!item) {
    throw new Error("The requested announcement does not exist.");
  }

  const current = ackStatesByUser.get(userKey) || [];
  const existing = current.find((entry) => entry.code === input.code);

  if (existing) {
    return clone(existing);
  }

  const state: PortalAnnouncementAckState = {
    code: input.code,
    ackedAt: nowIso(),
  };

  ackStatesByUser.set(userKey, [state, ...current]);
  return clone(state);
};

export const listAdminNotificationCenter = (): PortalNotificationCenterItem[] =>
  clone(sortItems(notificationItems));

export const upsertNotificationCenterItem = (input: {
  code: string;
  channel: "banner" | "inbox" | "announcement";
  surface: "home" | "launcher";
  audience: "public" | "member" | "operator";
  title: string;
  body: string;
  href?: string;
  tone: "info" | "warning" | "success";
  priority: number;
  visibility: "visible" | "hidden";
  ackRequired: boolean;
  dismissible: boolean;
}): PortalNotificationCenterItem => {
  const index = notificationItems.findIndex((item) => item.code === input.code);

  const item: PortalNotificationCenterItem = {
    id: index >= 0 ? notificationItems[index].id : crypto.randomUUID(),
    code: input.code,
    channel: input.channel,
    surface: input.surface,
    audience: input.audience,
    title: input.title,
    body: input.body,
    href: input.href || undefined,
    tone: input.tone,
    priority: input.priority,
    visibility: input.visibility,
    ackRequired: input.ackRequired,
    dismissible: input.dismissible,
    lastUpdatedAt: nowIso(),
  };

  if (index >= 0) {
    notificationItems[index] = item;
  } else {
    notificationItems = [...notificationItems, item];
  }

  return clone(item);
};
