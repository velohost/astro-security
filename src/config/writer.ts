import fs from "node:fs";
import path from "node:path";
import type { SecurityConfig } from "../types.js";

const CONFIG_FILENAME = "security.config.json";

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
    /**
     * REQUIRED
     * One or more contact methods.
     *
     * Valid formats:
     * - "mailto:security@example.com"
     * - "https://example.com/security"
     */
    contact: [
      "mailto:security@example.com"
    ],

    /**
     * REQUIRED
     * Expiry date in ISO 8601 format.
     *
     * IMPORTANT:
     * This must be updated periodically.
     * Expired files should not be trusted.
     */
    expires: "2026-12-31T18:37:07.000Z",

    /**
     * OPTIONAL
     * HTTPS URL to an encryption key (PGP, etc).
     */
    encryption: "https://example.com/.well-known/pgp-key.txt",

    /**
     * OPTIONAL
     * HTTPS URL acknowledging security researchers.
     */
    acknowledgments: "https://example.com/security/thanks",

    /**
     * OPTIONAL (single directive)
     * RFC 5646 language codes.
     * Example: ["en", "en-GB"]
     */
    preferredLanguages: ["en"],

    /**
     * OPTIONAL
     * Canonical URLs where security.txt is hosted.
     * Required if the file is digitally signed.
     */
    canonical: [
      "https://example.com/.well-known/security.txt",
      "https://example.com/security.txt"
    ],

    /**
     * OPTIONAL
     * Vulnerability disclosure policy.
     * Must be HTTPS.
     */
    policy: "https://example.com/security",

    /**
     * OPTIONAL
     * Security-related hiring page.
     * Must be HTTPS.
     */
    hiring: "https://example.com/careers/security",

    /**
     * OPTIONAL
     * CSAF provider metadata.
     * Must be HTTPS.
     */
    csaf: "https://example.com/.well-known/csaf/provider-metadata.json"
  }
};

/**
 * Ensure security.config.json exists in project root.
 *
 * HARD GUARANTEES:
 * - Create only if missing
 * - Never overwrite
 * - Never throw
 * - Never block dev or build
 */
export function ensureSecurityConfigFile(): void {
  let projectRoot: string;

  try {
    projectRoot = process.cwd();
  } catch {
    // Extremely defensive: cwd should always exist
    return;
  }

  const configPath = path.join(projectRoot, CONFIG_FILENAME);

  // Never overwrite an existing file
  if (fs.existsSync(configPath)) {
    return;
  }

  try {
    fs.writeFileSync(
      configPath,
      JSON.stringify(DEFAULT_CONFIG, null, 2),
      {
        encoding: "utf-8",
        flag: "wx"
      }
    );

    console.log(
      `[astro-security] created ${CONFIG_FILENAME} — edit this file to publish security.txt`
    );
  } catch {
    // HARD FAIL-SAFE:
    // Configuration creation must NEVER stop a build
  }
}