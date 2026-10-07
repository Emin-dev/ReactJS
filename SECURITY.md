# Security considerations

## Maintenance status

This repository is a legacy Next.js 12 portfolio template. Next.js 12 is outside the [supported release lines](https://nextjs.org/support-policy). The focused repository-privacy fix is not a complete security audit or a dependency-modernization claim. Migrate to supported dependencies and review current advisories before production deployment.

## Public repository metadata

Treat generated HTML, `__NEXT_DATA__`, Next.js page-data JSON and build artifacts as public. The GitHub query must remain restricted to public repositories. Retain the explicit `isPrivate === false` and `visibility === 'PUBLIC'` checks and field allowlist in `src/lib/github-repositories.ts`; UI-only filtering does not protect serialized page props.

Use least-privilege server-only credentials. Never use a private-access token for the portfolio, print provider response bodies, expose Axios errors with request headers, or add real private records to fixtures. Tests use synthetic data and an intercepted HTTP adapter.

## Existing deployments

A source fix does not remove old HTML/JSON or cached artifacts. Rebuild and invalidate affected cached output after adopting the fix. Repositories that change from public to private also require a cache review. ISR may keep the previous successful page when refresh fails. Rotate credentials through GitHub yourself if you suspect they were exposed; do not paste them into an issue or pull request.

## Reporting a concern

Prefer GitHub's private vulnerability reporting feature on this repository if it is available. Otherwise, open an issue asking the owner for a private reporting channel without including exploit details, tokens, private repository names, URLs, descriptions or personal data. There is no guaranteed response time or independent security certification.

For a reproducer, use fabricated repository records and non-working placeholder credentials. Include the affected commit, the expected privacy behavior and the smallest safe test case.
