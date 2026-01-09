import path from "node:path";

/**
 * Canonical configuration paths for astro-security
 *
 * SINGLE SOURCE OF TRUTH
 */
export const CONFIG_DIR = path.join(process.cwd(), "config-files");

export const CONFIG_FILENAME = "security.config.json";

export const NEW_CONFIG_PATH = path.join(
  CONFIG_DIR,
  CONFIG_FILENAME
);

export const LEGACY_CONFIG_PATH = path.join(
  process.cwd(),
  CONFIG_FILENAME
);