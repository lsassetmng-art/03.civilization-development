export type CivilizationLoginAccount = {
  loginId: string;
  password: string;
  civilizationId: string;
  displayName: string;
};

const systemAccount: CivilizationLoginAccount = {
  loginId: "system",
  password: "password",
  civilizationId: "00000000-0000-4000-8000-000000000001",
  displayName: "System Civilization"
};

function normalizeLoginId(value: string): string {
  return value.trim().toLowerCase();
}

export function resolveCivilizationLoginAccount(input: {
  loginIdentifier: string;
  password: string;
}): CivilizationLoginAccount | null {
  const loginId = normalizeLoginId(input.loginIdentifier);

  if (loginId !== systemAccount.loginId) {
    return null;
  }

  if (input.password !== systemAccount.password) {
    return null;
  }

  return systemAccount;
}

export function systemLoginId(): string {
  return systemAccount.loginId;
}

export function systemCivilizationId(): string {
  return systemAccount.civilizationId;
}

export function systemDisplayName(): string {
  return systemAccount.displayName;
}
