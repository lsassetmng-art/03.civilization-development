const queryKeys = ["aerial_access_token", "aerialAccessToken"] as const;
const storageKeys = ["AerialAccessToken", "aerial_access_token"] as const;

function isTruthyToken(value: string | null | undefined): value is string {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized !== "" && normalized !== "0" && normalized !== "false" && normalized !== "none" && normalized !== "null";
}

export function hasAerialAccessTokenFromSearch(search: string): boolean {
  const params = new URLSearchParams(search);
  return queryKeys.some((key) => isTruthyToken(params.get(key)));
}

export function hasAerialAccessTokenFromStorage(): boolean {
  return storageKeys.some((key) => {
    try {
      return isTruthyToken(window.localStorage.getItem(key)) || isTruthyToken(window.sessionStorage.getItem(key));
    } catch {
      return false;
    }
  });
}

export function hasAerialAccessTokenClient(search: string): boolean {
  return hasAerialAccessTokenFromSearch(search) || hasAerialAccessTokenFromStorage();
}

export function appendAerialAccessTokenSignal(params: URLSearchParams, search: string): void {
  const source = new URLSearchParams(search);

  for (const key of queryKeys) {
    const value = source.get(key);
    if (isTruthyToken(value)) {
      params.set(key, value);
      return;
    }
  }
}
