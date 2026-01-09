# astro-security

**RFC 9116–compliant `security.txt` generation for Astro sites**

`astro-security` is a static-first Astro integration that deterministically generates a valid
`security.txt` file at build time.

It exists to answer one simple question:

> How can security researchers reliably contact you about vulnerabilities?

No runtime JavaScript.  
No tracking.  
No magic defaults.  
No environment variables.

Just correct, auditable output.

---

## What this plugin does

On `astro build`, the plugin:

- Ensures a `security.config.json` file exists (first run only)
- Validates and normalises configuration (fail-closed)
- Generates an RFC 9116–compliant `security.txt`
- Writes the file to:
  - `/.well-known/security.txt`
  - `/security.txt`
- Overwrites existing files deterministically on each build

---

## What this plugin does NOT do

- ❌ No runtime middleware
- ❌ No signing or cryptography
- ❌ No HTTP headers
- ❌ No analytics or telemetry
- ❌ No automatic defaults that could publish incorrect data

If configuration is invalid or incomplete, **no file is generated**.

---

## Installation

```bash
npm install astro-security
```

---

## Usage

Add the integration to your Astro config:

```ts
// astro.config.mjs / astro.config.ts
import { defineConfig } from "astro/config";
import astroSecurity from "astro-security";

export default defineConfig({
  integrations: [
    astroSecurity()
  ]
});
```

---

## Configuration

On first run (npm run dev), the plugin creates a file in your project root:

```
security.config.json
```

This file is **never overwritten**.

### Example configuration

```json
{
  "enabled": true,
  "output": {
    "wellKnown": true,
    "root": true
  },
  "policy": {
    "contact": [
      "mailto:security@example.com"
    ],
    "expires": "2026-12-31T18:37:07.000Z",
    "preferredLanguages": ["en"],
    "canonical": [
      "https://example.com/.well-known/security.txt",
      "https://example.com/security.txt"
    ],
    "hiring": "https://example.com/careers/security"
  }
}
```

---

## Supported RFC 9116 directives

| Directive | Required | Notes |
|---------|---------|------|
| `Contact` | ✅ | One or more entries |
| `Expires` | ✅ | ISO 8601 timestamp |
| `Encryption` | ❌ | HTTPS only |
| `Acknowledgments` | ❌ | HTTPS only |
| `Preferred-Languages` | ❌ | RFC 5646 |
| `Canonical` | ❌ | May appear multiple times |
| `Policy` | ❌ | HTTPS only |
| `Hiring` | ❌ | HTTPS only |
| `CSAF` | ❌ | HTTPS only |

---

## Output example

Generated `/.well-known/security.txt`:

```
Contact: mailto:security@example.com
Expires: 2026-12-31T18:37:07.000Z
Preferred-Languages: en
Canonical: https://example.com/.well-known/security.txt
Canonical: https://example.com/security.txt
Hiring: https://example.com/careers/security
```

---

## Failure behaviour (important)

This plugin is **fail-closed** by design.

If any of the following occur:

- `security.config.json` is missing required fields
- JSON is invalid
- `contact` is empty
- `expires` is missing

➡️ **No `security.txt` file is written**

Your build will continue without error.

---

## Why this approach?

Many existing implementations:

- Generate invalid files
- Publish stale contact information
- Rely on runtime middleware
- Hide defaults users never reviewed

`astro-security` does the opposite.

Everything is:
- Explicit
- Deterministic
- Reviewable
- Static

---

## Roadmap (intentional omissions)

The following are **explicitly not implemented yet**:

- Digital signing (PGP / CMS)
- Automatic key generation
- HTTP header injection

These may be added in future **major versions only**.

---

## License

MIT © Velohost

---

## Contributing

Issues and PRs welcome.

Please note:
- All changes must preserve RFC 9116 compliance
- No runtime behaviour will be accepted
- No breaking changes outside major versions

## Author

Built and maintained by **Velohost**  
https://velohost.co.uk/

Project homepage:  
https://velohost.co.uk/plugins/astro-security/