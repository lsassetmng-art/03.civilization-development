export function classifyProviderResult(result = {}) {
  const status = result.delivery_status || "failed";
  const errorCode = result.provider_error_code || null;

  if (status === "sent") {
    return {
      retryable: false,
      retry_after_seconds: null,
      retry_reason: null
    };
  }

  if (status === "cancelled") {
    return {
      retryable: false,
      retry_after_seconds: null,
      retry_reason: "provider_cancelled"
    };
  }

  if (status === "pending") {
    return {
      retryable: true,
      retry_after_seconds: 60,
      retry_reason: "provider_pending"
    };
  }

  if (errorCode === "NOT_IMPLEMENTED") {
    return {
      retryable: false,
      retry_after_seconds: null,
      retry_reason: "provider_not_implemented"
    };
  }

  if (errorCode === "UNSUPPORTED_PROVIDER_MODE") {
    return {
      retryable: false,
      retry_after_seconds: null,
      retry_reason: "unsupported_provider_mode"
    };
  }

  return {
    retryable: true,
    retry_after_seconds: 300,
    retry_reason: "provider_failed_generic"
  };
}
