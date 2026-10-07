# ReactJS · Developer portfolio

A customizable developer portfolio built with the Next.js Pages Router, React, TypeScript and Tailwind CSS. This repository is based on [smakosh/next-portfolio-dev](https://github.com/smakosh/next-portfolio-dev). The original design, contributor credits and illustrations remain attributed below.

## Status

The portfolio uses Next.js 16 (the [Active LTS release line](https://nextjs.org/support-policy)), React 19, TypeScript 6, Tailwind CSS 4 and ESLint 10. It keeps the Pages Router, original sections, illustrations and public-repository privacy boundary. Deployment still requires owner-controlled service configuration and the checks below; a successful build is not a security certification.

## Features

- Responsive portfolio sections, light/dark themes and SEO configuration
- Up to eight public repositories from the configured GitHub token owner, ordered by stars
- Incremental static regeneration with a ten-second revalidation interval
- Formspree contact form and Google reCAPTCHA integration
- Local privacy regression tests that use synthetic records and no live services

The project list is star-ranked; it is not a list of pinned repositories and does not change GitHub profile pins. Performance, accessibility and security scores depend on deployment and have not been certified here.

## Local setup

Use Node.js 24 LTS (see `.nvmrc`) and pnpm 10.34.6. The package manager and all direct dependencies are pinned, and the pnpm 9-format lockfile is committed. Installation intentionally disables dependency lifecycle scripts; the checked build uses the platform packages distributed through npm.

```sh
npm install --global pnpm@10.34.6
pnpm install --frozen-lockfile --ignore-scripts
cp .env.development.local.template .env.development.local
pnpm dev
```

Open http://localhost:3040. A GitHub token is optional: leave it blank for a credential-free build with an empty projects section. Do not use real private repository records in fixtures, screenshots or debug logs.

### Configuration

| Variable | Purpose | Exposure |
| --- | --- | --- |
| `GITHUB_TOKEN` | Optional GitHub token used during static generation and revalidation | Server only; never add a `NEXT_PUBLIC_` prefix |
| `NEXT_PUBLIC_PORTFOLIO_URL` | Canonical URL for the portfolio | Public |
| `NEXT_PUBLIC_FORM` | Your Formspree form ID | Public |
| `NEXT_PUBLIC_PORTFOLIO_RECAPTCHA_KEY` | reCAPTCHA site key for your domain | Public; never put a secret key here |
| `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` | Optional analytics measurement ID | Public; unset disables analytics |

Edit `src/data/config.ts`, the SEO configuration and the section components with your own information. Analytics is disabled by default; use only your own measurement ID. Configure Formspree and reCAPTCHA with their providers before enabling the contact form. It is disabled when either public setting is missing. The CAPTCHA response is passed to Formspree, which must be configured to verify it server-side. Automated browser tests intercept all provider requests and never submit a live message or solve a real CAPTCHA; they cannot verify account-specific provider settings.

For local production builds, copy `.env.production.local.template` to `.env.production.local` and set the public configuration values as appropriate. Keep local environment files out of source control. When deploying, set server-side credentials only in the hosting provider's protected environment configuration.

### GitHub access and public output

Use a dedicated least-privilege token that can read public repository metadata. Do not grant private-repository access, broad classic `repo` scope or write access for this portfolio. Consult [GitHub's token guidance](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) for the token type and permissions appropriate to your account. The token owner determines which profile is queried.

`src/lib/github-repositories.ts` implements two independent safeguards:

1. The GraphQL query requests `privacy: PUBLIC` and includes `isPrivate` and `visibility`.
2. Before `getStaticProps` returns, only records with `isPrivate === false` and `visibility === 'PUBLIC'` are retained. Missing, null, malformed, private, internal or conflicting markers fail closed. New objects contain only the display fields; raw provider objects, tokens and error details never become page props.

Returned repository URLs are restricted to HTTPS GitHub repository URLs. Requests have a timeout, a response-size limit and no redirects. Missing credentials render an empty project list without making an API request. Network failures, GraphQL errors and malformed response envelopes throw a sanitized error rather than serializing partial provider data or credential-bearing Axios errors.

Static output is public and can be cached. This change does not erase older builds, CDN caches or previously published information. After applying the fix, owners of an existing deployment should rebuild and invalidate affected cached pages/JSON. If a formerly public repository becomes private, review and purge cached output; ISR can retain the last successful page after an upstream error and cannot guarantee immediate removal. No deployment or cache invalidation is performed by the code itself.

## Development and checks

```sh
pnpm test
pnpm typecheck
pnpm lint
# Credential-free verification; leave GITHUB_TOKEN empty in local env files too.
GITHUB_TOKEN= NEXT_TELEMETRY_DISABLED=1 pnpm build
pnpm check:build
pnpm audit --audit-level=low
pnpm exec playwright install chromium
pnpm test:browser
```

`pnpm test` compiles the small TypeScript data boundary and uses Node's built-in test runner. The Axios adapter is replaced with synthetic responses, so tests do not contact GitHub or need credentials. Coverage includes public/private/internal records, missing and malformed privacy markers, output-field allowlisting, URL validation, serialization, malformed responses, sanitized request failures and credential-free builds. The generated `.test-build` directory is ignored.

The unused full GitHub-schema generation pipeline was removed. The display DTO is defined and tested in `src/lib/github-repositories.ts`; it deliberately exposes only the allowlisted public fields. No application imports depended on the removed generated schema.

The GitHub Actions check runs tests, type checking, lint and a credential-free production build. It does not deploy, send form submissions or require application secrets. Successful checks establish this change's behavior, not the absence of all dependency vulnerabilities.

## Dependency maintenance

- Next.js and React were upgraded together. Removed `next/future/image` and nested legacy Link anchors; SEO uses the current Pages Router API. Production builds explicitly retain the supported Webpack path to keep this migration independent from a bundler change.
- Axios is updated; request timeouts, response limits, disabled redirects, error sanitization and the public-only serialization checks remain in place.
- The pnpm 7 lockfile was deliberately replaced with pnpm 10's lockfile format. Do not regenerate it with an unpinned package manager.
- TypeScript 6.0.3 is retained for compatibility with the current TypeScript ESLint API; TypeScript 7.0 does not provide that supported integration yet. ESLint 10 uses maintained TypeScript, React and Hooks flat configurations. The previous bundled Next lint configuration depended on EOL-incompatible React plugins and an unpatched `braces` path, so it was replaced rather than suppressing its warnings or audit findings.
- Tailwind 4 removes the old compiler's vulnerable dependency paths. Its configuration explicitly retains the original color palette and responsive container spacing; visual regression tests compare desktop/mobile light/dark views and the mobile menu with the pre-upgrade revision.
- Unused GraphQL code generation, the 19,000-line generated schema and nonfunctional legacy hook configuration were removed. Runtime content and template attribution remain intact.

Browser checks cover anchor navigation, Back/Forward, persisted theme changes, repeated mobile menu use, Escape dismissal, 404, required contact fields, CAPTCHA expiry, mocked success/error/retry and duplicate submission. Every external browser request is intercepted or blocked. Credential-free builds also assert empty repository HTML/JSON and absence of the server fetcher from browser bundles.

The migration workflow builds its fixed historical revision only as an isolated visual reference with no application credentials. Browser reports include baseline, current and difference images. Keep the baseline fixed during a dependency migration; review intentional design changes separately.

## Security

See [SECURITY.md](SECURITY.md) for scope, safe reporting and deployment precautions. Never open a public issue containing credentials or private repository metadata.

## Upstream attribution

- Template: [smakosh/next-portfolio-dev](https://github.com/smakosh/next-portfolio-dev)
- Original design: [Behance](https://www.behance.net/gallery/74172961/Free-Gatsby-portfolio-for-developers)
- Illustrations: [unDraw](https://undraw.co)
- Related Gatsby version: [smakosh/gatsby-portfolio-dev](https://github.com/smakosh/gatsby-portfolio-dev)

The original README described an MIT license, but this checkout does not contain the referenced `LICENSE.md`. Confirm applicable upstream terms before redistribution; this maintenance change does not invent or replace a license.

## Original contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://upleveled.io/"><img src="https://avatars.githubusercontent.com/u/61600906?v=4?s=100" width="100px;" alt=""/><br /><sub><b>José Fernando Höwer Barbosa</b></sub></a><br /><a href="https://github.com/smakosh/next-portfolio-dev/commits?author=Josehower" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/Elbarae1921"><img src="https://avatars.githubusercontent.com/u/44276243?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Elbarae Rguig</b></sub></a><br /><a href="https://github.com/smakosh/next-portfolio-dev/commits?author=Elbarae1921" title="Code">💻</a> <a href="https://github.com/smakosh/next-portfolio-dev/commits?author=Elbarae1921" title="Documentation">📖</a> <a href="https://github.com/smakosh/next-portfolio-dev/issues?q=author%3AElbarae1921" title="Bug reports">🐛</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
