import type {
  PortalAuditActionType,
  PortalAuditLogItem,
} from "../../types/portal-admin-security-api";
import type { PortalSessionSummary } from "../../types/auth";

const nowIso = (): string => new Date().toISOString();
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

let auditItems: PortalAuditLogItem[] = [];

export const appendAuditLog = (input: {
  area: "portal-admin";
  actionType: PortalAuditActionType;
  session: PortalSessionSummary;
  targetCode: string;
  summary: string;
}): PortalAuditLogItem => {
  const actorType =
    input.session.isLoggedIn &&
    input.session.entityType === "human" &&
    input.session.contractTier === "business" &&
    input.session.affiliations.includes("operator")
      ? "operator"
      : input.session.isLoggedIn
      ? "member"
      : "guest";

  const item: PortalAuditLogItem = {
    id: crypto.randomUUID(),
    area: input.area,
    actionType: input.actionType,
    status: "accepted",
    actorDisplayName: input.session.displayName ?? "unknown",
    actorUserId: input.session.civilizationUserId,
    actorAffiliations: input.session.affiliations,
    targetCode: input.targetCode,
    summary: input.summary,
    createdAt: nowIso(),
  };

  auditItems = [item, ...auditItems].slice(0, 200);
  return clone(item);
};

export const listAuditLogs = (): PortalAuditLogItem[] => clone(auditItems);
