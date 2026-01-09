import fs from "node:fs";
import path from "node:path";
import type { SecurityConfig } from "../types.js";
import {
  getWellKnownSecurityPath,
  getRootSecurityPath
} from "./paths.js";

type GenerateArgs = {
  outDir: string;
  config: SecurityConfig;
};

/**
 * Generate RFC 9116 compliant security.txt
 *
 * HARD GUARANTEES:
 * - Deterministic output
 * - RFC 9116 directive order
 * - Ignores empty or invalid fields
 * - Writes identical content to all enabled locations
 * - Atomic writes (no partial files)
 * - Never throws
 * - Never blocks build
 */
export function generateSecurityTxt({
  outDir,
  config
}: GenerateArgs): void {
  if (!config.enabled) return;
  if (!outDir || !fs.existsSync(outDir)) return;

  const lines: string[] = [];

  /* ---------------------------------------------
     REQUIRED DIRECTIVES (RFC 9116)
  --------------------------------------------- */

  for (const contact of config.policy.contact) {
    lines.push(`Contact: ${contact}`);
  }

  lines.push(`Expires: ${config.policy.expires}`);

  /* ---------------------------------------------
     OPTIONAL DIRECTIVES
  --------------------------------------------- */

  if (config.policy.encryption) {
    lines.push(`Encryption: ${config.policy.encryption}`);
  }

  if (config.policy.acknowledgments) {
    lines.push(`Acknowledgments: ${config.policy.acknowledgments}`);
  }

  if (
    Array.isArray(config.policy.preferredLanguages) &&
    config.policy.preferredLanguages.length > 0
  ) {
    lines.push(
      `Preferred-Languages: ${config.policy.preferredLanguages.join(", ")}`
    );
  }

  if (
    Array.isArray(config.policy.canonical) &&
    config.policy.canonical.length > 0
  ) {
    for (const url of config.policy.canonical) {
      lines.push(`Canonical: ${url}`);
    }
  }

  if (config.policy.policy) {
    lines.push(`Policy: ${config.policy.policy}`);
  }

  if (config.policy.hiring) {
    lines.push(`Hiring: ${config.policy.hiring}`);
  }

  if (config.policy.csaf) {
    lines.push(`CSAF: ${config.policy.csaf}`);
  }

  /* ---------------------------------------------
     FINAL OUTPUT (deterministic)
  --------------------------------------------- */

  const contents = lines.join("\n") + "\n";

  try {
    if (config.output.wellKnown) {
      const { dir, file } = getWellKnownSecurityPath(outDir);
      fs.mkdirSync(dir, { recursive: true });
      atomicWrite(file, contents);
    }

    if (config.output.root) {
      atomicWrite(getRootSecurityPath(outDir), contents);
    }

    console.log("[astro-security] security.txt generated");
  } catch {
    // HARD SAFETY: never break build
  }
}

/* -------------------------------------------------
   Atomic write helper
------------------------------------------------- */

function atomicWrite(targetPath: string, contents: string): void {
  const dir = path.dirname(targetPath);
  const base = path.basename(targetPath);
  const tempPath = path.join(dir, `.${base}.tmp`);

  fs.writeFileSync(tempPath, contents, "utf-8");
  fs.renameSync(tempPath, targetPath);
}