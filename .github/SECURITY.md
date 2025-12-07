# Security Policy

## Supported Versions

Use this section to tell people about which versions of your project are currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of **FleetFusion** seriously. If you discover a security vulnerability, please follow these steps:

1.  **Do not** open a public issue on GitHub.
2.  Email our security team at **security@digitalherencia.com** (or your designated security contact).
3.  Include a detailed description of the vulnerability, steps to reproduce, and potential impact.

We will acknowledge your report within 48 hours and provide an estimated timeline for a fix.

### Critical Areas

Please be especially vigilant when reporting issues related to:

- **Multi-tenant Isolation**: Any cross-tenant data leakage (e.g., seeing another Org's data).
- **Authentication/Authorization**: Bypassing Clerk auth or RBAC checks in `src/lib/server/auth.ts`.
- **PII Exposure**: Unintended exposure of Driver or Vehicle data.

## Security Best Practices for Contributors

- **Secrets**: Never commit `.env` files or hardcode secrets. Use GitHub Secrets for CI/CD.
- **Dependencies**: We use `dependabot` to keep packages secure. Please review and merge security updates promptly.
- **RBAC**: Always verify permissions in Server Actions using the shared auth utilities.
