type ReturnContext = {
  returnTarget: string;
  requestedOsCode?: string;
  requestTimestamp: string;
};

const STORAGE_KEY = "civilization.portal.return-context";

export const saveReturnContext = (value: ReturnContext): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
};

export const getReturnContext = (): ReturnContext | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as ReturnContext;
  } catch {
    return null;
  }
};

export const readReturnContext = (): ReturnContext | null => {
  return getReturnContext();
};

export const clearReturnContext = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
};
