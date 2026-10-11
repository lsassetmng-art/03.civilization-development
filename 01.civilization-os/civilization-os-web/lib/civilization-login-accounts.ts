export type CivilizationLoginAccountMetadata = {
  loginId: string;
  displayName: string;
};

const testAccountMetadata: CivilizationLoginAccountMetadata = {
  loginId: "test",
  displayName: "CivilizationOS Test User"
};

export function testLoginId(): string {
  return testAccountMetadata.loginId;
}

export function testLoginDisplayName(): string {
  return testAccountMetadata.displayName;
}
