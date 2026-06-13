# Security Policy

## Supported versions

RouteWise is pre-release software. Security fixes are applied only to the
current `main` branch until versioned releases begin.

## Reporting a vulnerability

Do not open a public issue containing exploit details, credentials, personal
data, or proprietary store-layout data. Report the issue privately to the
repository owner with:

- Affected component and version or commit
- Reproduction steps
- Potential impact
- Any suggested mitigation

The repository owner should acknowledge the report, assess severity, document
the remediation, and disclose the issue only after a fix is available.

## Current security boundaries

The current application:

- Uses synthetic store and cart data.
- Processes no authentication credentials or personal data.
- Makes no retailer API calls.
- Stores no user location history.

A production deployment must add input validation, authorization, dependency
monitoring, secret management, and privacy controls before handling retailer or
user data.
