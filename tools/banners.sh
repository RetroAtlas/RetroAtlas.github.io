#!/usr/bin/env bash
# Renders tools/banner.html at each platform's banner size. Run from the repo root.
set -euo pipefail

chrome="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
src="$PWD/tools/banner.html"
out="tools/banners"

sizes=(
  "youtube 2048 1152"
  "patreon 2500 1000"
  "twitch 1200 480"
  "twitter 1500 500"
  "github 1280 640"
  "reddit 1920 384"
)

mkdir -p "$out"

for size in "${sizes[@]}"; do
  read -r name w h <<<"$size"
  "$chrome" --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --window-size="$w,$h" --screenshot="$out/$name.png" "$src" 2>/dev/null
  oxipng -q -o max --strip safe "$out/$name.png"
  printf '%-10s %sx%s  %s\n' "$name" "$w" "$h" "$(du -h "$out/$name.png" | cut -f1)"
done
