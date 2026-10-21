export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "VALIDATION_FAILED"
  | "SERVICE_UNAVAILABLE"
  | "NETWORK_ERROR"
  | "UNKNOWN";

/** Error thrown by the Infrastructure API client. `details.serverCode` carries the API's own machine code (`infra_domain_exists`, ...). */
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly fieldErrors: Record<string, string> | undefined;
  readonly reason: string | undefined;
  readonly details: Record<string, unknown> | undefined;

  constructor(params: { code: ApiErrorCode; message: string; status?: number; fieldErrors?: Record<string, string>; reason?: string; details?: Record<string, unknown> }) {
    super(params.message);
    this.name = "ApiError";
    this.code = params.code;
    this.status = params.status ?? 500;
    this.fieldErrors = params.fieldErrors;
    this.reason = params.reason;
    this.details = params.details;
  }

  detail<T>(key: string): T | undefined {
    return this.details?.[key] as T | undefined;
  }

  static isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
  }

  get isAuthError(): boolean {
    return this.code === "UNAUTHORIZED" || this.code === "FORBIDDEN";
  }
}
