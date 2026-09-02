#!/usr/bin/env bash
# Turns build/icon.png (1024pt master rendered by render-icon.js) into
# build/icon.icns. Run via `npm run icon`.
set -euo pipefail

cd "$(dirname "$0")"

if [[ ! -f icon.png ]]; then
  echo "icon.png missing — run 'electron build/render-icon.js' first." >&2
  exit 1
fi

mkdir -p icon.iconset

for pair in \
  16:icon_16x16 32:icon_16x16@2x \
  32:icon_32x32 64:icon_32x32@2x \
  128:icon_128x128 256:icon_128x128@2x \
  256:icon_256x256 512:icon_256x256@2x \
  512:icon_512x512 1024:icon_512x512@2x
do
  size="${pair%%:*}"
  name="${pair##*:}"
  sips -Z "$size" icon.png --out "icon.iconset/$name.png" > /dev/null
done

iconutil -c icns icon.iconset -o icon.icns
echo "wrote build/icon.icns"
