export function redactSecrets(input = {}) {
  const copy = { ...input };

  const secretKeys = [
    "AIOD_LINE_CHANNEL_ACCESS_TOKEN",
    "AIOD_LINE_CHANNEL_SECRET",
    "AIOD_NOTIFICATION_SIGNING_KEY",
    "authorization",
    "Authorization",
    "token",
    "secret"
  ];

  Object.keys(copy).forEach((key) => {
    if (secretKeys.includes(key)) {
      copy[key] = "[REDACTED]";
    }
  });

  return copy;
}

export function buildSafeProviderMeta(input = {}) {
  return redactSecrets({
    provider_mode: input.provider_mode || null,
    endpoint_present: !!input.endpoint,
    destination_type: input.destination_type || null,
    destination_ref_present: !!input.destination_ref,
    title_present: !!input.title,
    body_present: !!input.body
  });
}
