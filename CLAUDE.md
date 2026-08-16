# CLAUDE.md

Guidance for AI agents working in this repo. Read [README.md](README.md) first — it covers what this is and how to add a map. This file records what is not obvious from the code.

## What this repo is not

It is the landing page for [retroatlas.org](https://retroatlas.org/), and deliberately holds no shared viewer code. Each map is its own repo with its own extraction tooling and its own viewer, and they are at very different stages of maturity — extracting a common library before three or four of them exist would mean designing the interface around whichever one happens to be furthest along. When that extraction does happen it belongs in its own repo, and this one becomes a consumer of it like any map.

## Conventions

- The deployed site is `public/`, and the host serves that directory — repo artefacts (`README.md`, this file) then cannot ship by accident. `.github/workflows/static.yml` matches the sibling projects verbatim, action versions included.
- Dependency-free ES modules, no build step, no framework. The page must work when opened from a plain static server.
- `public/catalog.json` is the single source of truth. Adding, renaming or retiring a map is a catalog edit; if it ever requires touching `index.html`, the page has grown a hardcoded assumption that should go back into the data.
- Search matches every term against one flattened haystack per map, so a query like `playstation oddworld` narrows rather than widens. Keep new catalog fields in `haystack()` if they are worth searching.
- `/` focuses the search box and `Escape` clears it, matching the viewers this page links to.

## The social card

`public/og.png` is rendered from `tools/og.html`, which is repo-only and never deployed. Change the wordmark, tagline or palette on the page and the card has to be re-rendered to match, in one pass with the compression — a raw screenshot is half again the size, and every version of it stays in history:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size=1200,630 --screenshot=public/og.png tools/og.html
oxipng -o max --strip safe public/og.png
```

Keep it at 1200×630, and keep the `og:image:width` and `og:image:height` tags saying so — scrapers lay out the preview from those before the image itself arrives.

## Hosting

GitHub serves an org site from the repo named `<org>.github.io`, and every other repo in the org is then served as a path beneath that site's domain. So a map hosted here needs no DNS of its own and its `url` is a path, while a map on its own domain keeps one and is linked absolutely — the `hosting` field is what the page reads to tell those apart.

Custom-domain verification is per-org: verify `retroatlas.org` on the org **before** transferring a map repo in, because an unverified custom domain is the window in which someone else can claim it on their own Pages site.
