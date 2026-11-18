import { isAxiosError } from "axios";

export interface FormError {
  fields: Record<string, string>;
  message: string | null;
}

export const NO_ERROR: FormError = { fields: {}, message: null };

// Turns a failed request into something a form can show.
// 400 -> per-field messages from the backend's @Valid handler.
// Anything else -> one message, chosen by status code, or the fallback.
export function parseError(
  err: unknown,
  byStatus: Record<number, string>,
  fallback: string,
): FormError {
  if (!isAxiosError(err)) return { fields: {}, message: fallback };

  if (!err.response) {
    return {
      fields: {},
      message: "Can’t reach the server. Check that the backend is running.",
    };
  }

  const { status, data } = err.response;
  if (status === 400 && data && typeof data === "object") {
    return { fields: data as Record<string, string>, message: null };
  }
  return { fields: {}, message: byStatus[status] ?? fallback };
}

// Short description of what the server actually replied, for debugging.
// e.g. "404: User not found with id: 5" or "404: Not Found (/transactions)"
export function serverDetail(err: unknown): string | null {
  if (!isAxiosError(err) || !err.response) return null;
  const { status, data } = err.response;
  if (typeof data === "string" && data) return `${status}: ${data}`;
  if (data && typeof data === "object") {
    const d = data as { error?: string; message?: string; path?: string };
    const text = d.message || d.error || "no message";
    return `${status}: ${text}${d.path ? ` (${d.path})` : ""}`;
  }
  return `${status}`;
}