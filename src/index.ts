import type { AstroIntegration } from "astro";
import { ensureSecurityConfigFile } from "./config/writer.js";
import { loadSecurityConfig } from "./config/reader.js";
import { generateSecurityTxt } from "./build/generate.js";

/**
 * astro-security
 *
 * Astro integration for RFC 9116 security.txt support.
 *
 * Responsibilities:
 * - Ensure security.config.json exists (first run only)
 * - Load & normalise config (fail-closed)
 * - Generate security.txt files at build time
 *
 * HARD GUARANTEES:
 * - Never throws
 * - Never blocks build
 * - Never writes invalid RFC output
 * - Silent failure if misconfigured
 */
export default function astroSecurity(): AstroIntegration {
  return {
    name: "astro-security",

    hooks: {
      /**
       * Runs once Astro config is loaded.
       *
       * Safe place to:
       * - create config file
       * - perform non-fatal setup
       *
       * MUST NEVER throw.
       */
      "astro:config:setup"() {
        try {
          ensureSecurityConfigFile();
        } catch {
          // HARD FAIL-SAFE:
          // Never interrupt Astro config phase
        }
      },

      /**
       * Runs after build completes.
       *
       * Generates RFC 9116 security.txt files
       * based on resolved config.
       *
       * MUST NEVER throw.
       */
      "astro:build:done"({ dir }) {
        let config;

        try {
          config = loadSecurityConfig();
        } catch {
          // Invalid config → fail closed
          return;
        }

        if (!config || config.enabled !== true) {
          return;
        }

        try {
          generateSecurityTxt({
            outDir: new URL(dir).pathname,
            config
          });
        } catch {
          // HARD FAIL-SAFE:
          // Never break the build for security.txt
        }
      }
    }
  };
}