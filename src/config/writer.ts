import fs from "node:fs";
import path from "node:path";
import type { SecurityConfig } from "../types.js";
import {
  CONFIG_DIR,
  CONFIG_FILENAME,
  NEW_CONFIG_PATH,
  LEGACY_CONFIG_PATH
} from "./paths.js";

/**
 * Default security configuration.
 *
 * IMPORTANT PRINCIPLES:
 * - Fully explicit (no hidden defaults)
 * - RFC 9116 compliant
 * - Safe placeholders
 * - Open-source friendly
 * - Never overwritten once created
 *
 * NOTE:
 * This file is written ONLY on first run.
 * Future changes must be made by the user.
 */
const DEFAULT_CONFIG: SecurityConfig = {
  enabled: true,

  output: {
    wellKnown: true,
    root: true
  },

  policy: {
    contact: ["mailto:security@example.com"],
    expires: "2026-12-31T18:37:07.000Z",

    encryption: "https://example.com/.well-known/pgp-key.txt",
    acknowledgments: "https://example.com/security/thanks",
    preferredLanguages: ["en"],
    canonical: [
      "https://example.com/.well-known/security.txt",
      "https://example.com/security.txt"
    ],
    policy: "https://example.com/security",
    hiring: "https://example.com/careers/security",
    csaf: "https://example.com/.well-known/csaf/provider-metadata.json"
  }
};

/**
 * Ensure security.config.json exists in canonical location.
 *
 * MIGRATION BEHAVIOUR:
 * - If legacy config exists → move it to config-files/
 * - If new config already exists → do nothing
 * - If neither exists → create default config
 *
 * HARD GUARANTEES:
 * - Never overwrite
 * - Never throw
 * - Never block build or dev
 */
export function ensureSecurityConfigFile(): void {
  try {
    // Ensure config directory exists
    fs.mkdirSync(CONFIG_DIR, { recursive: true });

    // Case 1: Canonical config already exists → do nothing
    if (fs.existsSync(NEW_CONFIG_PATH)) {
      return;
    }

    // Case 2: Legacy root config exists → migrate
    if (fs.existsSync(LEGACY_CONFIG_PATH)) {
      fs.renameSync(LEGACY_CONFIG_PATH, NEW_CONFIG_PATH);

      console.log(
        "[astro-security] migrated security.config.json to config-files/"
      );
      return;
    }

    // Case 3: No config exists → create default
    fs.writeFileSync(
      NEW_CONFIG_PATH,
      JSON.stringify(DEFAULT_CONFIG, null, 2),
      {
        encoding: "utf-8",
        flag: "wx"
      }
    );

    console.log(
      "[astro-security] created config-files/security.config.json — edit this file to publish security.txt"
    );
  } catch {
    // HARD FAIL-SAFE:
    // security.txt must NEVER stop a build
  }
}