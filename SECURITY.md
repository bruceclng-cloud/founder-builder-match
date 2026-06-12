# Security Policy

## Supported Versions

This project is pre-release. Security fixes apply to the current `main` branch.

## Reporting a Vulnerability

Open a private security advisory on GitHub if available. If that is not available yet, contact the maintainer directly before posting sensitive details publicly.

Do not include private founder, builder, payment, or identity data in public issues.

## Sensitive Areas

This project may eventually handle:

- founder project details
- builder resumes, profiles, and proof links
- payment-related metadata
- trial sprint artifacts
- dispute evidence
- proof-of-work records

These areas should be treated as privacy-sensitive even before the product has real users.

## MVP Security Boundaries

The current prototype does not process real payments, escrow, legal agreements, or private production user data.

Before adding production features, the project should define:

- data retention policy
- profile visibility rules
- artifact privacy rules
- dispute evidence access control
- payment provider threat model
- audit trail requirements

## Codex Security Use Case

If this project becomes eligible for Codex for Open Source support, useful security review targets include:

- matching logic fairness
- payment and fee workflows
- proof-of-work record integrity
- milestone dispute edge cases
- private artifact access control
- prompt or AI-assisted review boundaries
