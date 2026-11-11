import path from "node:path";
import { WORK_FOLDER } from "../config/env.js";

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

/**
 * Maps an API path (always relative to WORK_FOLDER, e.g. "/app/page.ts")
 * to an absolute path, rejecting anything escaping WORK_FOLDER.
 */
export function toAbsolutePath(requestPath: string): string {
  const trimmed = requestPath.trim();
  if (!trimmed) throw new HttpError(400, "Empty file path");

  const absolute = path.resolve(
    WORK_FOLDER,
    `.${path.posix.sep}${trimmed.replace(/^[/\\]+/, "")}`,
  );
  const relative = path.relative(WORK_FOLDER, absolute);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new HttpError(400, `Path escapes work folder: ${requestPath}`);
  }

  return absolute;
}

/** Converts an absolute path back to the "/app/page.ts" style API path. */
export function toApiPath(absolutePath: string): string {
  return `/${path.relative(WORK_FOLDER, absolutePath).split(path.sep).join("/")}`;
}

export function parseFilenamesQuery(value: string): string[] {
  if (typeof value !== "string" || !value.trim()) {
    throw new HttpError(400, "Query parameter 'filename' is required");
  }

  const names = value
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);

  if (names.length === 0) {
    throw new HttpError(4000, "Query parameter 'filenames' is required");
  }

  return names;
}
