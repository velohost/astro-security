# astro-security

**RFC 9116–compliant `security.txt` generation for Astro sites**

`astro-security` is a static-first Astro integration that deterministically generates a valid
`security.txt` file at build time.

From **v1.0.0 onward**, configuration is stored in a dedicated project directory with **automatic migration** from legacy locations.

---

## What this plugin does

On `astro build`, the plugin:

- Ensures a security configuration file exists (first run only)
- Automatically migrates legacy configs (v0.x → v1.x)
- Validates and normalises configuration (fail-closed)
- Generates an RFC 9116–compliant `security.txt`
- Writes the file to:
  - `/.well-known/security.txt`
  - `/security.txt`
- Overwrites existing output files deterministically on each build

---

## What this plugin does NOT do

- ❌ No runtime middleware
- ❌ No signing or cryptography
- ❌ No HTTP headers
- ❌ No analytics or telemetry
- ❌ No hidden defaults

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
import { defineConfig } from "astro/config";
import astroSecurity from "astro-security";

export default defineConfig({
  integrations: [astroSecurity()]
});
```

---

## Configuration (v1.0.0)

### Canonical location

From **v1.0.0**, the configuration file lives at:

```
config-files/security.config.json
```

### Automatic migration

If you already have:

```
security.config.json
```

in your project root (v0.x), the plugin will **automatically move it** to:

```
config-files/security.config.json
```

This migration:
- Happens once
- Never overwrites an existing new config
- Never blocks build or dev

---

### Example configuration

```json
{
  "enabled": true,
  "output": {
    "wellKnown": true,
    "root": true
  },
  "policy": {
    "contact": ["mailto:security@example.com"],
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
| Contact | ✅ | One or more entries |
| Expires | ✅ | ISO 8601 timestamp |
| Encryption | ❌ | HTTPS only |
| Acknowledgments | ❌ | HTTPS only |
| Preferred-Languages | ❌ | RFC 5646 |
| Canonical | ❌ | May appear multiple times |
| Policy | ❌ | HTTPS only |
| Hiring | ❌ | HTTPS only |
| CSAF | ❌ | HTTPS only |

---

## Output example

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

This plugin is **fail-closed**.

If:
- required fields are missing
- JSON is invalid
- config is disabled

➡️ **No `security.txt` is written**

Your build continues safely.

---

## Versioning policy

- **v1.0.0** establishes:
  - Stable config schema
  - Stable file locations
  - Automatic migration
- Breaking changes will only occur in **major versions**

---

## License

MIT © Velohost

---

## Author

Built and maintained by **Velohost**  
https://velohost.co.uk/

Plugin page:  
https://velohost.co.uk/plugins/astro-security/
