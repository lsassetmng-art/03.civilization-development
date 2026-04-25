import type { PortalSessionSummary } from "../../types/auth";
import type {
  PortalAdminArea,
  PortalAuditActionType,
  PortalAuditLogItem,
  PortalAuditStatus,
} from "../../types/portal-admin-security-api";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const nowIso = (): string => new Date().toISOString();

let auditItems: PortalAuditLogItem[] = [
  {
    id: "audit-seed-001",
    area: "portal-admin",
    actionType: "notice_publish",
    status: "accepted",
    actorDisplayName: "system",
    actorAffiliations: ["system"],
    targetCode: "portal",
    summary: "Portal admin audit tracking initialized.",
    createdAt: nowIso(),
  },
];

export const listAuditLogs = (
  area: PortalAdminArea,
  limit: number,
): PortalAuditLogItem[] =>
  clone(
    auditItems
      .filter((item) => item.area === area)
      .sort((a, b) => {
        if (a.createdAt < b.createdAt) return 1;
        if (a.createdAt > b.createdAt) return -1;
        return a.summary.localeCompare(b.summary);
      })
      .slice(0, limit),
  );

export const appendAuditLog = (input: {
  area: PortalAdminArea;
  actionType: PortalAuditActionType;
  status?: PortalAuditStatus;
  session: PortalSessionSummary;
  targetCode: string;
  summary: string;
}): PortalAuditLogItem => {
  const item: PortalAuditLogItem = {
    id: crypto.randomUUID(),
    area: input.area,
    actionType: input.actionType,
    status: input.status ?? "accepted",
    actorDisplayName: input.session.displayName || "unknown-actor",
    actorUserId: input.session.civilizationUserId,
    actorAffiliations: [...input.session.affiliations],
    targetCode: input.targetCode,
    summary: input.summary,
    createdAt: nowIso(),
  };

  auditItems = [item, ...auditItems];
  return clone(item);
};
