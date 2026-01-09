import path from "node:path";

/**
 * Canonical build output paths for astro-security
 *
 * This file is the SINGLE source of truth.
 * All build writers MUST import from here.
 */

export const WELL_KNOWN_DIRNAME = ".well-known";

export const SECURITY_FILENAME = "security.txt";

/**
 * Resolve /.well-known/security.txt
 */
export function getWellKnownSecurityPath(outDir: string): {
  dir: string;
  file: string;
} {
  const dir = path.join(outDir, WELL_KNOWN_DIRNAME);
  return {
    dir,
    file: path.join(dir, SECURITY_FILENAME)
  };
}

/**
 * Resolve /security.txt
 */
export function getRootSecurityPath(outDir: string): string {
  return path.join(outDir, SECURITY_FILENAME);
}