/**
 * astro-security
 *
 * Configuration contract for RFC 9116 security.txt generation.
 *
 * This file is the SINGLE source of truth.
 *
 * HARD RULES:
 * - writer.ts MUST conform to this type
 * - reader.ts MUST conform to this type
 * - build logic MUST emit ONLY fields defined here
 * - No undocumented fields allowed
 * - RFC 9116 compliant
 *
 * Reference:
 * https://www.rfc-editor.org/rfc/rfc9116
 */

export type SecurityConfig = {
  /**
   * Master enable switch.
   *
   * If false:
   * - No files are written
   * - No validation errors are thrown
   */
  enabled: boolean;

  /**
   * Output locations for generated security.txt
   */
  output: {
    /**
     * Write to:
     * /.well-known/security.txt
     *
     * REQUIRED by RFC 9116
     */
    wellKnown: boolean;

    /**
     * Write to:
     * /security.txt
     *
     * OPTIONAL but recommended for compatibility
     */
    root: boolean;
  };

  /**
   * RFC 9116 directives.
   *
   * IMPORTANT:
   * - Field names map 1:1 to directive names
   * - Emission order is handled elsewhere
   */
  policy: {
    /**
     * REQUIRED
     *
     * Contact methods for reporting security issues.
     *
     * Rules:
     * - At least ONE value required
     * - Each entry MUST begin with:
     *   - "mailto:" OR
     *   - "https://"
     *
     * RFC:
     * Contact: <URI>
     * (directive may appear multiple times)
     */
    contact: string[];

    /**
     * REQUIRED
     *
     * Expiry timestamp for this file.
     *
     * Rules:
     * - MUST be valid ISO 8601 date-time
     * - MUST be UTC (Z suffix)
     * - MUST be a future date
     *
     * RFC:
     * Expires: <ISO 8601 datetime>
     *
     * ONLY ONE allowed.
     */
    expires: string;

    /**
     * OPTIONAL
     *
     * Encryption key for secure communication.
     *
     * Rules:
     * - MUST be HTTPS
     *
     * RFC:
     * Encryption: <URI>
     *
     * ONLY ONE allowed.
     */
    encryption?: string;

    /**
     * OPTIONAL
     *
     * Acknowledgement page for security researchers.
     *
     * Rules:
     * - MUST be HTTPS
     *
     * RFC:
     * Acknowledgments: <URI>
     *
     * ONLY ONE allowed.
     */
    acknowledgments?: string;

    /**
     * OPTIONAL
     *
     * Supported languages for security communication.
     *
     * Rules:
     * - Array is comma-joined when emitted
     * - Language tags MUST follow RFC 5646
     *
     * RFC:
     * Preferred-Languages: en, en-GB
     *
     * ONLY ONE directive allowed.
     */
    preferredLanguages?: string[];

    /**
     * OPTIONAL
     *
     * Canonical locations of security.txt.
     *
     * Rules:
     * - MUST be HTTPS
     * - SHOULD include all served locations
     *
     * RFC:
     * Canonical: <URI>
     * (directive MAY appear multiple times)
     */
    canonical?: string[];

    /**
     * OPTIONAL
     *
     * Vulnerability disclosure policy URL.
     *
     * Rules:
     * - MUST be HTTPS
     *
     * RFC:
     * Policy: <URI>
     *
     * ONLY ONE allowed.
     */
    policy?: string;

    /**
     * OPTIONAL
     *
     * Security-related job openings.
     *
     * Rules:
     * - MUST be HTTPS
     *
     * RFC:
     * Hiring: <URI>
     *
     * ONLY ONE allowed.
     */
    hiring?: string;

    /**
     * OPTIONAL
     *
     * CSAF provider metadata.
     *
     * Rules:
     * - MUST be HTTPS
     *
     * RFC:
     * CSAF: <URI>
     *
     * ONLY ONE allowed.
     */
    csaf?: string;
  };
};