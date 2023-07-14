#!/bin/sh

rm -rvf html
yarn && yarn build

for INDEX in `find build -name index.html`; do
    OUT=${INDEX#build}
    DIR=${OUT%index.html}
    URL="https://wiki.gear.foundation$DIR"
    echo "-> $URL"
    mkdir -p html$DIR
    echo "<html><head><meta http-equiv=\"refresh\" content=\"0; url=$URL\" /></head><body></body></html>" > html$OUT
done

echo "---\npermalink: /404.html\n---\n<html><head><meta http-equiv=\"refresh\" content=\"0; url=https://wiki.gear.foundation/\" /></head><body></body></html>" > html/404.html
