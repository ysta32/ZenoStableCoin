# Security Policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| 1.x     | Yes       |
| < 1.0   | No        |

## What Zeno is (and is not)

Zeno is a demo front-end app. It uses simulated funds only. It never holds real funds or private keys, never connects to mainnet, and never moves real money. Please keep this in mind when judging the severity of a finding.

## Reporting a vulnerability

Please do not open a public issue for security problems.

1. Go to the repository's **Security** tab and choose **Report a vulnerability** (GitHub private vulnerability reporting), or open a draft from the **Security Advisories** tab.
2. Describe the issue, the affected version or commit, and steps to reproduce.
3. Include a proof of concept or screenshots if you have them.

We aim to acknowledge reports within 72 hours and will keep you updated as we investigate and fix the issue.

## Scope

In scope:

- Cross-site scripting, injection, or unsafe handling of user input in the app
- Vulnerabilities in the build, deployment configuration, or CI workflows
- Vulnerable or malicious dependencies that affect the app
- Secrets accidentally committed to the repository

Out of scope:

- Loss of simulated funds or balances, since they have no real value
- Issues that require a compromised device or browser
- Denial-of-service through volumetric traffic
- Findings in third-party services we do not control
- Social engineering of maintainers or contributors
