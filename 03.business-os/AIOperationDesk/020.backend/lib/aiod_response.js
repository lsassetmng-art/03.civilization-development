export function ok(data = {}) {
  return {
    ok: true,
    data
  };
}

export function ng(code, message, details = {}) {
  return {
    ok: false,
    error: {
      code,
      message,
      details
    }
  };
}

export function requireFields(payload, fields) {
  const missing = fields.filter((field) => {
    return payload[field] === undefined || payload[field] === null || payload[field] === "";
  });

  if (missing.length > 0) {
    return ng("VALIDATION_MISSING_FIELDS", "Required fields are missing.", { missing });
  }

  return null;
}
