export const AUTH_BRIDGE_QUERY_KEYS = {
  status: "status",
  mode: "mode",
  returnTarget: "return_target",
  requestedOsCode: "requested_os_code",
} as const;

export const AUTH_BRIDGE_ALLOWED_MODES = ["mock", "external_stub"] as const;

export const AUTH_BRIDGE_ALLOWED_RETURN_STATUSES = [
  "success",
  "error",
] as const;
