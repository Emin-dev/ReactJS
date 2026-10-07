# ReactJS · Developer portfolio

A customizable developer portfolio built with the Next.js Pages Router, React, TypeScript and Tailwind CSS. This repository is based on [smakosh/next-portfolio-dev](https://github.com/smakosh/next-portfolio-dev). The original design, contributor credits and illustrations remain attributed below.

## Status

This is a legacy template. Its locked Next.js 12 dependency is [outside the supported Next.js release lines](https://nextjs.org/support-policy). The repository privacy fix and regression tests do not make the entire dependency stack production-ready. Upgrade and validate the framework and dependencies before a new public deployment.

## Features

- Responsive portfolio sections, light/dark themes and SEO configuration
- Up to eight public repositories from the configured GitHub token owner, ordered by stars
- Incremental static regeneration with a ten-second revalidation interval
- Formspree contact form and Google reCAPTCHA integration
- Local privacy regression tests that use synthetic records and no live services

The project list is star-ranked; it is not a list of pinned repositories and does not change GitHub profile pins. Performance, accessibility and security scores depend on deployment and have not been certified here.

## Local setup

Use a maintained Node.js runtime with the built-in test runner (Node.js 22 is used in CI). This legacy lockfile uses pnpm 7.33.7, pinned in `package.json` to avoid accidental lockfile-format changes during the focused privacy repair. Modernizing the package manager belongs with the dependency migration.

```sh
npm install --global pnpm@7.33.7
pnpm install --frozen-lockfile
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

Edit `src/data/config.ts`, the SEO configuration and the section components with your own information. Configure your own analytics ID; the template value is not a recommendation to send visitors' data to someone else's account. Configure Formspree and reCAPTCHA with their providers before enabling the contact form. Local privacy tests do not submit forms or verify the production contact workflow.

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
GITHUB_TOKEN= NEXT_TELEMETRY_DISABLED=1 CIRCLE_NODE_TOTAL=3 pnpm build
```

`pnpm test` compiles the small TypeScript data boundary and uses Node's built-in test runner. The Axios adapter is replaced with synthetic responses, so tests do not contact GitHub or need credentials. Coverage includes public/private/internal records, missing and malformed privacy markers, output-field allowlisting, URL validation, serialization, malformed responses, sanitized request failures and credential-free builds. The generated `.test-build` directory is ignored.

`pnpm gen` regenerates the legacy GitHub schema types from the installed schema package. The portfolio display uses a deliberately narrower type instead of exposing the provider's complete repository type.

The GitHub Actions check runs tests, type checking, lint and a credential-free production build. It does not deploy, send form submissions or require application secrets. Successful checks establish this change's behavior, not the absence of all dependency vulnerabilities.

## Dependency modernization

Preserve the Pages Router and existing design while migrating in reviewable stages:

1. Inventory current production/development advisories and choose a currently supported Next.js release using primary release notes.
2. Upgrade Next.js, its ESLint integration and compatible React/TypeScript dependencies together; follow the intervening migration guides.
3. Update pnpm and regenerate its lockfile deliberately. Review all direct/transitive advisories, including Axios and the legacy code-generation tooling.
4. Re-run the privacy tests, type checking, lint and a credential-free build. Verify themes, navigation, mobile layout, SEO and the contact flow with provider-approved test configuration before deployment.

Do not use a blanket major-version force update or consider an old framework patch equivalent to current support.

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
