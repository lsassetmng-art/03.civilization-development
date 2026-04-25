import type { PortalReturnContext } from "../../types/auth";

const RETURN_CONTEXT_KEY = "civilization.portal.return-context";

export const saveReturnContext = (context: PortalReturnContext): void => {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(RETURN_CONTEXT_KEY, JSON.stringify(context));
};

export const readReturnContext = (): PortalReturnContext | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(RETURN_CONTEXT_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PortalReturnContext;
  } catch {
    return null;
  }
};

export const clearReturnContext = (): void => {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(RETURN_CONTEXT_KEY);
};
