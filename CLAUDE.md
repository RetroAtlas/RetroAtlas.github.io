# CLAUDE.md

Guidance for AI agents working in this repo. Read [README.md](README.md) first — it covers what this is and how to add a map. This file records what is not obvious from the code.

## What this repo is not

It is the landing page for [retroatlas.org](https://retroatlas.org/), and deliberately holds no shared viewer code. Each map is its own repo with its own extraction tooling and its own viewer, and they are at very different stages of maturity — extracting a common library before three or four of them exist would mean designing the interface around whichever one happens to be furthest along. When that extraction does happen it belongs in its own repo, and this one becomes a consumer of it like any map.

## Conventions

- The deployed site is `public/`, and the host serves that directory — repo artefacts (`README.md`, this file) then cannot ship by accident. The Pages deploy is a job in [.github/workflows/ci.yml](.github/workflows/ci.yml), copied from OddworldMap's with its action versions. A check belongs in the same file and in the deploy's `needs`; one in a workflow of its own would gate nothing.
- Dependency-free ES modules, no build step, no framework. The page must work when opened from a plain static server.
- `public/catalog.json` is the single source of truth. Adding, renaming or retiring a map is a catalog edit; if it ever requires touching `index.html`, the page has grown a hardcoded assumption that should go back into the data.
- Search matches every term against one flattened haystack per map, so a query like `playstation oddworld` narrows rather than widens. Keep new catalog fields in `haystack()` if they are worth searching.
- `/` focuses the search box and `Escape` clears it, matching the viewers this page links to.
- The contact address is never written out under `public/`: `main.js` joins it from its parts at runtime, out of reach of scrapers that read the source. Anything else on the page that needs it builds it the same way.

## The social card

`public/og.png` is rendered from `tools/og.html`, which is repo-only and never deployed. Change the wordmark, tagline or palette on the page and the card has to be re-rendered to match, in one pass with the compression — a raw screenshot is half again the size, and every version of it stays in history:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size=1200,630 --screenshot=public/og.png tools/og.html
oxipng -o max --strip safe public/og.png
```

Keep it at 1200×630, and keep the `og:image:width` and `og:image:height` tags saying so — scrapers lay out the preview from those before the image itself arrives.

## Platform banners

`tools/banners/` holds the profile banners, rendered from `tools/banner.html` by `tools/banners.sh`. The template is sized in `vh`/`vw` rather than pixels, so one page renders every platform — adding a size is a line in the `sizes` list in the script, not a new file:

```bash
./tools/banners.sh
```

Every platform crops a banner differently and none of them tell you where, so the lockup stays centred and compact rather than filling the canvas. YouTube crops hardest — a 2048×1152 upload is shown as a 1546×423 band on TV and desktop, and anything outside that is only ever seen on the channel page.

Like the card, these are repo-only and never deployed; nothing under `tools/` ships.

## Hosting

Every map gets a subdomain of its own — `metalslug.retroatlas.org`, not `retroatlas.org/MetalSlugMap/`. A site served under a path has to thread that prefix through every asset URL and deep link it builds, and a tile-heavy viewer builds a lot of both; served at a root it does not. The repo name and the subdomain are independent, since the `CNAME` file in the deployed directory is what decides the URL, so a repo never has to be renamed to change one.

Per map that is a `CNAME` record pointing the subdomain at `retroatlas.github.io` — the org site, never the repo — plus the custom domain set in that repo's Pages settings. Add the record **unproxied**: behind Cloudflare's proxy GitHub cannot see the target, so it never issues the certificate and Enforce HTTPS stays greyed out. Turn the proxy back on afterwards if you want it, with SSL mode Full (strict), or the site will redirect in a loop. Never a wildcard record — `*.retroatlas.org` reopens the takeover hole on a domain that is otherwise closed.

Verifying `retroatlas.org` on the org covers its immediate subdomains too, so one verification protects every map. Do it **before** transferring a map repo in, because an unverified custom domain is the window in which someone else can claim it on their own Pages site.
