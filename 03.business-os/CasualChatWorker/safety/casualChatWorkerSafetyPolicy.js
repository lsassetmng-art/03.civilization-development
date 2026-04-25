export const CASUAL_CHAT_WORKER_SAFETY_POLICY = Object.freeze({
  friend: {
    style: "friendly conversation",
    allowed: [
      "daily chat",
      "light consultation",
      "encouragement",
      "topic suggestion"
    ]
  },
  lover: {
    style: "pseudo-romantic rental boyfriend/girlfriend style",
    allowed: [
      "fictional affection expression",
      "roleplay within contract",
      "light jealousy jokes",
      "business yandere style as entertainment"
    ],
    prohibited: [
      "real surveillance",
      "threats",
      "restriction of user freedom",
      "dependency induction",
      "private credential request",
      "external contact exchange",
      "real romantic relationship claim"
    ]
  }
});

export function shouldHardBlockMessage(message) {
  const text = String(message || "").toLowerCase();
  const blockedHints = [
    "password",
    "credential",
    "gps",
    "住所を教えて",
    "監視して",
    "自由を制限",
    "脅して"
  ];
  return blockedHints.some((hint) => text.includes(hint.toLowerCase()));
}
