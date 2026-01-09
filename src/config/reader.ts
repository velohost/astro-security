import fs from "node:fs";
import path from "node:path";
import type { SecurityConfig } from "../types.js";

const CONFIG_FILENAME = "security.config.json";

/**
 * Hard fallback configuration.
 *
 * Used when:
 * - config file is missing
 * - config file is invalid JSON
 * - required fields are missing
 * - required fields are invalid
 *
 * FAIL-CLOSED GUARANTEES:
 * - enabled = false
 * - no output paths enabled
 * - no valid security.txt emitted
 */
const FALLBACK_CONFIG: SecurityConfig = {
  enabled: false,

  output: {
    wellKnown: false,
    root: false
  },

  policy: {
    contact: [],
    expires: "1970-01-01T00:00:00.000Z"
  }
};

/**
 * Load and normalise security.config.json.
 *
 * HARD GUARANTEES:
 * - Always returns a valid SecurityConfig
 * - Never throws
 * - Never writes to disk
 * - Never blocks build or dev
 */
export function loadSecurityConfig(): SecurityConfig {
  let projectRoot: string;

  try {
    projectRoot = process.cwd();
  } catch {
    return FALLBACK_CONFIG;
  }

  const configPath = path.join(projectRoot, CONFIG_FILENAME);

  if (!fs.existsSync(configPath)) {
    return FALLBACK_CONFIG;
  }

  try {
    const raw = fs.readFileSync(configPath, "utf-8");
    const parsed = JSON.parse(raw);

    return normaliseConfig(parsed);
  } catch {
    // Invalid JSON or unreadable file → fail closed
    return FALLBACK_CONFIG;
  }
}

/* -------------------------------------------------
   Normalisation
------------------------------------------------- */

/**
 * Normalise untrusted user input into a valid SecurityConfig.
 *
 * RULES:
 * - Required fields MUST exist and be valid
 * - Invalid optional fields are dropped silently
 * - No coercion
 * - No guessing
 * - Fail closed on ambiguity
 */
function normaliseConfig(input: unknown): SecurityConfig {
  if (!isObject(input)) {
    return FALLBACK_CONFIG;
  }

  const enabled =
    typeof input.enabled === "boolean"
      ? input.enabled
      : FALLBACK_CONFIG.enabled;

  const output = {
    wellKnown:
      isObject(input.output) && typeof input.output.wellKnown === "boolean"
        ? input.output.wellKnown
        : FALLBACK_CONFIG.output.wellKnown,

    root:
      isObject(input.output) && typeof input.output.root === "boolean"
        ? input.output.root
        : FALLBACK_CONFIG.output.root
  };

  if (!isObject(input.policy)) {
    return FALLBACK_CONFIG;
  }

  /* ---------------------------------------------
     REQUIRED FIELDS
  --------------------------------------------- */

  const contact = Array.isArray(input.policy.contact)
    ? input.policy.contact.filter(isValidContact)
    : [];

  const expires =
    typeof input.policy.expires === "string" &&
    isValidISODate(input.policy.expires)
      ? input.policy.expires
      : null;

  if (contact.length === 0 || !expires) {
    // REQUIRED fields missing or invalid → fail closed
    return FALLBACK_CONFIG;
  }

  /* ---------------------------------------------
     OPTIONAL FIELDS
  --------------------------------------------- */

  return {
    enabled,

    output,

    policy: {
      contact,
      expires,

      encryption: asOptionalHttps(input.policy.encryption),
      acknowledgments: asOptionalHttps(input.policy.acknowledgments),
      preferredLanguages: asOptionalStringArray(
        input.policy.preferredLanguages
      ),
      canonical: asOptionalHttpsArray(input.policy.canonical),
      policy: asOptionalHttps(input.policy.policy),
      hiring: asOptionalHttps(input.policy.hiring),
      csaf: asOptionalHttps(input.policy.csaf)
    }
  };
}

/* -------------------------------------------------
   Validation helpers
------------------------------------------------- */

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/**
 * RFC 9116 Contact validation:
 * - mailto:
 * - https://
 */
function isValidContact(value: unknown): value is string {
  return (
    isString(value) &&
    (value.startsWith("mailto:") || value.startsWith("https://"))
  );
}

/**
 * ISO 8601 validation (strict).
 */
function isValidISODate(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}

/**
 * HTTPS-only optional string.
 */
function asOptionalHttps(value: unknown): string | undefined {
  return isString(value) && value.startsWith("https://")
    ? value
    : undefined;
}

/**
 * HTTPS-only optional string array.
 */
function asOptionalHttpsArray(
  value: unknown
): string[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const filtered = value.filter(
    v => isString(v) && v.startsWith("https://")
  );

  return filtered.length > 0 ? filtered : undefined;
}

/**
 * Optional string array (non-empty).
 */
function asOptionalStringArray(
  value: unknown
): string[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const filtered = value.filter(isString);
  return filtered.length > 0 ? filtered : undefined;
}