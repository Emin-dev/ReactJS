# Security considerations

## Maintenance status

This portfolio uses the supported Next.js 16 release line and current React, Axios and ESLint dependencies, with TypeScript 6 for tooling compatibility. Lockfile audits, synthetic privacy tests, production-output checks and browser regressions run in CI. Review current advisories before each deployment; passing checks is not a complete security audit or a guarantee against unknown vulnerabilities.

Dependency install scripts are disabled. The obsolete code-generation pipeline is removed. The unpatched legacy `braces` path is avoided by replacing the old CSS compiler and bundled ESLint dependency tree, not by ignoring its advisory.

## Public repository metadata

Treat generated HTML, `__NEXT_DATA__`, Next.js page-data JSON and build artifacts as public. The GitHub query must remain restricted to public repositories. Retain the explicit `isPrivate === false` and `visibility === 'PUBLIC'` checks and field allowlist in `src/lib/github-repositories.ts`; UI-only filtering does not protect serialized page props.

Use least-privilege server-only credentials. Never use a private-access token for the portfolio, print provider response bodies, expose Axios errors with request headers, or add real private records to fixtures. Tests use synthetic data and an intercepted HTTP adapter. Browser tests block or mock every external request, including analytics, Formspree and reCAPTCHA. Never enable real provider credentials in these tests.

The contact form requires both provider settings. Client validation is only a usability safeguard: configure Formspree to verify the submitted CAPTCHA response server-side. Analytics is opt-in through an owner-controlled public measurement ID.

## Existing deployments

A source fix does not remove old HTML/JSON or cached artifacts. Rebuild and invalidate affected cached output after adopting the fix. Repositories that change from public to private also require a cache review. ISR may keep the previous successful page when refresh fails. Rotate credentials through GitHub yourself if you suspect they were exposed; do not paste them into an issue or pull request.

## Reporting a concern

Prefer GitHub's private vulnerability reporting feature on this repository if it is available. Otherwise, open an issue asking the owner for a private reporting channel without including exploit details, tokens, private repository names, URLs, descriptions or personal data. There is no guaranteed response time or independent security certification.

For a reproducer, use fabricated repository records and non-working placeholder credentials. Include the affected commit, the expected privacy behavior and the smallest safe test case.
