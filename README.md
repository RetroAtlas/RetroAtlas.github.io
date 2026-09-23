# RetroAtlas

The front door for [retroatlas.org](https://retroatlas.org/) — a card index of the interactive game maps published under the RetroAtlas org, plus the ones that live on their own domains.

This repo is the landing page and nothing else. Each map is its own repository with its own extraction tooling, its own data and its own viewer; nothing here is shared code, and nothing here needs to be rebuilt when a map changes.

## Adding a map

Add one entry to [public/catalog.json](public/catalog.json). The page renders from that file, so there is no HTML to edit and no build step to run:

```json
{
 "id": "metalslug",
 "name": "Metal Slug Map",
 "franchise": "Metal Slug",
 "blurb": "One or two sentences on what the map shows.",
 "url": "https://metalslug.retroatlas.org/",
 "repo": "https://github.com/RetroAtlas/MetalSlugMap",
 "hosting": "atlas",
 "status": "in-progress",
 "started": "2026-07-21",
 "games": [{ "id": "msx", "name": "Metal Slug X", "platform": "PlayStation", "status": "complete" }]
}
```

`hosting` is the field that matters most. `atlas` means the map is published under `retroatlas.org` on a subdomain of its own, served by a repo in this org, and the card opens it in the same tab because it is the same brand. `external` means the map keeps a domain of its own, and the card opens it in a new tab and shows the host. `url` is absolute either way.

An `atlas` map needs its subdomain pointed at `retroatlas.github.io` and set as the repo's custom domain before the card resolves. Two things catch people out: the DNS target is the org site with no repo path on the end, and the record has to be unproxied until the certificate issues.

`status` is `live`, `in-progress`, `draft` or `planned`, from most finished to least, on the map and on each game independently. A planned map can sit in the catalog before it has anywhere to point.

`started` is the day of the first commit in the map's repo, as `YYYY-MM-DD`, which `git log --max-parents=0 --format=%as` prints. It is set once, when the map is added, and the card shows its month and year.

The page orders the cards by `status`, most finished first, then by `started`, oldest first, so where an entry sits in this file makes no difference.

`repo` is stored but never shown: a card is a single link and has no room for a second one. It is here for the same reason as `games` — this file is the only place that records where a map's source lives, which is what anything indexing the org would come here to read.

`games` is what makes the file worth more than the page it feeds: it is the machine-readable answer to which games are covered and on what hardware, which is what a shared navigation bar, a cross-map search or a future viewer library would each want to read.

## Running it

No build, no dependencies — the page is static and the modules are plain ES modules:

```bash
python3 -m http.server 8477 -d public
```

## Layout

- `public/` — the deployed site; the host serves this directory and nothing above it.
- `public/catalog.json` — the maps, and the only file that changes when one is added.
- `public/js/catalog.js` — loading, ordering and searching the catalog.
- `public/js/main.js` — renders the cards and wires the search box.
- `public/index.html`, `public/css/main.css` — the page and its styling.
- `tools/og.html` — the source the social card image is rendered from; repo-only, not deployed.
- `tools/banner.html`, `tools/banners.sh` — the profile banners for the social platforms, rendered into `tools/banners/`; repo-only too.

## Licensing

Copyright (C) 2026 mariobob, under GPL-2.0 (see [LICENSE](LICENSE)), matching the maps it indexes. The licence covers the code here and nothing else — the RetroAtlas name and wordmark are not licensed with it.

This repo holds no extracted game data; it is a card index. The maps it links to do hold it, and that material stays the property of its respective rights holders, presented for research and preservation. A rights holder who wants something taken down can write to hello@retroatlas.org.
