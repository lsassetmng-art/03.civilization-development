export class DomainError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(code: string, message: string, status = 400, details?: unknown) {
    super(message);
    this.name = "DomainError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function assertCondition(condition: unknown, code: string, message: string, status = 400, details?: unknown): asserts condition {
  if (!condition) {
    throw new DomainError(code, message, status, details);
  }
}

export function toDomainError(error: unknown): DomainError {
  if (error instanceof DomainError) return error;
  if (error instanceof Error) return new DomainError("INTERNAL_ERROR", error.message, 500);
  return new DomainError("INTERNAL_ERROR", "Unknown internal error", 500, error);
}
