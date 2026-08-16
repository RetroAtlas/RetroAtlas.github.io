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
 "url": "/MetalSlugMap/",
 "repo": "https://github.com/RetroAtlas/MetalSlugMap",
 "hosting": "atlas",
 "status": "in-progress",
 "games": [{ "id": "msx", "name": "Metal Slug X", "platform": "PlayStation", "status": "complete" }]
}
```

`hosting` is the field that matters most. `atlas` means the map is a repo in this org and `url` is a path — GitHub Pages serves every repo in the org under the org site's domain, so `RetroAtlas/MetalSlugMap` is reachable at `/MetalSlugMap/` with no DNS of its own. `external` means the map keeps its own domain, `url` is absolute, and the card opens it in a new tab and shows the host.

`status` is `live`, `in-progress` or `planned`, on the map and on each game independently. A planned map can sit in the catalog before it has anywhere to point.

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
- `public/js/catalog.js` — loading and searching the catalog.
- `public/js/main.js` — renders the cards and wires the search box.
- `public/index.html`, `public/css/main.css` — the page and its styling.
- `tools/og.html` — the source the social card image is rendered from; repo-only, not deployed.

## Licensing

Copyright (C) 2026 mariobob, under GPL-2.0 (see [LICENSE](LICENSE)), matching the maps it indexes. Extracted imagery shown by those maps remains the property of its respective rights holders and is presented for research and preservation.
