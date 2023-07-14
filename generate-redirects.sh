#!/bin/sh

yarn && yarn build

for INDEX in `find build -name index.html`; do
    DIR=${INDEX%index.html}
    URL="https://wiki.gear.foundation${DIR#build}"
    echo "-> $URL"
    echo "<html><head><meta http-equiv=\"refresh\" content=\"0; url=$URL\" /></head><body></body></html>" > $INDEX
done

echo "---\npermalink: /404.html\n---\n<html><head><meta http-equiv=\"refresh\" content=\"0; url=https://wiki.gear.foundation/\" /></head><body></body></html>" > build/404.html
