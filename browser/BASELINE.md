# Visual baseline provenance

These PNGs are the original portfolio, not regenerated pictures of the upgraded app.

- Source revision: `dcfb2f89d51b16064a13141426db7be771776211`
- Capture: [GitHub Actions run 37704113021](https://github.com/Emin-dev/ReactJS/actions/runs/37704113021), 2026-10-07
- Browser: Playwright 1.64.0, Chromium 156.0.8078.4 (revision 1248), Linux
- Desktop: 1440 × 1000 viewport; mobile: 390 × 844 viewport; full-page screenshots
- Light theme explicitly selected in local storage; dark theme reached through the UI
- Application GitHub token empty; public provider settings synthetic; every external browser request blocked
- Original Next 12 build ran only in the isolated capture job. Normal CI does not install or execute it.

## Known original defect

The original toggle starts in system mode but compares the unresolved theme string with light, so its first click may remain light. Visual capture normalizes the starting state to light; it does not claim the old behavior was correct. Separate current-app tests verify first-click toggling from system light and system dark, persistence after reload, and repeated navigation.

## Integrity

| File | SHA-256 |
| --- | --- |
| desktop-dark.png | `14d11a037281b9045a27b5e49415fa7959ad49f546ec80f4398167764cebfc94` |
| desktop-light.png | `1d2d1bc45271dc71fe28556c1fcc7a91fa82916c9f3e9d36b15101299a622844` |
| mobile-dark.png | `36e3e20ffcad70ec119fdb1042d1c8cb18a3ed3f44ef15d3da0c8d24b3bb55fd` |
| mobile-light.png | `60c1452ed24f544c670886125de21f8fa4d689641eeeb8e00873a7d79e9c6c12` |
| mobile-menu.png | `1f05296244357fe23b9cccd0e5bea225a564650afc8eacfa0e3b35d95d1ec03f` |
